// src/api/miniLeague.ts
import { supabase } from '@/lib/supabase'

export interface LeagueEntry {
  rank:    number
  userId:  string
  name:    string
  correct: number
  pts:     number
  trend:   'up' | 'down' | 'same'
  you?:    boolean
}

/**
 * Build a mini-league leaderboard from the predictions table.
 * Ranks by total points_earned DESC.
 */
export async function fetchMiniLeague(currentUserId?: string): Promise<LeagueEntry[]> {
  // Aggregate points_earned per user from predictions
  const { data, error } = await supabase
    .from('predictions')
    .select('user_id, points_earned, is_correct, users!inner(username)')
    .limit(500)
    .order('points_earned', { ascending: false })

  if (error) { console.error('[fetchMiniLeague]', error.message); throw error }

  // Group by user
  const map = new Map<string, { name: string; pts: number; correct: number }>()
  for (const row of data ?? []) {
    const userId = row.user_id
    const uname  = (row.users as unknown as { username: string }).username
    const prev   = map.get(userId) ?? { name: uname, pts: 0, correct: 0 }
    map.set(userId, {
      name:    uname,
      pts:     prev.pts + (row.points_earned ?? 0),
      correct: prev.correct + (row.is_correct ? 1 : 0),
    })
  }

  // Sort + rank
  const sorted = [...map.entries()]
    .sort((a, b) => b[1].pts - a[1].pts)
    .slice(0, 10)

  return sorted.map(([userId, stats], idx) => ({
    rank:    idx + 1,
    userId,
    name:    stats.name,
    correct: stats.correct,
    pts:     stats.pts,
    trend:   'same' as const, // trend requires historical snapshot — placeholder
    you:     userId === currentUserId,
  }))
}