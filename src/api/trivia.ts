// src/api/trivia.ts
// All Supabase queries for the trivia_questions table.

import { supabase } from '@/lib/supabase'
import type { TriviaQuestion } from '@/types'

/**
 * Fetch trivia questions from the DB.
 * If matchId is provided, returns questions for that match first,
 * then backfills with general questions up to `limit`.
 */
export async function fetchTriviaQuestions(
  matchId: string | undefined,
  limit = 10
): Promise<TriviaQuestion[]> {
  if (matchId) {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .or(`match_id.eq.${matchId},match_id.is.null`)
      .order('match_id', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) { console.error('[fetchTriviaQuestions]', error.message); throw error }
    return (data ?? []) as TriviaQuestion[]
  }

  const { data, error } = await supabase
    .from('trivia_questions')
    .select('*')
    .is('match_id', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('[fetchTriviaQuestions]', error.message); throw error }
  return (data ?? []) as TriviaQuestion[]
}