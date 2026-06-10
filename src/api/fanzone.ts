// src/api/fanzone.ts
// Supabase queries for: posts, post_likes, post_comments, chat_messages,
// tribes, tribe_members, watch_parties, party_messages, players, fantasy_squads.

import { supabase }              from '@/lib/supabase'
import type { Post, ChatMessage, Tribe, TribeMemberUser } from '@/types'

// --------------------------------------------------------------------------
// Posts
// --------------------------------------------------------------------------
// Friendships (used for Following feed filter)
// --------------------------------------------------------------------------

export async function fetchFriendIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted')

  if (error) throw error
  return (data ?? []).map((r: { friend_id: string }) => r.friend_id)
}

// --------------------------------------------------------------------------
// Posts
// --------------------------------------------------------------------------

export async function fetchPosts(params: {
  matchId?: string
  userId?: string
  friendIds?: string[]
  cursor?: string | null
  limit?: number
} = {}): Promise<{ posts: Post[]; nextCursor: string | null }> {
  const { matchId, userId, friendIds, cursor, limit = 10 } = params

  let query = supabase
    .from('posts')
    .select('*, user:users(id, username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (matchId) query = query.eq('match_id', matchId)

  // Following filter: posts from friends + own posts
  if (friendIds && friendIds.length > 0) {
    query = query.in('user_id', friendIds)
  }

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw error

  const raw = (data ?? []) as Post[]
  // Detect if there's a next page
  const hasNext = raw.length > limit
  const posts = hasNext ? raw.slice(0, limit) : raw
  const nextCursor = hasNext && posts.length > 0 ? posts[posts.length - 1].created_at : null

  if (userId && posts.length > 0) {
    const postIds = posts.map(p => p.id)
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)

    const likedSet = new Set((likes ?? []).map((l: { post_id: string }) => l.post_id))
    return {
      posts: posts.map(p => ({ ...p, liked: likedSet.has(p.id) })),
      nextCursor,
    }
  }

  return { posts, nextCursor }
}

export async function createPost(
  post: Pick<Post, 'user_id' | 'content' | 'media_url' | 'media_type' | 'match_id'>,
): Promise<void> {
  const { error } = await supabase.from('posts').insert(post)
  if (error) throw error
}

export async function togglePostLike(
  postId: string,
  userId: string,
  liked: boolean,
): Promise<boolean> {
  if (liked) {
    // Already liked — unlike: delete the post_likes row, DB trigger decrements posts.likes
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, user_id: userId })
    if (error) throw error
    return false
  } else {
    // Not liked yet — like: insert post_likes row, DB trigger increments posts.likes
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
    if (error) throw error
    return true
  }
}

// --------------------------------------------------------------------------
// Post Comments
// --------------------------------------------------------------------------

export interface PostComment {
  id:         string
  post_id:    string
  user_id:    string
  user?:      { username: string; avatar_url: string | null }
  content:    string
  created_at: string
}

export async function fetchPostComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, user:users(username, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) throw error
  return data as PostComment[]
}

export async function createPostComment(
  postId: string,
  userId: string,
  content: string,
): Promise<PostComment> {
  // Insert comment; DB trigger will increment posts.comment_count
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select('*, user:users(username, avatar_url)')
    .single()

  if (error) throw error
  return data as PostComment
}

// --------------------------------------------------------------------------
// Chat messages (match chat)
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
// Party messages (watch party chat — separate from match chat)
// --------------------------------------------------------------------------

export interface PartyMessage {
  id:         string
  party_id:   string
  user_id:    string
  user?:      { username: string; avatar_url: string | null }
  content:    string
  created_at: string
}

export async function fetchPartyMessages(partyId: string): Promise<PartyMessage[]> {
  const { data, error } = await supabase
    .from('party_messages')
    .select('*, user:users(username, avatar_url)')
    .eq('party_id', partyId)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) throw error
  return data as PartyMessage[]
}

export async function sendPartyMessage(
  partyId: string,
  userId: string,
  content: string,
): Promise<void> {
  // DB trigger `party_message_insert` handles last_message / last_msg_at update.
  // DB trigger `update_watch_party_last_message` updates watch_parties on INSERT.
  const { error } = await supabase
    .from('party_messages')
    .insert({ party_id: partyId, user_id: userId, content })
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

export async function fetchTribeById(tribeId: string): Promise<Tribe> {
  const { data, error } = await supabase
    .from('tribes')
    .select('*')
    .eq('id', tribeId)
    .single()

  if (error) throw error
  return data as Tribe
}

export async function fetchTribeMembers(tribeId: string): Promise<TribeMemberUser[]> {
  const { data, error } = await supabase
    .from('tribe_members')
    .select(`
      *,
      user:users(id, username, avatar_url, tier, xp, global_rank)
    `)
    .eq('tribe_id', tribeId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data as TribeMemberUser[]
}

export async function joinTribe(userId: string, tribeId: string): Promise<void> {
  const { error } = await supabase
    .from('tribe_members')
    .insert({ user_id: userId, tribe_id: tribeId })
  if (error && error.code !== '23505') throw error
}

// --------------------------------------------------------------------------
// Watch Parties
// --------------------------------------------------------------------------

export interface WatchParty {
  id:           string
  name:         string
  flag:         string
  match_id:     string | null
  created_by:   string | null
  viewer_count: number
  last_message: string | null
  last_msg_at:  string | null
  created_at:   string
}

export async function fetchWatchParties(): Promise<WatchParty[]> {
  const { data, error } = await supabase
    .from('watch_parties')
    .select('*')
    .order('last_msg_at', { ascending: false, nullsFirst: false })
    .limit(10)

  if (error) throw error
  return data as WatchParty[]
}

export async function createWatchParty(
  party: Pick<WatchParty, 'name' | 'flag' | 'match_id' | 'created_by'>,
): Promise<WatchParty> {
  try {
    const { data, error } = await supabase
      .from('watch_parties')
      .insert(party)
      .select()
      .single()

    if (error) throw error
    return data as WatchParty
  } catch (err: unknown) {
    // PostgreSQL unique_violation code 23505 — unique_watch_party_name constraint
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === '23505') {
      throw new Error('A party with this name already exists.', { cause: err })
    }
    throw err
  }
}

// --------------------------------------------------------------------------
// Players (fantasy pool)
// --------------------------------------------------------------------------

export interface Player {
  id:       string
  name:     string
  team:     string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  cost:     number
}

export async function fetchPlayers(position?: Player['position']): Promise<Player[]> {
  let query = supabase
    .from('players')
    .select('id, name, team, position, cost')
    .order('cost', { ascending: false })

  if (position) query = query.eq('position', position)

  const { data, error } = await query
  if (error) throw error
  return data as Player[]
}

// --------------------------------------------------------------------------
// Fantasy squads
// --------------------------------------------------------------------------

export interface FantasySquad {
  id:           string
  user_id:      string
  matchday_id:  string
  locked_in:    boolean
  total_points: number
  saved_at:     string
}

export interface FantasySquadPlayer {
  id:           string
  squad_id:     string
  user_id:      string
  name:         string
  team:         string
  position:     'GK' | 'DEF' | 'MID' | 'FWD'
  cost:         number
  goals:        number
  assists:      number
  clean_sheet:  boolean
  yellow_cards: number
  red_cards:    number
  points:       number
}

export async function fetchFantasySquad(
  userId: string,
  matchdayId: string,
): Promise<{ squad: FantasySquad; players: FantasySquadPlayer[] } | null> {
  const { data: squad, error: squadError } = await supabase
    .from('fantasy_squads')
    .select('*')
    .eq('user_id', userId)
    .eq('matchday_id', matchdayId)
    .single()

  if (squadError || !squad) return null

  const { data: players, error: playersError } = await supabase
    .from('fantasy_players')
    .select('*')
    .eq('squad_id', squad.id)

  if (playersError) throw playersError

  return { squad, players: players as FantasySquadPlayer[] }
}

export async function saveFantasySquad(
  userId: string,
  matchdayId: string,
  players: Player[],
  lockedIn: boolean,
): Promise<void> {
  const savedAt = new Date().toISOString()

  // Upsert the squad row
  const { data: squad, error: squadError } = await supabase
    .from('fantasy_squads')
    .upsert(
      { user_id: userId, matchday_id: matchdayId, locked_in: lockedIn, total_points: 0, saved_at: savedAt },
      { onConflict: 'user_id,matchday_id' },
    )
    .select()
    .single()

  if (squadError) throw squadError

  // Delete old player rows and re-insert fresh
  await supabase.from('fantasy_players').delete().eq('squad_id', squad.id)

  if (players.length > 0) {
    const rows = players.map(p => ({
      squad_id:     squad.id,
      user_id:      userId,
      name:         p.name,
      team:         p.team,
      position:     p.position,
      cost:         p.cost,
      goals:        0,
      assists:      0,
      clean_sheet:  false,
      yellow_cards: 0,
      red_cards:    0,
      points:       0,
    }))

    const { error: insertError } = await supabase.from('fantasy_players').insert(rows)
    if (insertError) throw insertError
  }
}