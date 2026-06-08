// src/api/matches.ts
// Single source of truth for all match-related Supabase queries.
// hooks/useMatches.ts imports from here — do NOT duplicate logic there.

import { supabase } from '@/lib/supabase'
import type { Match, Lineup, MatchEvent, Prediction } from '@/types'

// ── Shared select fragment ────────────────────────────────────────────────────
// Used everywhere we need a fully-hydrated Match object.
export const MATCH_SELECT = `
  *,
  home_team:teams!matches_home_team_id_fkey(*),
  away_team:teams!matches_away_team_id_fkey(*),
  stadium:stadiums(*)
`

// ── Core match queries ────────────────────────────────────────────────────────

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .order('kickoff_at', { ascending: true })

  if (error) throw error
  return data as Match[]
}

export async function fetchLiveMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('status', 'live')

  if (error) throw error
  return data as Match[]
}

export async function fetchMatchById(id: string): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Match
}

// ── Standings (teams ordered by group) ───────────────────────────────────────

export async function fetchStandings() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('group_letter')

  if (error) throw error
  return data
}

// ── match_stats ───────────────────────────────────────────────────────────────
// match_stats has one row per match. Returns null pre-kickoff (no row yet).

export async function fetchMatchStats(matchId: string): Promise<MatchStat | null> {
  const { data, error } = await supabase
    .from('match_stats')
    .select('*')
    .eq('match_id', matchId)
    .maybeSingle()

  if (error) throw error
  return data as MatchStat | null
}

// ── lineups ───────────────────────────────────────────────────────────────────

export async function fetchLineups(matchId: string): Promise<Lineup[]> {
  const { data, error } = await supabase
    .from('lineups')
    .select('*')
    .eq('match_id', matchId)
    .order('is_starter', { ascending: false })
    .order('position_y', { ascending: true })

  if (error) throw error
  return (data ?? []) as Lineup[]
}

// ── match_events ──────────────────────────────────────────────────────────────

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

// ── Head-to-head ──────────────────────────────────────────────────────────────
// Supabase doesn't support OR across two AND conditions in a single .or(),
// so we run two queries and merge + sort client-side.

export async function fetchH2HMatches(
  homeTeamId: string,
  awayTeamId: string,
  limit = 10,
): Promise<Match[]> {
  const [a, b] = await Promise.all([
    supabase
      .from('matches')
      .select(MATCH_SELECT)
      .eq('home_team_id', homeTeamId)
      .eq('away_team_id', awayTeamId)
      .eq('status', 'finished')
      .order('kickoff_at', { ascending: false })
      .limit(limit),
    supabase
      .from('matches')
      .select(MATCH_SELECT)
      .eq('home_team_id', awayTeamId)
      .eq('away_team_id', homeTeamId)
      .eq('status', 'finished')
      .order('kickoff_at', { ascending: false })
      .limit(limit),
  ])

  if (a.error) throw a.error
  if (b.error) throw b.error

  const all = [...(a.data ?? []), ...(b.data ?? [])] as Match[]
  return all
    .sort((x, y) => new Date(y.kickoff_at).getTime() - new Date(x.kickoff_at).getTime())
    .slice(0, limit)
}

// ── Predictions ───────────────────────────────────────────────────────────────

export async function fetchMyPrediction(
  userId: string,
  matchId: string,
): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .maybeSingle()

  if (error) throw error
  return data as Prediction | null
}

export async function submitMatchPrediction(pred: {
  user_id: string
  match_id: string
  predicted_home: number
  predicted_away: number
}): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .upsert(pred, { onConflict: 'user_id,match_id' })

  if (error) throw error
}

export async function fetchUserPredictionsForMatches(
  userId: string,
  matchIds: string[],
): Promise<Prediction[]> {
  if (!matchIds.length) return []

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .in('match_id', matchIds)

  if (error) throw error
  return data as Prediction[]
}

// ── Re-export MatchStat type (defined here, used by hooks & page) ─────────────
// Mirrors match_stats schema exactly. Every stat column is nullable
// (no data pre-kickoff). home_possession lives on `matches`, NOT here.

export interface MatchStat {
  match_id:             string
  home_shots:           number | null
  away_shots:           number | null
  home_shots_on_target: number | null
  away_shots_on_target: number | null
  home_corners:         number | null
  away_corners:         number | null
  home_fouls:           number | null
  away_fouls:           number | null
  home_yellow_cards:    number | null
  away_yellow_cards:    number | null
  home_red_cards:       number | null
  away_red_cards:       number | null
  home_passes:          number | null
  away_passes:          number | null
  home_pass_accuracy:   number | null   // 0–100
  away_pass_accuracy:   number | null   // 0–100
  updated_at:           string
}