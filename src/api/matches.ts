import { supabase } from '@/lib/supabase'
import type { Match } from '@/types'

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      stadium:stadiums(*)
    `)
    .order('kickoff_at', { ascending: true })

  if (error) throw error
  return data as Match[]
}

export async function fetchLiveMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      stadium:stadiums(*)
    `)
    .eq('status', 'live')

  if (error) throw error
  return data as Match[]
}

export async function fetchMatchById(id: string): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*),
      stadium:stadiums(*)
    `)
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