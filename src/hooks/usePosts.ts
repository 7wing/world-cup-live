import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPosts, createPost, togglePostLike } from '@/api/fanzone'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { getEffectiveUser } from '@/lib/guestUser'

export function usePosts(matchId?: string) {
  const { user } = useAuthStore()
  const effective = getEffectiveUser(user)

  return useQuery({
    queryKey: ['posts', matchId ?? 'all', effective?.id],
    queryFn: () => fetchPosts(matchId, effective?.id),
    refetchInterval: 20_000,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      push('Post shared!', 'success')
    },
    onError: () => push('Failed to post', 'error'),
  })
}

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, userId, liked }: { postId: string; userId: string; liked: boolean }) =>
      togglePostLike(postId, userId, liked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}