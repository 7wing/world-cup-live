import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchOracleVoteCounts, castOracleVote } from '@/api/oracleVotes'
import { useAuthStore } from '@/store/authStore'

export function OracleTab() {
  const { user }    = useAuthStore()
  const queryClient = useQueryClient()

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['oracle_votes'],
    queryFn:  fetchOracleVoteCounts,
    staleTime: 30_000,
  })

  const { mutate: vote, variables: voting } = useMutation({
    mutationFn: ({ questionId, optionIdx }: { questionId: string; optionIdx: number }) =>
      castOracleVote(questionId, optionIdx, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['oracle_votes'] }),
  })

  const [localVotes, setLocalVotes] = React.useState<Record<string, number>>({})

  function handleVote(questionId: string, idx: number) {
    if (localVotes[questionId] !== undefined || !user) return
    setLocalVotes((prev) => ({ ...prev, [questionId]: idx }))
    vote({ questionId, optionIdx: idx })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 glass-card rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {questions.map((q) => {
        const picked = localVotes[q.id]
        const displayVotes = picked !== undefined
          ? q.votes.map((v, i) => (i === picked ? v + 1 : v))
          : q.votes
        const total = picked !== undefined ? q.total + 1 : q.total

        return (
          <div key={q.id} className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-white/30">
                Fan Oracle
              </span>
              <span className="text-[10px] font-lexend text-white/25">
                {total.toLocaleString()} votes
              </span>
            </div>

            <div className="p-4">
              <p className="text-sm font-lexend font-bold leading-snug mb-4">{q.question}</p>

              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const pct        = total > 0 ? Math.round((displayVotes[i] / total) * 100) : 0
                  const selected   = picked === i
                  const isSubmitting = voting?.questionId === q.id && voting?.optionIdx === i

                  return (
                    <button
                      key={i}
                      onClick={() => handleVote(q.id, i)}
                      disabled={picked !== undefined || !user || isSubmitting}
                      className={`relative text-left px-3 py-2.5 rounded-lg border transition-colors overflow-hidden ${
                        selected ? 'border-primary-container/50' : 'border-white/10 hover:border-white/20'
                      } ${picked !== undefined ? 'cursor-default' : 'cursor-pointer'} bg-transparent`}
                    >
                      {picked !== undefined && (
                        <div
                          className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                            selected ? 'bg-primary-container/10' : 'bg-white/[0.03]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative flex justify-between items-center">
                        <span className={`text-xs font-lexend font-semibold ${selected ? 'text-primary-container' : 'text-white/60'}`}>
                          {opt}
                        </span>
                        {isSubmitting ? (
                          <span className="w-3 h-3 rounded-full border-2 border-primary-container/50 border-t-transparent animate-spin" />
                        ) : picked !== undefined && (
                          <span className={`text-[11px] font-lexend font-black ${selected ? 'text-primary-container' : 'text-white/30'}`}>
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {picked === undefined && (
                <p className="text-[10px] font-lexend text-white/25 text-center mt-3">
                  {user ? 'Vote to see results' : 'Sign in to vote'}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}