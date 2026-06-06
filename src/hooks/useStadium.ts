// src/hooks/useStadium.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStadiums,
  fetchStadiumById,
  fetchStadiumReviews,
  submitStadiumReview,
  fetchStadiumPhotos,
  uploadFanPhoto,
} from '@/api/stadiums'
import type { StadiumReview } from '@/types'
import { useNotificationStore } from '@/store/notificationStore'

// ── Image optimisation ────────────────────────────────────────────────────────
export function getOptimizedImageUrl(
  url: string | null,
  width: number,
  quality: number
): string | null {
  if (!url) return null
  if (!url.includes('supabase.co/storage')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}width=${width}&quality=${quality}`
}

export const getStorageObjectUrl = getOptimizedImageUrl

// ── Stadiums list ─────────────────────────────────────────────────────────────
export function useStadiums() {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: fetchStadiums,
    staleTime: 1000 * 60 * 10,
  })
}

// ── Single stadium by slug ────────────────────────────────────────────────────
export function useStadium(slug: string) {
  return useQuery({
    queryKey: ['stadiums', slug],
    queryFn: () => fetchStadiumById(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  })
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export function useStadiumReviews(stadiumId: string) {
  return useQuery({
    queryKey: ['stadiums', stadiumId, 'reviews'],
    queryFn: () => fetchStadiumReviews(stadiumId),
    enabled: !!stadiumId,
  })
}

export function useSubmitReview(stadiumId: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: (review: Omit<StadiumReview, 'id' | 'created_at' | 'overall_rating' | 'user'>) =>
      submitStadiumReview(review),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums', stadiumId, 'reviews'] })
      qc.invalidateQueries({ queryKey: ['stadiums', stadiumId] })
      push('Review submitted!', 'success')
    },
    onError: () => push('Failed to submit review', 'error'),
  })
}

// ── Photos ────────────────────────────────────────────────────────────────────
export function useStadiumPhotos(stadiumId: string) {
  return useQuery({
    queryKey: ['stadiums', stadiumId, 'photos'],
    queryFn: () => fetchStadiumPhotos(stadiumId),
    enabled: !!stadiumId,
  })
}

export function useUploadFanPhoto(stadiumId: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: ({
      userId,
      file,
      caption,
    }: {
      userId: string
      file: File
      caption: string
    }) => uploadFanPhoto(userId, stadiumId, file, caption),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums', stadiumId, 'photos'] })
      push('Photo uploaded!', 'success')
    },
    onError: () => push('Failed to upload photo', 'error'),
  })
}