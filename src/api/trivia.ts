// src/api/trivia.ts
import { supabase } from '@/lib/supabase'
import type { TriviaQuestion } from '@/types'

/** Fisher-Yates shuffle — client-side after fetch */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * If the DB has fewer than `minRequired` questions for this context,
 * fire-and-forget a call to the Edge Function to generate more.
 * Returns immediately — the next query re-fetch will pick them up.
 */
async function triggerGeneration(topic: string): Promise<void> {
  try {
    await supabase.functions.invoke('generate-trivia', {
      body: { topic, count: 10 },
    })
  } catch (err) {
    console.warn('[triggerGeneration] failed silently:', err)
  }
}

export async function fetchTriviaQuestions(
  matchId: string | undefined,
  limit = 10
): Promise<TriviaQuestion[]> {
  let rows: TriviaQuestion[]

  if (matchId) {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .or(`match_id.eq.${matchId},match_id.is.null`)
      .limit(limit * 3) // fetch 3× then shuffle-slice for variety
    if (error) { console.error('[fetchTriviaQuestions]', error.message); throw error }
    rows = (data ?? []) as TriviaQuestion[]
  } else {
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .is('match_id', null)
      .limit(limit * 3)
    if (error) { console.error('[fetchTriviaQuestions]', error.message); throw error }
    rows = (data ?? []) as TriviaQuestion[]
  }

  // Auto-generate if the pool is thin
  if (rows.length < 5) {
    const topic = matchId
      ? `the current FIFA World Cup 2026 match (id: ${matchId})`
      : 'FIFA World Cup 2026 general knowledge'
    triggerGeneration(topic) // fire-and-forget
  }

  // Shuffle and return `limit` questions — each user gets a different subset
  return shuffle(rows).slice(0, limit)
}