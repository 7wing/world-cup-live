// src/api/games.ts
// Supabase queries for the Games hub — duel_sessions table.
// Trivia queries live in @/api/trivia.

import { supabase } from '@/lib/supabase'
import type { DuelSession, User } from '@/types'

export { fetchTriviaQuestions } from '@/api/trivia'

// ── Duel helpers ──────────────────────────────────────────────────────────────

export interface DuelStats {
  wins:   number
  losses: number
  total:  number
}

export interface RecentDuel {
  id:           string
  result:       'W' | 'L' | 'D'
  opponentName: string
  myScore:      number
  theirScore:   number
}

/**
 * Returns users who have played at least one duel — used as the
 * challenge-opponent list. Falls back to top-XP users.
 */
export async function fetchPotentialOpponents(userId: string): Promise<User[]> {
  // Get IDs of users who have duelled before (simple approximation of
  // "active duellists") — exclude the current user.
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, tier, xp, global_rank, tribe_id')
    .neq('id', userId)
    .order('xp', { ascending: false })
    .limit(10)

  if (error) { console.error('[fetchPotentialOpponents]', error.message); throw error }
  return (data ?? []) as User[]
}

export async function fetchUserDuelStats(userId: string): Promise<DuelStats> {
  const { data, error } = await supabase
    .from('duel_sessions')
    .select('challenger_id, opponent_id, challenger_score, opponent_score, status')
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .eq('status', 'finished')

  if (error) { console.error('[fetchUserDuelStats]', error.message); throw error }

  let wins = 0, losses = 0
  for (const d of data ?? []) {
    const iAmChallenger = d.challenger_id === userId
    const myScore    = iAmChallenger ? d.challenger_score : d.opponent_score
    const theirScore = iAmChallenger ? d.opponent_score   : d.challenger_score
    if (myScore > theirScore)      wins++
    else if (myScore < theirScore) losses++
  }

  return { wins, losses, total: (data ?? []).length }
}

export async function fetchRecentDuels(userId: string, limit = 5): Promise<RecentDuel[]> {
  const { data, error } = await supabase
    .from('duel_sessions')
    .select(`
      id,
      challenger_id,
      opponent_id,
      challenger_score,
      opponent_score,
      challenger:users!duel_sessions_challenger_id_fkey(username),
      opponent:users!duel_sessions_opponent_id_fkey(username)
    `)
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .eq('status', 'finished')
    .order('played_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('[fetchRecentDuels]', error.message); throw error }

  return (data ?? []).map((d) => {
    const iAmChallenger = d.challenger_id === userId
    const myScore    = iAmChallenger ? d.challenger_score : d.opponent_score
    const theirScore = iAmChallenger ? d.opponent_score   : d.challenger_score
    const opponentRaw = iAmChallenger ? d.opponent : d.challenger
    const opponentName = Array.isArray(opponentRaw) ? opponentRaw[0]?.username ?? 'Unknown'
    : (opponentRaw as { username?: string } | null)?.username ?? 'Unknown'

    const result: 'W' | 'L' | 'D' =
      myScore > theirScore ? 'W' : myScore < theirScore ? 'L' : 'D'

    return { id: d.id, result, opponentName, myScore, theirScore }
  })
}

/**
 * Returns the single active (pending or in-progress) duel for this user,
 * with challenger + opponent user objects joined.
 */
export async function fetchActiveDuel(
  userId: string
): Promise<(DuelSession & { challenger?: User; opponent?: User }) | null> {
  const { data, error } = await supabase
    .from('duel_sessions')
    .select(`
      *,
      challenger:users!duel_sessions_challenger_id_fkey(id, username, avatar_url, tier, xp, global_rank, tribe_id),
      opponent:users!duel_sessions_opponent_id_fkey(id, username, avatar_url, tier, xp, global_rank, tribe_id)
    `)
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) { console.error('[fetchActiveDuel]', error.message); throw error }
  return data as (DuelSession & { challenger?: User; opponent?: User }) | null
}

export async function createDuelChallenge(
  challengerId: string,
  opponentId: string
): Promise<void> {
  const { error } = await supabase
    .from('duel_sessions')
    .insert({ challenger_id: challengerId, opponent_id: opponentId, status: 'pending' })
  if (error) { console.error('[createDuelChallenge]', error.message); throw error }
}

export interface IncomingChallenge {
  id:           string
  challengerId: string
  challengerName: string
  createdAt:    string
}

export async function fetchIncomingChallenges(userId: string): Promise<IncomingChallenge[]> {
  const { data, error } = await supabase
    .from('duel_sessions')
    .select(`
      id,
      challenger_id,
      created_at,
      challenger:users!duel_sessions_challenger_id_fkey(username)
    `)
    .eq('opponent_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) { console.error('[fetchIncomingChallenges]', error.message); throw error }

  return (data ?? []).map((d) => {
    const challengerRaw = d.challenger
    const challengerName = Array.isArray(challengerRaw)
      ? challengerRaw[0]?.username ?? 'Unknown'
      : (challengerRaw as { username?: string } | null)?.username ?? 'Unknown'
    return { id: d.id, challengerId: d.challenger_id, challengerName, createdAt: d.created_at }
  })
}

export async function acceptDuel(duelId: string): Promise<void> {
  const { error } = await supabase
    .from('duel_sessions')
    .update({ status: 'active' })
    .eq('id', duelId)
  if (error) { console.error('[acceptDuel]', error.message); throw error }
}

export async function rejectDuel(duelId: string): Promise<void> {
  const { error } = await supabase
    .from('duel_sessions')
    .delete()
    .eq('id', duelId)
  if (error) { console.error('[rejectDuel]', error.message); throw error }
}