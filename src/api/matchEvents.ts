// src/api/matchEvents.ts
// Supabase queries for the match_events table.
// Used by: LiveFeed (MatchDetailSubComponents), MomentumChart, VibeMeter.

import { supabase } from '@/lib/supabase'

// --------------------------------------------------------------------------
// Types (aligned to DB schema exactly)
// --------------------------------------------------------------------------

export type MatchEventType =
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

export interface MatchEvent {
  id: string
  match_id: string
  team_id: string | null        // nullable per schema — neutral events have no team
  event_type: MatchEventType
  player_name: string | null
  player_in: string | null      // substitution only
  minute: number | null
  extra_time: boolean
  description: string | null
  created_at: string
}

// --------------------------------------------------------------------------
// Momentum bucket — one entry per 5-minute window, computed client-side
// --------------------------------------------------------------------------

export interface MomentumPoint {
  minute: number
  home: number   // 0-100 momentum score for that window
  away: number   // 0-100 momentum score for that window
}

// --------------------------------------------------------------------------
// fetchMatchEvents
// Returns all events for a match ordered by minute asc, then created_at asc.
// --------------------------------------------------------------------------

export async function fetchMatchEvents(matchId: string): Promise<MatchEvent[]> {
  const { data, error } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId)
    .order('minute',     { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as MatchEvent[]
}

// --------------------------------------------------------------------------
// buildMomentumSeries
// Converts raw events into a MomentumPoint[] suitable for MomentumChart.
// Scores each 5-minute bucket by event weight; normalises to 0-100.
//
// Weight map  (per event in the bucket):
//   goal       → 50   shot      → 6
//   penalty    → 20   corner    → 4
//   red_card   → 10   yellow_card → 2
//   substitution → 1
// --------------------------------------------------------------------------

const EVENT_WEIGHT: Partial<Record<MatchEventType, number>> = {
  goal:         50,
  penalty:      20,
  red_card:     10,
  shot:          6,
  corner:        4,
  yellow_card:   2,
  substitution:  1,
}

export function buildMomentumSeries(
  events: MatchEvent[],
  homeTeamId: string,
  bucketSize = 5,
  totalMinutes = 90,
): MomentumPoint[] {
  const buckets = Math.ceil(totalMinutes / bucketSize)
  const homeScores = new Array<number>(buckets).fill(0)
  const awayScores = new Array<number>(buckets).fill(0)

  for (const ev of events) {
    const min = ev.minute ?? 0
    const bucketIdx = Math.min(Math.floor(min / bucketSize), buckets - 1)
    const weight = EVENT_WEIGHT[ev.event_type] ?? 0
    if (weight === 0) continue

    if (ev.team_id === homeTeamId) {
      homeScores[bucketIdx] += weight
    } else if (ev.team_id !== null) {
      awayScores[bucketIdx] += weight
    }
  }

  // Normalise so the peak bucket across both teams = 100
  const peak = Math.max(...homeScores, ...awayScores, 1)

  return homeScores.map((h, i) => ({
    minute: i * bucketSize,
    home:   Math.round((h / peak) * 100),
    away:   Math.round((awayScores[i] / peak) * 100),
  }))
}