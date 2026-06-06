// src/hooks/useMatches.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMatches, fetchLiveMatches, fetchMatchById } from '@/api/matches'
import { supabase } from '@/lib/supabase'
import type { Prediction } from '@/types'

// ── Matches ───────────────────────────────────────────────────────────────────

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn:  fetchMatches,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

export function useLiveMatches() {
  return useQuery({
    queryKey: ['matches', 'live'],
    queryFn:  fetchLiveMatches,
    staleTime: 15_000,
    refetchInterval: 15_000,
  })
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn:  () => fetchMatchById(id),
    enabled:  !!id,
    staleTime: 30_000,
  })
}

// ── Predictions (used by GamesPage PredictorTab) ──────────────────────────────

/**
 * Fetch predictions for a batch of match IDs for a specific user.
 * Returns an empty array if userId is missing (guest).
 */
export function usePredictionsForMatches(
  userId: string | undefined,
  matchIds: string[]
) {
  return useQuery({
    queryKey: ['predictions', userId, matchIds],
    queryFn: async (): Promise<Prediction[]> => {
      if (!userId || matchIds.length === 0) return []
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .in('match_id', matchIds)
      if (error) throw error
      return (data ?? []) as Prediction[]
    },
    enabled: !!userId && matchIds.length > 0,
    staleTime: 30_000,
  })
}

/**
 * Upsert a single prediction. Invalidates both the match-batch query and
 * the user's full prediction history.
 */
export function useSubmitMatchPrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      pred: Pick<Prediction, 'user_id' | 'match_id' | 'predicted_home' | 'predicted_away'>
    ): Promise<void> => {
      const { error } = await supabase
        .from('predictions')
        .upsert(pred, { onConflict: 'user_id,match_id' })
      if (error) throw error
    },
    onSuccess: (_data, pred) => {
      // Invalidate the batch predictions cache for this user
      qc.invalidateQueries({ queryKey: ['predictions', pred.user_id] })
      // Also invalidate the profile prediction history if open
      qc.invalidateQueries({ queryKey: ['users', pred.user_id, 'predictions'] })
    },
  })
}