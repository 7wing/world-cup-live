import { useQuery } from '@tanstack/react-query'
import { getStaticOracle } from '@/lib/mockAdapters'
import { fetchGeminiOracle, isGeminiEnabled } from '@/lib/gemini'
import type { Match } from '@/types'
import type { OracleData } from '@/lib/mockAdapters'

export function useOraclePrediction(match: Match | null | undefined) {
  return useQuery({
    queryKey: ['oracle', match?.id],
    queryFn: async (): Promise<OracleData> => {
      if (!match) {
        return { homeWin: 50, draw: 25, awayWin: 25, predictedHome: 1, predictedAway: 1, confidence: 50 }
      }
      if (isGeminiEnabled()) {
        const ai = await fetchGeminiOracle(match)
        if (ai) return ai
      }
      return (
        getStaticOracle(match.id) ?? {
          homeWin: 50,
          draw: 25,
          awayWin: 25,
          predictedHome: 1,
          predictedAway: 1,
          confidence: 55,
        }
      )
    },
    enabled: !!match,
    staleTime: 5 * 60_000,
  })
}
