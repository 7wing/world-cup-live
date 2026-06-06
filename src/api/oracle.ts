// src/api/oracle.ts
// Supabase queries for the oracle_predictions table.

import { supabase } from '@/lib/supabase'
import type { OracleData } from '@/types'

/**
 * Fetch the most recent oracle prediction for a match from the DB.
 * Returns null if none exists yet (Gemini hasn't generated one).
 */
export async function fetchOraclePrediction(matchId: string): Promise<OracleData | null> {
  const { data, error } = await supabase
    .from('oracle_predictions')
    .select('home_win, draw, away_win, predicted_home, predicted_away, confidence')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) { console.error('[fetchOraclePrediction]', error.message); throw error }
  if (!data) return null

  return {
    homeWin:       data.home_win,
    draw:          data.draw,
    awayWin:       data.away_win,
    predictedHome: data.predicted_home ?? 1,
    predictedAway: data.predicted_away ?? 1,
    confidence:    data.confidence ?? 55,
  }
}