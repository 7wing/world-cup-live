// src/api/lineups.ts
// Supabase queries for the lineups table.
// Used by: MatchDetailPage (Lineups tab, FormationPitch, Starting XI sidebar).

import { supabase } from '@/lib/supabase'
import type { Lineup } from '@/types'

// --------------------------------------------------------------------------
// fetchLineups
// Returns all lineup rows for a match — starters and subs — for both teams.
// Ordered: starters first, then by position (GK → DEF → MID → FWD).
// --------------------------------------------------------------------------

export async function fetchLineups(matchId: string): Promise<Lineup[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('match_id', matchId)
    .order('is_starter',    { ascending: false })
    .order('position',      { ascending: true, nullsLast: true })
    .order('player_number', { ascending: true, nullsLast: true })

  if (error) throw error
  return (data ?? []) as Lineup[]
}

// --------------------------------------------------------------------------
// fetchLineupsForTeam
// Convenience wrapper — returns only one team's rows from a match.
// Used when you need home or away XI independently.
// --------------------------------------------------------------------------

export async function fetchLineupsForTeam(
  matchId: string,
  teamId: string,
): Promise<Lineup[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('match_id', matchId)
    .eq('team_id', teamId)
    .order('is_starter',    { ascending: false })
    .order('position',      { ascending: true, nullsLast: true })
    .order('player_number', { ascending: true, nullsLast: true })

  if (error) throw error
  return (data ?? []) as Lineup[]
}