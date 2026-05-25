import { supabase } from '@/lib/supabase'
import { isMockProfileEnabled, MOCK_PROFILE } from '@/lib/mockProfile'
import type { User, Friendship, FanPhoto, PassportBadge, Prediction } from '@/types'

// ── User ──────────────────────────────────────────────────────────────────────

export async function fetchUserById(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[fetchUserById] error:', error.message, '| code:', error.code)
    if (isMockProfileEnabled()) return { ...MOCK_PROFILE, id: userId }
    throw error
  }
  return data as User
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'username' | 'avatar_url'>>
): Promise<void> {
  const { error } = await supabase.from('users').update(updates).eq('id', userId)
  if (error) throw error
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