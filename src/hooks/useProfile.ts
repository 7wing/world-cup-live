import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserById,
  fetchFriends,
  fetchUserPhotos,
  updateUserProfile,
  sendFriendRequest,
} from '@/api/profile'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

export function useProfile(userId: string) {
  const loading = useAuthStore((s) => s.loading)
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId && !loading,
  })
}

export function useFriends(userId: string) {
  const loading = useAuthStore((s) => s.loading)
  return useQuery({
    queryKey: ['users', userId, 'friends'],
    queryFn: () => fetchFriends(userId),
    enabled: !!userId && !loading,
  })
}

export function useUserPhotos(userId: string) {
  const loading = useAuthStore((s) => s.loading)
  return useQuery({
    queryKey: ['users', userId, 'photos'],
    queryFn: () => fetchUserPhotos(userId),
    enabled: !!userId && !loading,
  })
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Parameters<typeof updateUserProfile>[1]) =>
      updateUserProfile(userId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', userId] }),
  })
}

export function useSendFriendRequest() {
  const qc = useQueryClient()
  const { push } = useNotificationStore()
  return useMutation({
    mutationFn: ({ userId, friendId }: { userId: string; friendId: string }) =>
      sendFriendRequest(userId, friendId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      push('Friend request sent!', 'success')
    },
    onError: () => push('Could not send friend request', 'error'),
  })
}