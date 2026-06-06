// src/lib/matchAlerts.ts
// Global alert preference store — persists to localStorage.
// Key names must match match_alerts table column names exactly:
//   goals | red_cards | lineups | kickoff
//
// Per-match Supabase writes are handled by useSubscribeMatchAlert (src/hooks/useMatchAlerts.ts)
// which is called from MatchDetailPage when a user opts in to a specific match.

import { supabase } from '@/lib/supabase'

// AlertKey is a union of the actual match_alerts boolean column names.
export type AlertKey = 'goals' | 'red_cards' | 'lineups' | 'kickoff'

export const MATCH_ALERT_OPTIONS: { key: AlertKey; label: string; icon: string }[] = [
  { key: 'goals',     label: 'Goals',            icon: 'sports_soccer'  },
  { key: 'red_cards', label: 'Red Cards',         icon: 'square'         },
  { key: 'lineups',   label: 'Line-up Release',   icon: 'groups'         },
  { key: 'kickoff',   label: 'Kick-off Reminder', icon: 'notifications'  },
]

const STORAGE_KEY = 'wcl-match-alerts'

export const DEFAULT_ALERTS: Record<AlertKey, boolean> = {
  goals:     true,
  red_cards: true,
  lineups:   false,
  kickoff:   true,
}

export function loadMatchAlerts(): Record<AlertKey, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ALERTS }
    return { ...DEFAULT_ALERTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_ALERTS }
  }
}

export function saveMatchAlerts(alerts: Record<AlertKey, boolean>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

/**
 * Upsert a match_alerts row for a specific match so the notify Edge Function
 * can find this user's preferences.
 * Called by useSubscribeMatchAlert when a user enables alerts on a match detail page.
 *
 * PK is (user_id, match_id) — safe to call repeatedly; upsert is idempotent.
 */
export async function syncMatchAlertToSupabase(
  userId: string,
  matchId: string,
  alerts: Record<AlertKey, boolean>,
): Promise<void> {
  const { error } = await supabase
    .from('match_alerts')
    .upsert(
      {
        user_id:   userId,
        match_id:  matchId,
        goals:     alerts.goals,
        red_cards: alerts.red_cards,
        lineups:   alerts.lineups,
        kickoff:   alerts.kickoff,
      },
      { onConflict: 'user_id,match_id' },
    )

  if (error) {
    console.error('[matchAlerts] Failed to sync to Supabase:', error.message)
    throw error
  }
}