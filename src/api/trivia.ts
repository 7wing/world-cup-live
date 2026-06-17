// src/api/trivia.ts
import { supabase } from '@/lib/supabase'
import type { TriviaQuestion } from '@/types'

/**
 * Fallback trivia questions used when the database is empty and the Gemini
 * API is unavailable (rate-limited, no key, etc.).  These are real,
 * curated World Cup questions so the AI Trivia tab is always playable.
 */
export const FALLBACK_TRIVIA: TriviaQuestion[] = [
  {
    id: 'fallback-1',
    question: 'Which country has won the most FIFA World Cup titles?',
    options: ['Brazil', 'Germany', 'Italy', 'Argentina'],
    answer: 0,
    points: 20,
    tag: 'History',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    question: 'The 2026 FIFA World Cup will feature how many teams for the first time?',
    options: ['32', '40', '48', '64'],
    answer: 2,
    points: 20,
    tag: '2026',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    question: 'Which three countries are co-hosting the 2026 FIFA World Cup?',
    options: ['USA, Canada, Mexico', 'USA, Canada, Brazil', 'Germany, France, Spain', 'Qatar, Saudi Arabia, UAE'],
    answer: 0,
    points: 30,
    tag: '2026',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    question: 'Where will the 2026 FIFA World Cup Final be played?',
    options: ['Los Angeles', 'New York New Jersey Stadium', 'Mexico City', 'Toronto'],
    answer: 1,
    points: 30,
    tag: '2026',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-5',
    question: 'When does the 2026 FIFA World Cup opening match take place?',
    options: ['June 11, 2026', 'July 19, 2026', 'August 1, 2026', 'May 20, 2026'],
    answer: 0,
    points: 30,
    tag: '2026',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-6',
    question: 'Who won the 2022 FIFA World Cup in Qatar?',
    options: ['France', 'Argentina', 'Brazil', 'Germany'],
    answer: 1,
    points: 20,
    tag: '2022',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-7',
    question: 'Who is the all-time top scorer in FIFA World Cup history with 16 goals?',
    options: ['Pelé', 'Ronaldo Nazário', 'Miroslav Klose', 'Lionel Messi'],
    answer: 2,
    points: 30,
    tag: 'Records',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-8',
    question: 'Who holds the record for most goals in a single World Cup tournament (13)?',
    options: ['Just Fontaine', 'Ronaldo Nazário', 'Gerd Müller', 'Miroslav Klose'],
    answer: 0,
    points: 50,
    tag: 'Records',
    difficulty: 'hard',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-9',
    question: 'Which nation won the first-ever FIFA World Cup in 1930?',
    options: ['Brazil', 'Argentina', 'Uruguay', 'Italy'],
    answer: 2,
    points: 30,
    tag: 'History',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-10',
    question: 'How many countries have ever won the FIFA World Cup?',
    options: ['6', '8', '10', '12'],
    answer: 1,
    points: 30,
    tag: 'History',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-11',
    question: 'Which nation won the 2018 FIFA World Cup in Russia?',
    options: ['Germany', 'Brazil', 'France', 'Croatia'],
    answer: 2,
    points: 20,
    tag: 'History',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-12',
    question: 'Name one of the three official mascots for the 2026 World Cup.',
    options: ['Zabivaka the Wolf', 'Maple the Moose', 'Fuleco the Armadillo', 'La’eeb'],
    answer: 1,
    points: 20,
    tag: '2026',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-13',
    question: 'Which of these four nations will make their World Cup debut in 2026?',
    options: ['Iceland', 'Curaçao', 'Panama', 'Russia'],
    answer: 1,
    points: 30,
    tag: '2026',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-14',
    question: 'With roughly 156,000 people, which is the smallest nation ever to qualify for the World Cup?',
    options: ['Iceland', 'Curaçao', 'Qatar', 'Wales'],
    answer: 1,
    points: 50,
    tag: '2026',
    difficulty: 'hard',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-15',
    question: 'Which former 2006 World Cup winner became head coach of Uzbekistan before 2026?',
    options: ['Fabio Cannavaro', 'Zinedine Zidane', 'Pep Guardiola', 'Marcello Lippi'],
    answer: 0,
    points: 50,
    tag: '2026',
    difficulty: 'hard',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-16',
    question: 'In the 2022 World Cup final, what was the score after extra time between Argentina and France?',
    options: ['1–1', '2–2', '3–3', '4–4'],
    answer: 2,
    points: 30,
    tag: '2022',
    difficulty: 'medium',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-17',
    question: 'Which player won the Golden Ball (best player) at the 2022 World Cup?',
    options: ['Kylian Mbappé', 'Lionel Messi', 'Julián Álvarez', 'Antoine Griezmann'],
    answer: 1,
    points: 20,
    tag: '2022',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-18',
    question: 'Who scored a hat-trick in the 2022 World Cup final?',
    options: ['Lionel Messi', 'Kylian Mbappé', 'Ángel Di María', 'Olivier Giroud'],
    answer: 1,
    points: 20,
    tag: '2022',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-19',
    question: 'The 2022 World Cup in Qatar was the first held in which region?',
    options: ['North America', 'Middle East', 'Asia', 'Africa'],
    answer: 1,
    points: 20,
    tag: 'History',
    difficulty: 'easy',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-20',
    question: 'Which country won back-to-back World Cups in 1958 and 1962?',
    options: ['Germany', 'Brazil', 'Italy', 'Argentina'],
    answer: 1,
    points: 50,
    tag: 'History',
    difficulty: 'hard',
    source: 'manual',
    match_id: null,
    created_at: new Date().toISOString(),
  },
]

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