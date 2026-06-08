// src/lib/fantasyStorage.ts
// Fantasy squad persistence via Supabase.
// Replaces the old localStorage implementation.

import { supabase } from '@/lib/supabase'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface Player {
  id: string
  squad_id: string
  user_id: string
  name: string
  team: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  cost: number
  goals: number
  assists: number
  clean_sheet: boolean
  yellow_cards: number
  red_cards: number
  points: number
}

export interface FantasySquad {
  id: string
  user_id: string
  matchday_id: string
  locked_in: boolean
  total_points: number
  saved_at: string
  players: Player[]
}

// --------------------------------------------------------------------------
// Scoring
// --------------------------------------------------------------------------

export const SCORING_RULES = {
  goal_outfield:    6,
  goal_gk_def:      8,
  assist:           3,
  clean_sheet_gk_def: 4,
  clean_sheet_mid:  1,
  yellow_card:     -1,
  red_card:        -3,
} as const

export function calculatePoints(player: Pick<Player, 'position' | 'goals' | 'assists' | 'clean_sheet' | 'yellow_cards' | 'red_cards'>): number {
  let pts = 0
  const { goals, assists, clean_sheet, yellow_cards, red_cards, position } = player

  if (position === 'GK' || position === 'DEF') {
    pts += goals * SCORING_RULES.goal_gk_def
    if (clean_sheet) pts += SCORING_RULES.clean_sheet_gk_def
  } else if (position === 'MID') {
    pts += goals * SCORING_RULES.goal_outfield
    if (clean_sheet) pts += SCORING_RULES.clean_sheet_mid
  } else {
    pts += goals * SCORING_RULES.goal_outfield
  }

  pts += assists * SCORING_RULES.assist
  pts += yellow_cards * SCORING_RULES.yellow_card
  pts += red_cards * SCORING_RULES.red_card
  return pts
}

export function calculateSquadPoints(players: Player[]): number {
  return players.reduce((sum, p) => sum + calculatePoints(p), 0)
}

// --------------------------------------------------------------------------
// Squad queries
// --------------------------------------------------------------------------

export async function loadSquad(
  matchdayId: string,
  userId: string,
): Promise<FantasySquad | null> {
  const { data: squad, error } = await supabase
    .from('fantasy_squads')
    .select('*')
    .eq('user_id', userId)
    .eq('matchday_id', matchdayId)
    .maybeSingle()

  if (error) { console.error('[fantasyStorage] loadSquad:', error.message); return null }
  if (!squad) return null

  const { data: players, error: pErr } = await supabase
    .from('fantasy_players')
    .select('*')
    .eq('squad_id', squad.id)

  if (pErr) { console.error('[fantasyStorage] loadPlayers:', pErr.message); return null }

  return { ...squad, players: players ?? [] }
}

export async function listSquads(userId: string): Promise<FantasySquad[]> {
  const { data: squads, error } = await supabase
    .from('fantasy_squads')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })

  if (error) { console.error('[fantasyStorage] listSquads:', error.message); return [] }
  if (!squads?.length) return []

  const squadIds = squads.map(s => s.id)
  const { data: players } = await supabase
    .from('fantasy_players')
    .select('*')
    .in('squad_id', squadIds)

  const playersBySquad = (players ?? []).reduce<Record<string, Player[]>>((acc, p) => {
    acc[p.squad_id] = [...(acc[p.squad_id] ?? []), p]
    return acc
  }, {})

  return squads.map(s => ({ ...s, players: playersBySquad[s.id] ?? [] }))
}

// --------------------------------------------------------------------------
// Save squad (upsert squad row + replace players)
// --------------------------------------------------------------------------

export async function saveSquad(
  userId: string,
  matchdayId: string,
  players: Omit<Player, 'id' | 'squad_id' | 'user_id' | 'points'>[],
): Promise<FantasySquad | null> {
  const totalPoints = calculateSquadPoints(
    players.map(p => ({ ...p, points: 0, id: '', squad_id: '', user_id: '' }))
  )

  // Upsert squad row
  const { data: squad, error: squadErr } = await supabase
    .from('fantasy_squads')
    .upsert(
      { user_id: userId, matchday_id: matchdayId, total_points: totalPoints, saved_at: new Date().toISOString() },
      { onConflict: 'user_id,matchday_id' }
    )
    .select()
    .single()

  if (squadErr || !squad) {
    console.error('[fantasyStorage] saveSquad upsert:', squadErr?.message)
    return null
  }

  // Replace all players for this squad
  await supabase.from('fantasy_players').delete().eq('squad_id', squad.id)

  const playerRows = players.map(p => ({
    squad_id: squad.id,
    user_id:  userId,
    name:     p.name,
    team:     p.team,
    position: p.position,
    cost:     p.cost,
    goals:        p.goals ?? 0,
    assists:      p.assists ?? 0,
    clean_sheet:  p.clean_sheet ?? false,
    yellow_cards: p.yellow_cards ?? 0,
    red_cards:    p.red_cards ?? 0,
    points: calculatePoints(p),
  }))

  const { data: savedPlayers, error: pErr } = await supabase
    .from('fantasy_players')
    .insert(playerRows)
    .select()

  if (pErr) {
    console.error('[fantasyStorage] saveSquad players:', pErr.message)
    return null
  }

  return { ...squad, players: savedPlayers ?? [] }
}

// --------------------------------------------------------------------------
// Lock squad
// --------------------------------------------------------------------------

export async function lockSquad(squadId: string): Promise<void> {
  const { error } = await supabase
    .from('fantasy_squads')
    .update({ locked_in: true })
    .eq('id', squadId)
  if (error) throw error
}

// --------------------------------------------------------------------------
// Delete squad
// --------------------------------------------------------------------------

export async function deleteSquad(matchdayId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('fantasy_squads')
    .delete()
    .eq('user_id', userId)
    .eq('matchday_id', matchdayId)
  if (error) throw error
}