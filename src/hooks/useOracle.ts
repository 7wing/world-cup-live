// src/hooks/useOracle.ts

import { useQuery } from '@tanstack/react-query'
import { fetchOraclePrediction } from '@/api/oracle'
import { fetchGeminiOracle, isGeminiEnabled } from '@/lib/gemini'
import type { Match, OracleData } from '@/types'

const DEFAULTS: OracleData = {
  homeWin:       50,
  draw:          25,
  awayWin:       25,
  predictedHome: 1,
  predictedAway: 1,
  confidence:    50,
}

export function useOraclePrediction(match: Match | null | undefined) {
  return useQuery({
    queryKey: ['oracle', match?.id],
    queryFn: async (): Promise<OracleData> => {
      if (!match) return DEFAULTS

      // 1. Try Gemini first if configured
      if (isGeminiEnabled()) {
        const ai = await fetchGeminiOracle(match)
        if (ai) return ai
      }

      // 2. Fall back to oracle_predictions table
      const stored = await fetchOraclePrediction(match.id)
      if (stored) return stored

      // 3. Final hardcoded fallback
      return { ...DEFAULTS, confidence: 55 }
    },
    enabled:   !!match,
    staleTime: 5 * 60_000,
  })
}