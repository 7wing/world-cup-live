import { MOCK_POSTS } from '@/utils/mockData'
import { mockPostToPost } from '@/lib/mockAdapters'
import type { Post } from '@/types'

const POSTS_KEY = 'wcl-fanzone-posts'
const LIKES_KEY = 'wcl-fanzone-liked'

function readLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeLikedIds(ids: Set<string>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...ids]))
}

function seedPosts(): Post[] {
  return MOCK_POSTS.map((p) => mockPostToPost(p))
}

function readRawPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (!raw) {
      const seeded = seedPosts()
      localStorage.setItem(POSTS_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw) as Post[]
  } catch {
    const seeded = seedPosts()
    localStorage.setItem(POSTS_KEY, JSON.stringify(seeded))
    return seeded
  }
}

function writePosts(posts: Post[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

function applyLikedState(posts: Post[], userId: string): Post[] {
  const liked = readLikedIds()
  return posts.map((p) => ({
    ...p,
    liked: liked.has(`${userId}:${p.id}`),
  }))
}

export function fetchLocalPosts(matchId?: string, userId = 'guest-local'): Post[] {
  let posts = readRawPosts()
  if (matchId) posts = posts.filter((p) => p.match_id === matchId)
  return applyLikedState(posts, userId)
}

export function createLocalPost(
  post: Pick<Post, 'user_id' | 'content' | 'media_url' | 'media_type' | 'match_id'> & {
    user?: Post['user']
  },
): Post {
  const posts = readRawPosts()
  const newPost: Post = {
    id: `post-${Date.now()}`,
    user_id: post.user_id,
    user: post.user,
    match_id: post.match_id,
    content: post.content,
    media_url: post.media_url,
    media_type: post.media_type,
    likes: 0,
    comment_count: 0,
    is_official: false,
    created_at: new Date().toISOString(),
    liked: false,
  }
  writePosts([newPost, ...posts])
  return newPost
}

export function toggleLocalPostLike(
  postId: string,
  userId: string,
  liked: boolean,
): void {
  const posts = readRawPosts()
  const key = `${userId}:${postId}`
  const likedSet = readLikedIds()
  const idx = posts.findIndex((p) => p.id === postId)
  if (idx < 0) return

  if (liked) {
    if (!likedSet.has(key)) {
      likedSet.add(key)
      posts[idx] = { ...posts[idx], likes: posts[idx].likes + 1 }
    }
  } else {
    if (likedSet.has(key)) {
      likedSet.delete(key)
      posts[idx] = { ...posts[idx], likes: Math.max(0, posts[idx].likes - 1) }
    }
  }

  writeLikedIds(likedSet)
  writePosts(posts)
}

export function filterPosts(posts: Post[], filter: 'all' | 'trending' | 'following'): Post[] {
  if (filter === 'trending') {
    return [...posts].sort((a, b) => b.likes - a.likes)
  }
  if (filter === 'following') {
    return posts.filter((p) => p.is_official || p.user?.username === 'You')
  }
  return posts
}
