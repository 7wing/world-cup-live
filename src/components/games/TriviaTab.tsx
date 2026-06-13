// src/components/games/TriviaTab.tsx
// Queries trivia_questions from Supabase. No mock data.

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GlassCard } from '@/components/ui/GlassCard'
import { fetchTriviaQuestions } from '@/api/trivia'
import type { TriviaQuestion } from '@/types'

interface TriviaTabProps {
  /** Optional: scope questions to a specific match */
  matchId?: string
  /** Prepend a live Gemini question if available */
  liveQuestion?: TriviaQuestion | null
}

export function TriviaTab({ matchId, liveQuestion }: TriviaTabProps) {
  const MAX_ROUNDS = 5
  const { data: dbQuestions = [], isLoading } = useQuery({
    queryKey: ['trivia_questions', matchId ?? 'global'],
    queryFn:  () => fetchTriviaQuestions(matchId, MAX_ROUNDS),
    staleTime: 5 * 60_000,
  })

  const questions: TriviaQuestion[] = liveQuestion
    ? [liveQuestion, ...dbQuestions.filter((q) => q.id !== liveQuestion.id)]
    : dbQuestions

  const totalPts = questions.reduce((sum, q) => sum + q.points, 0)

  // answers: { [questionId]: selectedOptionIndex }
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [score, setScore] = useState(() => {
    if (typeof window === 'undefined') return 0
    const saved = localStorage.getItem('trivia_score')
    return saved ? parseInt(saved, 10) : 0
  })
  const [sessionFinished, setSessionFinished] = useState(false)

  useEffect(() => {
    localStorage.setItem('trivia_score', String(score))
  }, [score])

  useEffect(() => {
    // If all questions in the session are answered, mark finished
    const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length
    if (answeredCount >= Math.min(MAX_ROUNDS, questions.length) && questions.length > 0) {
      setSessionFinished(true)
    }
  }, [answers, questions])

  function resetSession() {
    setScore(0)
    setAnswers({})
    setSessionFinished(false)
    localStorage.removeItem('trivia_score')
  }

  function handleAnswer(qid: string, idx: number, correct: number, pts: number) {
    if (answers[qid] !== undefined || sessionFinished) return
    setAnswers((prev) => ({ ...prev, [qid]: idx }))
    if (idx === correct) setScore((s) => s + pts)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 glass-card rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-white/10 block mb-3">psychology</span>
        <p className="font-lexend font-black text-sm text-white/20">No trivia questions available yet</p>
      </GlassCard>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
      {/* ── Questions / Summary ── */}
      <div className="space-y-4">
        {sessionFinished && (
          <GlassCard className="p-6 text-center">
            <span className="material-symbols-outlined text-5xl text-primary-container block mb-3">emoji_events</span>
            <p className="font-lexend font-black text-sm uppercase tracking-widest text-white/40 mb-2">Session Complete</p>
            <p className="font-lexend font-black text-5xl text-primary-container leading-none mb-2">
              {score}
            </p>
            <p className="text-[11px] font-lexend text-white/30 mb-4">
              {score > 0 ? 'Great job!' : 'Better luck next time!'}
            </p>
            <NeonButton size="sm" onClick={resetSession}>
              Play Again
            </NeonButton>
          </GlassCard>
        )}
        {!sessionFinished && questions.map((q) => {
          const picked   = answers[q.id] ?? null
          const isLiveAi = q.source === 'gemini'

          return (
            <GlassCard key={q.id} className="overflow-hidden">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
                {isLiveAi ? (
                  <div className="flex items-center gap-1.5 bg-primary-container/10 px-2 py-0.5 rounded-full border border-primary-container/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                    <span className="text-[9px] font-lexend font-black text-primary-container uppercase">
                      {q.tag ?? 'AI'}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] font-lexend font-bold text-white/25 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                    {q.tag ?? q.difficulty}
                  </span>
                )}
                <div className="flex items-center gap-1 text-[10px] font-lexend font-black text-primary-container">
                  <span className="material-symbols-outlined text-[13px]">emoji_events</span>
                  +{q.points} pts
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <p className="font-lexend font-semibold text-sm text-white leading-relaxed mb-4">
                  {q.question}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, i) => {
                    const isCorrect = picked !== null && i === q.answer
                    const isWrong   = picked === i && i !== q.answer

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(q.id, i, q.answer, q.points)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-xs font-lexend font-semibold transition-all ${
                          isCorrect
                            ? 'bg-primary-container/15 border-primary-container/40 text-primary-container'
                            : isWrong
                              ? 'bg-red-400/10 border-red-400/30 text-red-400'
                              : picked !== null
                                ? 'bg-transparent border-white/5 text-white/20 cursor-default'
                                : 'bg-white/3 border-white/8 text-white/60 hover:bg-white/8 hover:border-white/15'
                        }`}
                      >
                        <span className="mr-1.5 text-white/20">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {isCorrect && (
                          <span className="material-symbols-outlined text-[13px] float-right mt-0.5">
                            check_circle
                          </span>
                        )}
                        {isWrong && (
                          <span className="material-symbols-outlined text-[13px] float-right mt-0.5">
                            cancel
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {picked !== null && (
                  <p
                    className={`mt-3 text-center text-[11px] font-lexend font-black ${
                      picked === q.answer ? 'text-primary-container' : 'text-red-400'
                    }`}
                  >
                    {picked === q.answer
                      ? `Correct! +${q.points} points`
                      : 'Incorrect — no points this time'}
                  </p>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* ── Score sidebar ── */}
      <div className="space-y-3">
        {/* Score card */}
        <GlassCard className="p-5 text-center">
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2">
            Session Score
          </p>
          <p className="font-lexend font-black text-5xl text-primary-container leading-none">
            {score}
          </p>
          <p className="text-[10px] font-lexend text-white/20 mt-1">pts earned</p>

          <button
            onClick={resetSession}
            className="mt-3 px-3 py-1.5 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/30 hover:bg-white/10 hover:text-white/50 transition-colors w-full"
          >
            New Session
          </button>

          <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-all"
              style={{ width: `${totalPts > 0 ? Math.min(100, (score / totalPts) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[9px] font-lexend text-white/20 mt-1.5">{totalPts} pts available</p>
        </GlassCard>

        {/* Progress tracker */}
        <GlassCard className="p-4">
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-3">
            Progress
          </p>
          <div className="space-y-2">
            {questions.map((q) => {
              const a = answers[q.id]
              return (
                <div
                  key={q.id}
                  className="flex items-center gap-2"
                  style={{ opacity: a === undefined ? 0.4 : 1 }}
                >
                  <span className="text-xs shrink-0">
                    {a === undefined ? '⬜' : a === q.answer ? '✅' : '❌'}
                  </span>
                  <span className="text-[11px] font-lexend text-white/50 flex-1 truncate">
                    {q.tag ?? q.difficulty}
                  </span>
                  <span
                    className={`text-[10px] font-lexend font-bold shrink-0 ${
                      a === q.answer ? 'text-primary-container' : 'text-white/20'
                    }`}
                  >
                    {a === undefined ? '—' : a === q.answer ? `+${q.points}` : '+0'}
                  </span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}