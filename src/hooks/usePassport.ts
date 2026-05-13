import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUserBadges, fetchPredictionHistory, submitPrediction } from '@/api/passport'
import { useNotificationStore } from '@/store/notificationStore'

export function usePassport(userId: string) {
  return useQuery({
    queryKey: ['passport', userId],
    queryFn: () => fetchUserBadges(userId),
    enabled: !!userId,
  })
}

export function usePredictionHistory(userId: string) {
  return useQuery({
    queryKey: ['predictions', userId],
    queryFn: () => fetchPredictionHistory(userId),
    enabled: !!userId,
  })
}

export function useSubmitPrediction() {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: submitPrediction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions'] })
      push('Prediction locked in!', 'success')
    },
    onError: () => push('Failed to submit prediction', 'error'),
  })
}