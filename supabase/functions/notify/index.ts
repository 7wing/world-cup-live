// supabase/functions/notify/index.ts
// Supabase Edge Function — triggered by a Database Webhook on INSERT to match_events.
// Sends Web Push notifications to subscribed users who have alerts enabled for
// the relevant match / team.
//
// Deploy: supabase functions deploy notify
// Secrets needed (Supabase dashboard → Edge Functions → Secrets):
//   VAPID_PUBLIC_KEY          – from `npx web-push generate-vapid-keys`
//   VAPID_PRIVATE_KEY         – from the same command
//   VAPID_SUBJECT             – e.g. "mailto:admin@yourapp.com"
//   SUPABASE_URL              – injected automatically
//   SUPABASE_SERVICE_ROLE_KEY – injected automatically

import { serve }        from 'std/http/server'
import { createClient } from '@supabase/supabase-js'
import webpush          from 'web-push'

// --------------------------------------------------------------------------
// Types — aligned to match_events schema exactly
// --------------------------------------------------------------------------

interface MatchEvent {
  id:          string
  match_id:    string
  team_id:     string | null
  event_type:
    | 'goal'
    | 'yellow_card'
    | 'red_card'
    | 'substitution'
    | 'corner'
    | 'shot'
    | 'penalty'
    | 'kick_off'
    | 'half_time'
    | 'full_time'
  player_name: string | null
  player_in:   string | null
  minute:      number | null
  extra_time:  boolean
  description: string | null
  created_at:  string
}

interface PushSubscriptionRecord {
  id:       string
  user_id:  string
  endpoint: string
  p256dh:   string
  auth:     string
}

interface MatchAlertRecord {
  user_id:   string
  goals:     boolean
  red_cards: boolean
  kickoff:   boolean
  lineups:   boolean
}

interface WebhookPayload {
  type:        'INSERT' | 'UPDATE' | 'DELETE'
  table:       string
  schema:      string
  record:      MatchEvent
  old_record?: MatchEvent
}

// --------------------------------------------------------------------------
// Which event_type maps to which alert boolean column in match_alerts
// --------------------------------------------------------------------------

const EVENT_TO_ALERT_COL: Partial<Record<MatchEvent['event_type'], keyof MatchAlertRecord>> = {
  goal:      'goals',
  penalty:   'goals',
  red_card:  'red_cards',
  kick_off:  'kickoff',
  full_time: 'kickoff',
}

const NOTIFY_TYPES: MatchEvent['event_type'][] = [
  'goal',
  'red_card',
  'penalty',
  'kick_off',
  'full_time',
]

// --------------------------------------------------------------------------
// Notification label map
// --------------------------------------------------------------------------

const EVENT_LABELS: Partial<Record<MatchEvent['event_type'], { emoji: string; label: string }>> = {
  goal:         { emoji: '⚽', label: 'GOAL'        },
  red_card:     { emoji: '🟥', label: 'Red card'    },
  yellow_card:  { emoji: '🟨', label: 'Yellow card' },
  substitution: { emoji: '🔄', label: 'Sub'         },
  penalty:      { emoji: '🎯', label: 'Penalty'     },
  kick_off:     { emoji: '🏁', label: 'Kick-off'    },
  half_time:    { emoji: '⏸',  label: 'Half time'   },
  full_time:    { emoji: '🔔', label: 'Full time'   },
}

// --------------------------------------------------------------------------
// Build notification payload
// --------------------------------------------------------------------------

function buildNotification(
  event: MatchEvent,
  matchTitle: string,
): { title: string; body: string; url: string } {
  const meta   = EVENT_LABELS[event.event_type] ?? { emoji: '🏆', label: event.event_type }
  const minute = event.minute
    ? ` (${event.minute}${event.extra_time ? '+' : ''}')`
    : ''
  const player = event.player_name ? ` — ${event.player_name}` : ''

  return {
    title: `${meta.emoji} ${meta.label}${minute}`,
    body:  `${matchTitle}${player}`,
    url:   `/matches/${event.match_id}`,
  }
}

// --------------------------------------------------------------------------
// VAPID init — called once per invocation
// --------------------------------------------------------------------------

function initVapid() {
  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')     ?? 'mailto:admin@example.com',
    Deno.env.get('VAPID_PUBLIC_KEY')  ?? '',
    Deno.env.get('VAPID_PRIVATE_KEY') ?? '',
  )
}

// --------------------------------------------------------------------------
// Send a single Web Push notification
// --------------------------------------------------------------------------

async function sendPush(
  subscription: PushSubscriptionRecord,
  payload: object,
): Promise<void> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth:   subscription.auth,
        },
      },
      JSON.stringify(payload),
    )
  } catch (err) {
    console.error(`[notify] Push failed for ${subscription.user_id}:`, err)
  }
}

// --------------------------------------------------------------------------
// Handler
// --------------------------------------------------------------------------

serve(async (req: Request) => {
  try {
    const payload = (await req.json()) as WebhookPayload

    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const event = payload.record

    if (!NOTIFY_TYPES.includes(event.event_type)) {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'event_type not in NOTIFY_TYPES' }),
        { status: 200 },
      )
    }

    const alertCol = EVENT_TO_ALERT_COL[event.event_type]

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')              ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Resolve match title from FK-joined teams
    const { data: match } = await supabase
      .from('matches')
      .select(`
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `)
      .eq('id', event.match_id)
      .single()

    const homeTeamName = (match?.home_team as { name: string }[] | null)?.[0]?.name
    const awayTeamName = (match?.away_team as { name: string }[] | null)?.[0]?.name
    const matchTitle   = homeTeamName && awayTeamName
      ? `${homeTeamName} vs ${awayTeamName}`
      : 'Match update'

    // Find users subscribed to alerts for this match or team
    const alertQuery = supabase
      .from('match_alerts')
      .select('user_id, goals, red_cards, kickoff, lineups')

    const matchOrTeamFilter = event.team_id
      ? `match_id.eq.${event.match_id},team_id.eq.${event.team_id}`
      : `match_id.eq.${event.match_id}`

    const { data: alertRows } = await alertQuery.or(matchOrTeamFilter)

    if (!alertRows || alertRows.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    const eligibleUserIds = (alertRows as MatchAlertRecord[])
      .filter(row => alertCol === undefined || row[alertCol] === true)
      .map(row => row.user_id)

    if (eligibleUserIds.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, reason: 'no users with this alert type enabled' }),
        { status: 200 },
      )
    }

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth')
      .in('user_id', eligibleUserIds)

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
    }

    initVapid()

    const notification = buildNotification(event, matchTitle)

    await Promise.allSettled(
      (subscriptions as PushSubscriptionRecord[]).map(sub =>
        sendPush(sub, notification),
      ),
    )

    return new Response(
      JSON.stringify({ sent: subscriptions.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[notify] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 },
    )
  }
})