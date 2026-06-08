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
import { getLocalHeroUrl } from '@/assets/stadiums'
import type { Stadium, StadiumReview } from '@/types'
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

// ── Local hero injection ──────────────────────────────────────────────────────

function withLocalHero<T extends Stadium>(stadium: T): T {
  const local = getLocalHeroUrl(stadium.slug)
  if (!local) return stadium
  return { ...stadium, hero_image_url: local }
}

function withLocalHeroAll(stadiums: Stadium[]): Stadium[] {
  return stadiums.map(withLocalHero)
}

// ── Stadiums list ─────────────────────────────────────────────────────────────

export function useStadiums() {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: async () => {
      const stadiums = await fetchStadiums()
      return withLocalHeroAll(stadiums)
    },
    staleTime: 1000 * 60 * 10,
  })
}

// ── Single stadium by slug ────────────────────────────────────────────────────

export function useStadium(slug: string) {
  return useQuery({
    queryKey: ['stadiums', slug],
    queryFn: async () => {
      const stadium = await fetchStadiumById(slug)
      return withLocalHero(stadium)
    },
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

/**
 * stadiumId  — the UUID from stadiums.id  (used to key the reviews cache)
 * stadiumSlug — the slug from stadiums.slug (used to key useStadium cache)
 *
 * Both are needed so invalidation hits the right cache entries after a review
 * is submitted and the DB trigger updates the stadium averages.
 */
export function useSubmitReview(stadiumId: string, stadiumSlug: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: (review: Omit<StadiumReview, 'id' | 'created_at' | 'overall_rating' | 'user'>) =>
      submitStadiumReview(review),
    onSuccess: () => {
      // 1. Refresh the reviews list for this stadium
      qc.invalidateQueries({ queryKey: ['stadiums', stadiumId, 'reviews'] })

      // 2. Refresh the stadium detail (keyed by slug) so updated averages
      //    from the DB trigger are reflected immediately in the UI
      qc.invalidateQueries({ queryKey: ['stadiums', stadiumSlug] })

      // 3. Refresh the stadiums list so the card on StadiumsPage also updates
      qc.invalidateQueries({ queryKey: ['stadiums'] })

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