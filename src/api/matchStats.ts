// src/api/matchStats.ts
// Supabase queries for the match_stats table.
// One row per match, upserted from the data provider.
// Used by: MatchDetailPage Live Stats tab, StatBar rows.

import { supabase } from '@/lib/supabase'

// --------------------------------------------------------------------------
// Type — mirrors match_stats schema exactly.
// Every stat column is nullable (no NOT NULL in schema).
// --------------------------------------------------------------------------

export interface MatchStat {
  match_id:               string
  home_shots:             number | null
  away_shots:             number | null
  home_shots_on_target:   number | null
  away_shots_on_target:   number | null
  home_corners:           number | null
  away_corners:           number | null
  home_fouls:             number | null
  away_fouls:             number | null
  home_yellow_cards:      number | null
  away_yellow_cards:      number | null
  home_red_cards:         number | null
  away_red_cards:         number | null
  home_passes:            number | null
  away_passes:            number | null
  home_pass_accuracy:     number | null   // CHECK BETWEEN 0 AND 100
  away_pass_accuracy:     number | null   // CHECK BETWEEN 0 AND 100
  home_possession:        number | null   // CHECK BETWEEN 0 AND 100
  updated_at:             string
}

// --------------------------------------------------------------------------
// fetchMatchStats
// Returns null when no stats row exists yet for this match (pre-kickoff).
// --------------------------------------------------------------------------

export async function fetchMatchStats(matchId: string): Promise<MatchStat | null> {
  const { data, error } = await supabase
    .from('match_stats')
    .select('*')
    .eq('match_id', matchId)
    .maybeSingle()           // returns null instead of throwing when row absent

  if (error) throw error
  return data as MatchStat | null
}