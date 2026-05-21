import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStadiums, fetchStadiumById,
  fetchStadiumReviews, submitStadiumReview,
  fetchStadiumPhotos
} from '@/api/stadiums'
import { useNotificationStore } from '@/store/notificationStore'

export function useStadiums() {
  return useQuery({
    queryKey: ['stadiums'],
    queryFn: fetchStadiums,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 2,
    refetchOnMount: 'always',
  })
}

export function useStadium(id: string) {
  return useQuery({
    queryKey: ['stadiums', id],
    queryFn: () => fetchStadiumById(id),
    enabled: !!id,
  })
}

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
  })
}