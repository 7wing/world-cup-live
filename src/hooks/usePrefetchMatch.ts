import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  fetchMatchById,
  fetchMatchStats,
  fetchLineups,
  fetchMatchEvents,
  fetchH2HMatches,
} from '@/api/matches'
import type { Match } from '@/types'

/**
 * Returns a callback that prefetches all MatchDetailPage queries
 * for a given match. Call this on mouse-enter / focus of a fixture row.
 */
export function usePrefetchMatch() {
  const qc = useQueryClient()

  return useCallback(
    (match: Match) => {
      const matchId = match.id
      const homeId = match.home_team?.id
      const awayId = match.away_team?.id

      // 1. Core match row (already cached if coming from matches list,
      //    but prefetch ensures it’s there for direct links too)
      qc.prefetchQuery({
        queryKey: ['matches', matchId],
        queryFn: () => fetchMatchById(matchId),
        staleTime: 30_000,
      })

      // 2. Live stats
      qc.prefetchQuery({
        queryKey: ['match_stats', matchId],
        queryFn: () => fetchMatchStats(matchId),
        staleTime: 15_000,
      })

      // 3. Lineups
      qc.prefetchQuery({
        queryKey: ['lineups', matchId],
        queryFn: () => fetchLineups(matchId),
        staleTime: 5 * 60_000,
      })

      // 4. Match events
      qc.prefetchQuery({
        queryKey: ['match_events', matchId],
        queryFn: () => fetchMatchEvents(matchId),
        staleTime: 15_000,
      })

      // 5. Head-to-head
      if (homeId && awayId) {
        qc.prefetchQuery({
          queryKey: ['h2h', homeId, awayId],
          queryFn: () => fetchH2HMatches(homeId, awayId),
          staleTime: 60_000,
        })
      }
    },
    [qc],
  )
}
