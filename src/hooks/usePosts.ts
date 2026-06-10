import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPosts,
  fetchFriendIds,
  createPost,
  togglePostLike,
  createPostComment,
  type PostComment,
} from '@/api/fanzone'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { getEffectiveUser } from '@/lib/guestUser'
import type { Post } from '@/types'

// ─── Posts with infinite scroll ─────────────────────────────────────────────

export type FeedFilterType = 'All' | 'Trending' | 'Following'

interface UsePostsOptions {
  matchId?: string
  filter?: FeedFilterType
}

export function usePosts({ matchId, filter = 'All' }: UsePostsOptions = {}) {
  const { user } = useAuthStore()
  const effective = getEffectiveUser(user)

  return useInfiniteQuery({
    queryKey: ['posts', filter, matchId ?? 'all', effective?.id],
    queryFn: async ({ pageParam }) => {
      let friendIds: string[] | undefined

      if (filter === 'Following' && effective?.id) {
        // Include self + friends for Following tab
        const friendList = await fetchFriendIds(effective.id)
        friendIds = [effective.id, ...friendList]
      }

      return fetchPosts({
        matchId,
        userId: effective?.id,
        friendIds,
        cursor: pageParam ?? null,
        limit: 10,
      })
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: 20_000,
  })
}

// ─── Create post ─────────────────────────────────────────────────────────────

export function useCreatePost() {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate all post queries to refetch fresh data
      qc.invalidateQueries({ queryKey: ['posts'] })
      push('Post shared!', 'success')
    },
    onError: () => push('Failed to post', 'error'),
  })
}

// ─── Toggle like with optimistic update ─────────────────────────────────────

export function useToggleLike() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      postId,
      userId,
      liked,
    }: {
      postId: string
      userId: string
      liked: boolean
    }) => togglePostLike(postId, userId, liked),

    onMutate: async ({ postId, liked }) => {
      // Snapshot all active post query caches so we can rollback
      const queries = qc.getQueriesData<{ pages: { posts: Post[] }[] }>({ queryKey: ['posts'] })
      const snapshots = new Map(queries.map(([k, v]) => [k, v]))

      // Optimistically update every matching query cache
      qc.setQueriesData<{ pages: { posts: Post[] }[] }>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? { ...p, liked: !liked, likes: liked ? Math.max(0, p.likes - 1) : p.likes + 1 }
                  : p,
              ),
            })),
          }
        },
      )

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      // Rollback all snapshots on failure
      if (context?.snapshots) {
        for (const [key, value] of context.snapshots) {
          qc.setQueryData(key, value)
        }
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

// ─── Create comment with optimistic update ──────────────────────────────────

export function useCreateComment(postId: string) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const effective = getEffectiveUser(user)

  return useMutation({
    mutationFn: (content: string) => {
      if (!effective) throw new Error('Not authenticated')
      return createPostComment(postId, effective.id, content)
    },

    onMutate: async (content: string) => {
      // Snapshot comment lists and post comment counts
      const queries = qc.getQueriesData<{ pages: { posts: Post[] }[] }>({ queryKey: ['posts'] })
      const snapshots = new Map(queries.map(([k, v]) => [k, v]))

      const optimisticComment: PostComment = {
        id: `optimistic-${Date.now()}`,
        post_id: postId,
        user_id: effective!.id,
        user: { username: effective!.username, avatar_url: effective!.avatar_url },
        content,
        created_at: new Date().toISOString(),
      }

      // Optimistically add the comment and increment count
      qc.setQueriesData<{ pages: { posts: Post[] }[] }>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? { ...p, comment_count: p.comment_count + 1 }
                  : p,
              ),
            })),
          }
        },
      )

      // Also update the comments query for the modal
      qc.setQueryData<PostComment[]>(['comments', postId], (old) => [
        ...(old ?? []),
        optimisticComment,
      ])

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        for (const [key, value] of context.snapshots) {
          qc.setQueryData(key, value)
        }
      }
      // Rollback comments list
      qc.removeQueries({ queryKey: ['comments', postId] })
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] })
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}