// src/hooks/useMatches.ts

import { useQuery } from '@tanstack/react-query'
import { fetchMatches, fetchLiveMatches, fetchMatchById } from '@/api/matches'
import { FIXTURES, type Fixture } from '@/components/matches/ScheduleTab'

function fixtureToMatch(f: Fixture) {
  return {
    id:             f.id,
    status:         f.status,
    kickoff_at:     f.kickoff,   // ← what ScoreCard reads
    stage:          f.groupLabel, // ← what ScoreCard reads
    venue:          f.venue,
    city:           f.city,
    minute:         null,
    home_possession: null,
    home_team: { name: f.home.name, code: f.home.code, flag_url: '' },
    away_team: { name: f.away.name, code: f.away.code, flag_url: '' },
    home_score:     f.homeScore ?? null,
    away_score:     f.awayScore ?? null,
  }
}

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
    refetchInterval: 30_000,
  })
}

export function useLiveMatches() {
  return useQuery({
    queryKey: ['matches', 'live'],
    queryFn: fetchLiveMatches,
    refetchInterval: 15_000,
  })
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: async () => {
      try {
        const remote = await fetchMatchById(id)
        if (remote) return remote
      } catch {
        // API doesn't know this ID — fall through to local data
      }

      const local = FIXTURES.find((f) => f.id === id)
      return local ? fixtureToMatch(local) : null
    },
    enabled: !!id,
    refetchInterval: 15_000,
  })
}