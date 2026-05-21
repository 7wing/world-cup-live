import { supabase } from '@/lib/supabase'
import { isMockDataEnabled } from '@/lib/mockMode'
import {
  fetchLocalPosts,
  createLocalPost,
  toggleLocalPostLike,
} from '@/lib/fanzoneStorage'
import type { Post, ChatMessage, Tribe } from '@/types'

export async function fetchPosts(matchId?: string, userId?: string): Promise<Post[]> {
  if (isMockDataEnabled()) {
    return fetchLocalPosts(matchId, userId ?? 'guest-local')
  }

  let query = supabase
    .from('posts')
    .select('*, user:users(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (matchId) query = query.eq('match_id', matchId)

  const { data, error } = await query
  if (error) throw error
  return data as Post[]
}

export async function createPost(
  post: Pick<Post, 'user_id' | 'content' | 'media_url' | 'media_type' | 'match_id'> & {
    user?: Post['user']
  },
): Promise<void> {
  if (isMockDataEnabled()) {
    createLocalPost(post)
    return
  }

  const { error } = await supabase.from('posts').insert(post)
  if (error) throw error
}

export async function togglePostLike(
  postId: string,
  userId: string,
  liked: boolean,
): Promise<void> {
  if (isMockDataEnabled()) {
    toggleLocalPostLike(postId, userId, liked)
    return
  }

  if (liked) {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
    const { data } = await supabase.from('posts').select('likes').eq('id', postId).single()
    if (data) await supabase.from('posts').update({ likes: data.likes + 1 }).eq('id', postId)
  } else {
    await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId })
    const { data } = await supabase.from('posts').select('likes').eq('id', postId).single()
    if (data) await supabase.from('posts').update({ likes: Math.max(0, data.likes - 1) }).eq('id', postId)
  }
}

export async function fetchChatMessages(matchId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, user:users(username, avatar_url)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) throw error
  return data as ChatMessage[]
}

export async function sendChatMessage(
  matchId: string,
  userId: string,
  content: string,
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .insert({ match_id: matchId, user_id: userId, content })

  if (error) throw error
}

export async function fetchTribes(): Promise<Tribe[]> {
  const { data, error } = await supabase
    .from('tribes')
    .select('*')
    .order('total_points', { ascending: false })

  if (error) throw error
  return data as Tribe[]
}

export async function joinTribe(userId: string, tribeId: string): Promise<void> {
  const { error } = await supabase
    .from('tribe_members')
    .insert({ user_id: userId, tribe_id: tribeId })
  if (error) throw error
}
