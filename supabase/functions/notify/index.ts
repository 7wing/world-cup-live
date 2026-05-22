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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface MatchEvent {
  id: string;
  match_id: string;
  team_id: string;
  event_type:
    | "goal"
    | "red_card"
    | "yellow_card"
    | "substitution"
    | "penalty"
    | "kick_off"
    | "full_time";
  player_name?: string;
  minute?: number;
  extra_time?: boolean;
  description?: string;
}

interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: MatchEvent;
  old_record?: MatchEvent;
}

// --------------------------------------------------------------------------
// Event label map
// --------------------------------------------------------------------------

const EVENT_LABELS: Record<
  MatchEvent["event_type"],
  { emoji: string; label: string }
> = {
  goal:         { emoji: "⚽", label: "GOAL"        },
  red_card:     { emoji: "🟥", label: "Red card"    },
  yellow_card:  { emoji: "🟨", label: "Yellow card" },
  substitution: { emoji: "🔄", label: "Sub"         },
  penalty:      { emoji: "🎯", label: "Penalty"     },
  kick_off:     { emoji: "🏁", label: "Kick-off"    },
  full_time:    { emoji: "🔔", label: "Full time"   },
};

const NOTIFY_TYPES: MatchEvent["event_type"][] = [
  "goal",
  "red_card",
  "penalty",
  "kick_off",
  "full_time",
];

// --------------------------------------------------------------------------
// Build notification payload
// --------------------------------------------------------------------------

function buildNotification(
  event: MatchEvent,
  matchTitle: string
): { title: string; body: string; url: string } {
  const { emoji, label } =
    EVENT_LABELS[event.event_type] ?? { emoji: "🏆", label: event.event_type };
  const minute = event.minute
    ? ` (${event.minute}${event.extra_time ? "+" : ""}')`
    : "";
  const player = event.player_name ? ` — ${event.player_name}` : "";

  return {
    title: `${emoji} ${label}${minute}`,
    body: `${matchTitle}${player}`,
    url: `/matches/${event.match_id}`,
  };
}

// --------------------------------------------------------------------------
// Send a single Web Push notification
// --------------------------------------------------------------------------

async function sendPush(
  subscription: PushSubscriptionRecord,
  payload: object
): Promise<void> {
  const body = JSON.stringify(payload);

  const res = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
      // For production use https://deno.land/x/web_push to generate a real
      // VAPID JWT instead of this placeholder.
      Authorization: `vapid t=TODO_JWT,k=${Deno.env.get("VAPID_PUBLIC_KEY")}`,
    },
    body,
  });

  if (!res.ok && res.status !== 201) {
    console.error(
      `[notify] Push failed for ${subscription.user_id}: ${res.status}`
    );
  }
}

// --------------------------------------------------------------------------
// Handler
// --------------------------------------------------------------------------

serve(async (req: Request) => {
  try {
    const payload = (await req.json()) as WebhookPayload;

    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const event = payload.record;
    if (!NOTIFY_TYPES.includes(event.event_type)) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "event_type not in NOTIFY_TYPES" }),
        { status: 200 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: match } = await supabase
      .from("matches")
      .select("home_team_name, away_team_name")
      .eq("id", event.match_id)
      .single();

    const matchTitle = match
      ? `${match.home_team_name} vs ${match.away_team_name}`
      : "Match update";

    const { data: alertUsers } = await supabase
      .from("match_alerts")
      .select("user_id")
      .or(`match_id.eq.${event.match_id},team_id.eq.${event.team_id}`);

    if (!alertUsers || alertUsers.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    const userIds = alertUsers.map((a: { user_id: string }) => a.user_id);

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .in("user_id", userIds);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    const notification = buildNotification(event, matchTitle);
    await Promise.allSettled(
      subscriptions.map((sub: PushSubscriptionRecord) =>
        sendPush(sub, notification)
      )
    );

    return new Response(JSON.stringify({ sent: subscriptions.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[notify] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
});