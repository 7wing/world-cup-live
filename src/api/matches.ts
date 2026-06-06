// src/api/matches.ts

import { supabase } from '@/lib/supabase'
import type { Match, MatchStat, Lineup, MatchEvent, Prediction } from '@/types'

const MATCH_SELECT = `
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

export async function fetchStandings() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('group_letter')

  if (error) throw error
  return data
}

// ── match_stats ───────────────────────────────────────────────────────────────

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
    .order('position_y', { ascending: true })

  if (error) throw error
  return data as Lineup[]
}

// ── match_events ──────────────────────────────────────────────────────────────

export async function fetchMatchEvents(matchId: string): Promise<MatchEvent[]> {
  const { data, error } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId)
    .order('minute', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as MatchEvent[]
}

// ── h2h ───────────────────────────────────────────────────────────────────────

export async function fetchH2HMatches(
  homeTeamId: string,
  awayTeamId: string,
  limit = 10,
): Promise<Match[]> {
  // Supabase doesn't support OR across two AND conditions in a single .or(),
  // so we run two queries and merge client-side.
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

// ── predictions ───────────────────────────────────────────────────────────────

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