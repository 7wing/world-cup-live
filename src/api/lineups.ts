// src/api/lineups.ts
// Supabase queries for the lineups table.
// Used by: MatchDetailPage (Lineups tab, FormationPitch, Starting XI sidebar).

import { supabase } from '@/lib/supabase'
import type { Lineup } from '@/types'

// ── fetchLineups ──────────────────────────────────────────────────────────────
// Returns all lineup rows for a match (starters + subs, both teams).
// Order: starters first, then by pitch position Y (top → bottom), then shirt number.

export async function fetchLineups(matchId: string): Promise<Lineup[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('match_id', matchId)
    .order('is_starter',     { ascending: false })
    .order('position_y',     { ascending: true  })
    .order('player_number',  { ascending: true  })

  if (error) throw error
  return (data ?? []) as Lineup[]
}

// ── fetchLineupsForTeam ───────────────────────────────────────────────────────
// Convenience: one team only. Used when you only need one side (e.g. sidebar list).

export async function fetchLineupsForTeam(
  matchId: string,
  teamId:  string,
): Promise<Lineup[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('match_id',   matchId)
    .eq('team_id',    teamId)
    .order('is_starter',    { ascending: false })
    .order('position_y',    { ascending: true  })
    .order('player_number', { ascending: true  })

  if (error) throw error
  return (data ?? []) as Lineup[]
}