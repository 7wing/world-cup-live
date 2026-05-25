import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserById,
  fetchFriends,
  fetchUserPhotos,
  updateUserProfile,
  uploadAvatar,
  sendFriendRequest,
  fetchUserBadges,
  fetchPredictionHistory,
  submitPrediction,
  deletePrediction,
} from '@/api/profile'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import type { User } from '@/types'

// ── User ──────────────────────────────────────────────────────────────────────

export function useProfile(userId: string) {
  const loading = useAuthStore((s) => s.loading)
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId && !loading,
  })
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (updates: Partial<Pick<User, 'username' | 'avatar_url'>>) =>
      updateUserProfile(userId, updates),
    onSuccess: (_data, updates) => {
      qc.invalidateQueries({ queryKey: ['users', userId] })
      // Keep auth store in sync so header/avatar update immediately
      const current = useAuthStore.getState().user
      if (current) setUser({ ...current, ...updates })
      push('Profile updated!', 'success')
    },
    onError: () => push('Failed to update profile', 'error'),
  })
}

export function useUploadAvatar(userId: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(userId, file),
    onSuccess: (avatarUrl) => {
      updateUserProfile(userId, { avatar_url: avatarUrl })
      qc.invalidateQueries({ queryKey: ['users', userId] })
      const current = useAuthStore.getState().user
      if (current) setUser({ ...current, avatar_url: avatarUrl })
      push('Avatar updated!', 'success')
    },
    onError: () => push('Failed to upload avatar', 'error'),
  })
}

// ── Friends ───────────────────────────────────────────────────────────────────

export function useFriends(userId: string) {
  const loading = useAuthStore((s) => s.loading)
  return useQuery({
    queryKey: ['users', userId, 'friends'],
    queryFn: () => fetchFriends(userId),
    enabled: !!userId && !loading,
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

// ── Photos ────────────────────────────────────────────────────────────────────

export function useUserPhotos(userId: string) {
  const loading = useAuthStore((s) => s.loading)
  return useQuery({
    queryKey: ['users', userId, 'photos'],
    queryFn: () => fetchUserPhotos(userId),
    enabled: !!userId && !loading,
  })
}

// ── Badges ────────────────────────────────────────────────────────────────────

export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'badges'],
    queryFn: () => fetchUserBadges(userId),
    enabled: !!userId,
  })
}

// ── Predictions ───────────────────────────────────────────────────────────────

export function usePredictionHistory(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'predictions'],
    queryFn: () => fetchPredictionHistory(userId),
    enabled: !!userId,
  })
}

export function useSubmitPrediction(userId: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()
  return useMutation({
    mutationFn: submitPrediction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', userId, 'predictions'] })
      push('Prediction saved!', 'success')
    },
    onError: () => push('Failed to save prediction', 'error'),
  })
}

export function useDeletePrediction(userId: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()
  return useMutation({
    mutationFn: (predictionId: string) => deletePrediction(predictionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', userId, 'predictions'] })
      push('Prediction removed', 'success')
    },
    onError: () => push('Failed to remove prediction', 'error'),
  })
}