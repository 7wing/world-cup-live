import { useQuery } from '@tanstack/react-query'
import { fetchMatches, fetchLiveMatches, fetchMatchById } from '@/api/matches'

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
    queryFn: () => fetchMatchById(id),
    enabled: !!id,
    refetchInterval: 15_000,
  })
}