// src/api/oracleVotes.ts
import { supabase } from '@/lib/supabase'

export interface OracleQuestion {
  id:       string
  question: string
  options:  string[]
  votes:    number[]  // count per option
  total:    number
}

const QUESTIONS: { id: string; question: string; options: string[] }[] = [
  { id: 'wc-winner',    question: 'Who will win the 2026 World Cup?',  options: ['Brazil', 'France', 'Argentina', 'England']           },
  { id: 'top-scorer',   question: 'Who will be top scorer?',            options: ['Mbappé', 'Vinicius Jr.', 'Haaland', 'Bellingham']   },
  { id: 'hardest-group',question: 'Which group will be hardest?',       options: ['Group E', 'Group B', 'Group H', 'Group A']          },
]

export { QUESTIONS as ORACLE_QUESTION_DEFS }

export async function fetchOracleVoteCounts(): Promise<OracleQuestion[]> {
  const { data, error } = await supabase
    .from('oracle_votes')
    .select('question, option_idx')

  if (error) { console.error('[fetchOracleVoteCounts]', error.message); throw error }

  return QUESTIONS.map((q) => {
    const relevant = (data ?? []).filter((r) => r.question === q.id)
    const votes    = q.options.map((_, i) => relevant.filter((r) => r.option_idx === i).length)
    return { ...q, votes, total: relevant.length }
  })
}

export async function castOracleVote(
  questionId: string,
  optionIdx:  number,
  userId:     string
): Promise<void> {
  const { error } = await supabase
    .from('oracle_votes')
    .upsert(
      { question: questionId, option_idx: optionIdx, user_id: userId },
      { onConflict: 'user_id,question' }
    )
  if (error) { console.error('[castOracleVote]', error.message); throw error }
}