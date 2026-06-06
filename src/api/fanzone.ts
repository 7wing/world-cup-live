// src/api/fanzone.ts
// Supabase queries for: posts, post_likes, chat_messages, tribes, tribe_members.

import { supabase }              from '@/lib/supabase'
import type { Post, ChatMessage, Tribe } from '@/types'

// --------------------------------------------------------------------------
// Posts
// --------------------------------------------------------------------------

// fetchPosts — optional matchId filter + optional userId to resolve liked state.
// Joins users table for username / avatar_url on each post.
export async function fetchPosts(
  matchId?: string,
  userId?: string,
): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*, user:users(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (matchId) query = query.eq('match_id', matchId)

  const { data, error } = await query
  if (error) throw error

  const posts = (data ?? []) as Post[]

  // Resolve liked state for the current user in a single extra query
  if (userId && posts.length > 0) {
    const postIds = posts.map(p => p.id)
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)

    const likedSet = new Set((likes ?? []).map((l: { post_id: string }) => l.post_id))
    return posts.map(p => ({ ...p, liked: likedSet.has(p.id) }))
  }

  return posts
}

export async function createPost(
  post: Pick<Post, 'user_id' | 'content' | 'media_url' | 'media_type' | 'match_id'>,
): Promise<void> {
  const { error } = await supabase.from('posts').insert(post)
  if (error) throw error
}

// togglePostLike — upsert/delete post_likes row, then increment/decrement counter.
// Uses a read-then-write for the counter; replace with an RPC if race conditions matter.
export async function togglePostLike(
  postId: string,
  userId: string,
  liked: boolean,
): Promise<void> {
  if (liked) {
    const { error: insertError } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
    if (insertError) throw insertError

    const { data, error: selectError } = await supabase
      .from('posts').select('likes').eq('id', postId).single()
    if (selectError) throw selectError

    const { error: updateError } = await supabase
      .from('posts').update({ likes: data.likes + 1 }).eq('id', postId)
    if (updateError) throw updateError
  } else {
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, user_id: userId })
    if (deleteError) throw deleteError

    const { data, error: selectError } = await supabase
      .from('posts').select('likes').eq('id', postId).single()
    if (selectError) throw selectError

    const { error: updateError } = await supabase
      .from('posts').update({ likes: Math.max(0, data.likes - 1) }).eq('id', postId)
    if (updateError) throw updateError
  }
}

// --------------------------------------------------------------------------
// Chat messages
// --------------------------------------------------------------------------

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

// --------------------------------------------------------------------------
// Tribes & tribe_members
// --------------------------------------------------------------------------

export async function fetchTribes(): Promise<Tribe[]> {
  const { data, error } = await supabase
    .from('tribes')
    .select('*')
    .order('total_points', { ascending: false })

  if (error) throw error
  return data as Tribe[]
}

// joinTribe — inserts to tribe_members (PK: user_id + tribe_id prevents duplicates).
// Postgres error code 23505 = unique_violation: user is already a member.
// Treat that as a no-op success so the UI shows 'Joined ✓' rather than
// firing the generic error toast on a duplicate attempt.
export async function joinTribe(userId: string, tribeId: string): Promise<void> {
  const { error } = await supabase
    .from('tribe_members')
    .insert({ user_id: userId, tribe_id: tribeId })
  if (error && error.code !== '23505') throw error
}