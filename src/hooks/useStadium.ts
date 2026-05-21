import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStadiums, fetchStadiumById,
  fetchStadiumReviews, submitStadiumReview,
  fetchStadiumPhotos
} from '@/api/stadiums'
import { useNotificationStore } from '@/store/notificationStore'

// ─── Supabase image URL transformer ─────────────────────────────────────────
// Appends width/quality params that Supabase Storage Image Transformations
// understand, so images are resized server-side and arrive much smaller.
// If your project doesn't have Image Transformations enabled, the original
// URL is returned unchanged.
/** Resize via Supabase Image Transformations (render/image), not query params on object URLs. */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width = 800,
  quality = 75,
): string | null {
  if (!url) return null

  try {
    if (!url.includes('/storage/v1/object/')) return url

    const parsed = new URL(url)
    parsed.pathname = parsed.pathname
      .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
      .replace('/storage/v1/object/sign/', '/storage/v1/render/image/sign/')
    parsed.search = ''
    parsed.searchParams.set('width', String(width))
    parsed.searchParams.set('quality', String(quality))
    parsed.searchParams.set('resize', 'cover')
    return parsed.toString()
  } catch {
    return url
  }
}

/** Fall back to the raw storage object if render/image is unavailable. */
export function getStorageObjectUrl(renderOrObjectUrl: string | null | undefined): string | null {
  if (!renderOrObjectUrl) return null
  if (!renderOrObjectUrl.includes('/render/image/')) return renderOrObjectUrl
  try {
    const parsed = new URL(renderOrObjectUrl)
    parsed.pathname = parsed.pathname
      .replace('/storage/v1/render/image/public/', '/storage/v1/object/public/')
      .replace('/storage/v1/render/image/sign/', '/storage/v1/object/sign/')
    parsed.search = ''
    return parsed.toString()
  } catch {
    return renderOrObjectUrl
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useStadiums() {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: fetchStadiums,
    // Cache for 5 minutes — stadium data is stable
    staleTime: 5 * 60_000,
    // Keep in memory for 10 minutes after last subscriber unmounts
    gcTime: 10 * 60_000,
    retry: 2,
  })
}

export function useStadium(id: string) {
  return useQuery({
    queryKey: ['stadiums', id],
    queryFn: () => fetchStadiumById(id),
    enabled: !!id,
    staleTime: 5 * 60_000,
  })
}

export function useStadiumReviews(stadiumId: string) {
  return useQuery({
    queryKey: ['stadiums', stadiumId, 'reviews'],
    queryFn: () => fetchStadiumReviews(stadiumId),
    enabled: !!stadiumId,
    staleTime: 2 * 60_000,
  })
}

export function useSubmitReview(stadiumId: string) {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: submitStadiumReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stadiums', stadiumId] })
      qc.invalidateQueries({ queryKey: ['stadiums', stadiumId, 'reviews'] })
      push('Review submitted!', 'success')
    },
    onError: () => push('Failed to submit review', 'error'),
  })
}

export function useStadiumPhotos(stadiumId: string) {
  return useQuery({
    queryKey: ['stadiums', stadiumId, 'photos'],
    queryFn: () => fetchStadiumPhotos(stadiumId),
    enabled: !!stadiumId,
    staleTime: 2 * 60_000,
  })
}