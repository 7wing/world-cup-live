import { supabase } from '@/lib/supabase'
import { isMockProfileEnabled, MOCK_PROFILE } from '@/lib/mockProfile'
import type { User, Friendship, FanPhoto } from '@/types'

export async function fetchUserById(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[fetchUserById] error:', error.message, '| code:', error.code)
    if (isMockProfileEnabled()) {
      return { ...MOCK_PROFILE, id: userId }
    }
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

export async function fetchFriends(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, friend:users!friendships_friend_id_fkey(id, username, avatar_url, tier, xp)')
    .eq('user_id', userId)
    .eq('status', 'accepted')

  if (error) {
    console.error('[fetchFriends] error:', error.message)
    throw error
  }
  return data as Friendship[]
}

export async function sendFriendRequest(userId: string, friendId: string): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
  if (error) throw error
}

export async function fetchUserPhotos(userId: string): Promise<FanPhoto[]> {
  const { data, error } = await supabase
    .from('fan_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchUserPhotos] error:', error.message)
    throw error
  }
  return data as FanPhoto[]
}