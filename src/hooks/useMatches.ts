// src/hooks/useMatches.ts
// All match-related React Query hooks.
// All query functions delegate to src/api/* — no inline Supabase calls here.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchMatches,
  fetchLiveMatches,
  fetchMatchById,
  fetchMatchStats,
  fetchLineups,
  fetchMatchEvents,
  fetchH2HMatches,
  fetchMyPrediction,
} from '@/api/matches'
import { supabase } from '@/lib/supabase'
import type { Prediction, Match } from '@/types'
import type { MatchStat } from '@/api/matches'
import type { Lineup }    from '@/types'
import type { MatchEvent } from '@/api/matchEvents'

// ── Matches ───────────────────────────────────────────────────────────────────

export function useMatches() {
  return useQuery({
    queryKey:       ['matches'],
    queryFn:        fetchMatches,
    staleTime:      30_000,
    refetchInterval: 30_000,
  })
}

export function useLiveMatches() {
  return useQuery({
    queryKey:       ['matches', 'live'],
    queryFn:        fetchLiveMatches,
    staleTime:      15_000,
    refetchInterval: 15_000,
  })
}

export function useMatch(id: string) {
  return useQuery({
    queryKey:  ['matches', id],
    queryFn:   () => fetchMatchById(id),
    enabled:   !!id,
    staleTime: 30_000,
  })
}

// ── Match Stats ───────────────────────────────────────────────────────────────
// Returns null pre-kickoff (no row exists yet) — callers must handle null.

export function useMatchStats(matchId: string | undefined) {
  return useQuery<MatchStat | null>({
    queryKey:        ['match_stats', matchId],
    queryFn:         () => fetchMatchStats(matchId!),
    enabled:         !!matchId,
    staleTime:       15_000,
    refetchInterval: 15_000,
  })
}

// ── Lineups ───────────────────────────────────────────────────────────────────

export function useLineups(matchId: string | undefined) {
  return useQuery<Lineup[]>({
    queryKey:  ['lineups', matchId],
    queryFn:   () => fetchLineups(matchId!),
    enabled:   !!matchId,
    staleTime: 5 * 60_000,   // lineups rarely change once set
  })
}

// ── Match Events ──────────────────────────────────────────────────────────────

export function useMatchEvents(matchId: string | undefined) {
  return useQuery<MatchEvent[]>({
    queryKey:        ['match_events', matchId],
    queryFn:         () => fetchMatchEvents(matchId!),
    enabled:         !!matchId,
    staleTime:       15_000,
    refetchInterval: 15_000,
  })
}

// ── Head-to-Head ──────────────────────────────────────────────────────────────

export function useH2H(
  homeTeamId: string | undefined,
  awayTeamId: string | undefined,
  limit = 10,
) {
  return useQuery<Match[]>({
    queryKey: ['h2h', homeTeamId, awayTeamId],
    queryFn:  () => fetchH2HMatches(homeTeamId!, awayTeamId!, limit),
    enabled:  !!homeTeamId && !!awayTeamId,
    staleTime: 60_000,
  })
}

// ── My Prediction (single match) ──────────────────────────────────────────────

export function useMyPrediction(
  userId:  string | undefined,
  matchId: string | undefined,
) {
  return useQuery<Prediction | null>({
    queryKey: ['predictions', 'single', userId, matchId],
    queryFn:  () => fetchMyPrediction(userId!, matchId!),
    enabled:  !!userId && !!matchId,
    staleTime: 30_000,
  })
}

// ── Predictions batch (used by GamesPage PredictorTab) ────────────────────────

export function usePredictionsForMatches(
  userId:   string | undefined,
  matchIds: string[],
) {
  return useQuery<Prediction[]>({
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
    enabled:  !!userId && matchIds.length > 0,
    staleTime: 30_000,
  })
}

// ── Submit Prediction ─────────────────────────────────────────────────────────

export function useSubmitMatchPrediction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      pred: Pick<Prediction, 'user_id' | 'match_id' | 'predicted_home' | 'predicted_away'>,
    ): Promise<void> => {
      const { error } = await supabase
        .from('predictions')
        .upsert(pred, { onConflict: 'user_id,match_id' })
      if (error) throw error
    },
    onSuccess: (_data, pred) => {
      // Invalidate all prediction query shapes that reference this user
      qc.invalidateQueries({ queryKey: ['predictions', pred.user_id] })
      qc.invalidateQueries({ queryKey: ['predictions', 'single', pred.user_id, pred.match_id] })
      qc.invalidateQueries({ queryKey: ['users', pred.user_id, 'predictions'] })
    },
  })
}