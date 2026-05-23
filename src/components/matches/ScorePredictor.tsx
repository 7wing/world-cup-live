// src/components/matches/ScorePredictor.tsx
import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import { getEffectiveUser } from '@/lib/guestUser'
import { getStaticOracle } from '@/lib/mockAdapters'
import { getPrediction, savePrediction, scorePrediction } from '@/lib/predictionsStorage'
import { formatKickoff } from '@/utils/formatDate'
import type { Match } from '@/types'

export function ScorePredictor({ match }: { match: Match }) {
  const { user: authUser } = useAuthStore()
  const user = getEffectiveUser(authUser)
  const oracle = getStaticOracle(match.id)
  const existing = user ? getPrediction(user.id, match.id) : undefined

  const [homeGoals, setHomeGoals] = useState(existing?.predicted_home ?? 0)
  const [awayGoals, setAwayGoals] = useState(existing?.predicted_away ?? 0)
  const [submitted, setSubmitted] = useState(Boolean(existing))
  const [points, setPoints] = useState<number | null>(null)

  const canPredict = match.status === 'upcoming'
  const oraclePred = oracle ?? {
    homeWin: 50, draw: 25, awayWin: 25,
    predictedHome: 1, predictedAway: 1, confidence: 50,
  }

  const resolvedPoints = points ?? (existing ? scorePrediction(existing.predicted_home, existing.predicted_away, oraclePred.predictedHome, oraclePred.predictedAway) : null)

  function handleSubmit() {
    if (!user) return
    savePrediction(user.id, match.id, homeGoals, awayGoals)
    setSubmitted(true)
    setPoints(scorePrediction(homeGoals, awayGoals, oraclePred.predictedHome, oraclePred.predictedAway))
  }

  const homeFlag = match.home_team.flag_url
  const awayFlag = match.away_team.flag_url

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
        {!canPredict && !submitted && (
          <p className="text-[11px] font-lexend text-white/30 mb-4 text-center">Predictions open for upcoming matches only.</p>
        )}
        {!submitted && canPredict ? (
          <>
            <p className="text-[11px] font-lexend text-white/30 mb-4 text-center">
              Predict the exact score to earn 50 points · kickoff {formatKickoff(match.kickoff_at)}
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-lexend font-bold text-white/60">{homeFlag && !homeFlag.startsWith('http') ? homeFlag : match.home_team.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setHomeGoals(Math.max(0, homeGoals - 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">-</button>
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{homeGoals}</span>
                  <button onClick={() => setHomeGoals(homeGoals + 1)} className="w-8 h-8 rounded-full bg-primary-container/20 border text-primary-container">+</button>
                </div>
              </div>
              <span className="font-lexend font-black text-2xl text-white/20">—</span>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-lexend font-bold text-white/60">{awayFlag && !awayFlag.startsWith('http') ? awayFlag : match.away_team.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAwayGoals(Math.max(0, awayGoals - 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">-</button>
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{awayGoals}</span>
                  <button onClick={() => setAwayGoals(awayGoals + 1)} className="w-8 h-8 rounded-full bg-white/5 border text-white/40">+</button>
                </div>
              </div>
            </div>
            <button onClick={handleSubmit} className="w-full py-2.5 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary-container font-lexend font-black text-xs uppercase tracking-widest hover:bg-primary-container/25 transition-colors">
              Lock In Prediction
            </button>
          </>
        ) : submitted ? (
          <div className="text-center py-4">
            <p className="font-lexend font-black text-2xl text-white mb-1">{homeGoals} – {awayGoals}</p>
            <p className="text-[11px] font-lexend text-white/30 mb-3">Your prediction is locked in</p>
          </div>
        ) : null}
      </div>
    </GlassCard>
  )
}