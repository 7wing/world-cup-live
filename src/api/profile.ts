import type { User as AuthUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User, Friendship, FanPhoto, PassportBadge, Prediction } from '@/types'

// ── User ──────────────────────────────────────────────────────────────────────

function isNotFoundError(error: { code?: string }): boolean {
  return error.code === 'PGRST116'
}

async function isUsernameTaken(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  if (error) return false
  return !!data
}

async function pickAvailableUsername(base: string): Promise<string> {
  const clean = base.replace(/\s+/g, '_').toLowerCase().slice(0, 24) || 'fan'
  if (!(await isUsernameTaken(clean))) return clean
  for (let i = 1; i <= 99; i++) {
    const candidate = `${clean}_${i}`
    if (!(await isUsernameTaken(candidate))) return candidate
  }
  return `${clean}_${Date.now().toString(36)}`
}

function defaultUsername(authUser: AuthUser): string {
  const fromMeta = authUser.user_metadata?.username
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
  const fromEmail = authUser.email?.split('@')[0]?.replace(/\W/g, '_')
  if (fromEmail) return fromEmail
  return `fan_${authUser.id.slice(0, 8)}`
}

/** Load profile row, creating it on first sign-in if missing. */
export async function ensureUserProfile(authUser: AuthUser): Promise<User> {
  try {
    return await fetchUserById(authUser.id)
  } catch (error) {
    if (!isNotFoundError(error as { code?: string })) throw error
  }

  const username = await pickAvailableUsername(defaultUsername(authUser))
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      username,
      avatar_url: null,
      tier: 'fan',
      xp: 0,
      global_rank: null,
      tribe_id: null,
    })
    .select()
    .single()

  if (error) {
    // Race: another tab created the row between our fetch and insert
    if (error.code === '23505') return fetchUserById(authUser.id)
    throw error
  }
  return data as User
}

export async function fetchUserById(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[fetchUserById] error:', error.message, '| code:', error.code)
    throw error
  }
  return data as User
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'username' | 'avatar_url'>>
): Promise<void> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id')
    .single()

  if (error) throw error
  if (!data) throw new Error(`[updateUserProfile] no user found for id: ${userId}`)
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const path = `${userId}/avatar-${Date.now()}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

// ── Friends ───────────────────────────────────────────────────────────────────

export async function fetchFriends(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, friend:users!friendships_friend_id_fkey(id, username, avatar_url, tier, xp)')
    .eq('user_id', userId)
    .eq('status', 'accepted')

  if (error) { console.error('[fetchFriends]', error.message); throw error }
  return data as Friendship[]
}

export async function sendFriendRequest(userId: string, friendId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
  if (error) throw error
}

// ── Photos ────────────────────────────────────────────────────────────────────

export async function fetchUserPhotos(userId: string): Promise<FanPhoto[]> {
  const { data, error } = await supabase
    .from('fan_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) { console.error('[fetchUserPhotos]', error.message); throw error }
  return data as FanPhoto[]
}

// ── Badges ────────────────────────────────────────────────────────────────────

export async function fetchUserBadges(userId: string): Promise<PassportBadge[]> {
  const { data, error } = await supabase
    .from('passport_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) throw error
  return data as PassportBadge[]
}

// ── Predictions ───────────────────────────────────────────────────────────────

export async function fetchPredictionHistory(userId: string): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*, match:matches(id, kickoff_at, status, home_team:teams!matches_home_team_id_fkey(name, code), away_team:teams!matches_away_team_id_fkey(name, code))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Prediction[]
}

export async function submitPrediction(
  pred: Pick<Prediction, 'user_id' | 'match_id' | 'predicted_home' | 'predicted_away'>
): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .upsert(pred, { onConflict: 'user_id,match_id' })
  if (error) throw error
}

export async function deletePrediction(predictionId: string): Promise<void> {
  const { error } = await supabase.from('predictions').delete().eq('id', predictionId)
  if (error) throw error
}