// src/components/matches/ScorePredictor.tsx

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import { useOraclePrediction } from '@/hooks/useOracle'
import { useMyPrediction, useSubmitMatchPrediction } from '@/hooks/useMatches'
import { formatKickoff } from '@/utils/formatDate'
import type { Match } from '@/types'

export function ScorePredictor({ match }: { match: Match }) {
  const { user } = useAuthStore()
  const { data: oracle } = useOraclePrediction(match)
  const { data: existing, isLoading: loadingPred } = useMyPrediction(user?.id, match.id)
  const { mutate: submitPrediction, isPending } = useSubmitMatchPrediction()

  const [homeGoals, setHomeGoals] = useState(existing?.predicted_home ?? 0)
  const [awayGoals, setAwayGoals] = useState(existing?.predicted_away ?? 0)

  const isUpcoming  = match.status === 'upcoming'
  const isFinished  = match.status === 'finished'
  const submitted   = !!existing
  const canPredict  = isUpcoming && !!user && !submitted

  function handleSubmit() {
    if (!user) return
    submitPrediction({
      user_id: user.id,
      match_id: match.id,
      predicted_home: homeGoals,
      predicted_away: awayGoals,
    })
  }

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <GlassCard className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/8">
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Score Predictor</p>
        </div>
        <div className="p-6 text-center">
          <span className="material-symbols-outlined text-3xl text-white/10 block mb-2">lock</span>
          <p className="text-[11px] font-lexend text-white/30">Sign in to make predictions and earn points.</p>
        </div>
      </GlassCard>
    )
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Score Predictor</p>
        <div className="flex items-center gap-1.5 bg-primary-container/10 px-2.5 py-1 rounded-full border border-primary-container/20">
          <span className="material-symbols-outlined text-[12px] text-primary-container">emoji_events</span>
          <span className="text-[10px] font-lexend font-black text-primary-container">+50 pts</span>
        </div>
      </div>

      <div className="p-4">
        {loadingPred ? (
          <div className="h-28 animate-pulse bg-white/5 rounded-lg" />

        ) : !isUpcoming && !submitted ? (
          <p className="text-[11px] font-lexend text-white/30 text-center py-4">
            Predictions are only available before kick-off.
          </p>

        ) : canPredict ? (
          <>
            <p className="text-[11px] font-lexend text-white/30 mb-4 text-center">
              Predict the exact score to earn 50 points · kick-off {formatKickoff(match.kickoff_at)}
            </p>

            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Home */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-lexend font-bold text-white/60">{match.home_team.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHomeGoals(g => Math.max(0, g - 1))}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">remove</span>
                  </button>
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{homeGoals}</span>
                  <button
                    onClick={() => setHomeGoals(g => g + 1)}
                    className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container hover:bg-primary-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </button>
                </div>
              </div>

              <span className="font-lexend font-black text-2xl text-white/20">—</span>

              {/* Away */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-lexend font-bold text-white/60">{match.away_team.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAwayGoals(g => Math.max(0, g - 1))}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">remove</span>
                  </button>
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{awayGoals}</span>
                  <button
                    onClick={() => setAwayGoals(g => g + 1)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-2.5 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary-container font-lexend font-black text-xs uppercase tracking-widest hover:bg-primary-container/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving…' : 'Lock In Prediction'}
            </button>
          </>

        ) : submitted && existing ? (
          <div className="text-center py-4 space-y-3">
            <p className="font-lexend font-black text-2xl text-white">
              {existing.predicted_home} – {existing.predicted_away}
            </p>
            <p className="text-[11px] font-lexend text-white/30">Your prediction is locked in</p>

            {oracle && (
              <p className="text-[11px] font-lexend text-white/20">
                Oracle:{' '}
                <span className="text-primary-container font-bold">
                  {oracle.predictedHome} – {oracle.predictedAway}
                </span>
                {oracle.confidence != null && (
                  <span className="text-white/20"> · {oracle.confidence}% confidence</span>
                )}
              </p>
            )}

            {isFinished && existing.points_earned > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-primary-container">
                <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                <span className="font-lexend font-black text-sm">+{existing.points_earned} points earned!</span>
              </div>
            )}
            {isFinished && existing.points_earned === 0 && (
              <p className="text-[11px] font-lexend text-white/20">No points this time — better luck next match</p>
            )}
          </div>

        ) : null}
      </div>
    </GlassCard>
  )
}