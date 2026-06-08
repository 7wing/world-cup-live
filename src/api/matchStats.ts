// src/api/matchStats.ts
// Supabase queries for the match_stats table.
// One row per match, upserted from the data provider after kickoff.
// Used by: MatchDetailPage Live Stats tab, StatBar rows.
//
// NOTE: home_possession lives on the `matches` table, NOT here.
//       Read it from match.home_possession in MatchDetailPage.

import { supabase } from '@/lib/supabase'
import type { MatchStat } from '@/api/matches'

export type { MatchStat }

// ── fetchMatchStats ───────────────────────────────────────────────────────────
// Returns null when no stats row exists yet (pre-kickoff is normal).

export async function fetchMatchStats(matchId: string): Promise<MatchStat | null> {
  const { data, error } = await supabase
    .from('match_stats')
    .select('*')
    .eq('match_id', matchId)
    .maybeSingle()

  if (error) throw error
  return data as MatchStat | null
}