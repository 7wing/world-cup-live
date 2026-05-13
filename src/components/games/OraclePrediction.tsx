import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { useSubmitPrediction } from '@/hooks/usePassport'
import { useAuthStore } from '@/store/authStore'
import type { Match } from '@/types'

interface OraclePredictionProps {
  match: Match
}

export function OraclePrediction({ match }: OraclePredictionProps) {
  const { user } = useAuthStore()
  const { mutate, isPending } = useSubmitPrediction()
  const [home, setHome] = useState(1)
  const [away, setAway] = useState(0)

  const handleSubmit = () => {
    if (!user) return
    mutate({ user_id: user.id, match_id: match.id, predicted_home: home, predicted_away: away })
  }

  return (
    <GlassCard className="p-6 border-l-4 border-l-secondary-container relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-secondary-container">auto_awesome</span>
        <h3 className="font-lexend font-semibold text-secondary-container uppercase text-sm">The Oracle · Predict</h3>
      </div>

      <p className="font-lexend font-bold text-xl text-on-surface mb-6">
        {match.home_team.name} vs {match.away_team.name}
      </p>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex flex-col items-center gap-2">
          <span className="font-lexend text-xs text-white/40 uppercase">{match.home_team.code}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setHome(Math.max(0, home - 1))} className="w-8 h-8 bg-white/10 rounded text-white hover:bg-white/20">−</button>
            <span className="font-lexend font-black text-4xl text-primary-container w-12 text-center">{home}</span>
            <button onClick={() => setHome(home + 1)} className="w-8 h-8 bg-white/10 rounded text-white hover:bg-white/20">+</button>
          </div>
        </div>
        <span className="font-lexend text-white/20 text-2xl">:</span>
        <div className="flex flex-col items-center gap-2">
          <span className="font-lexend text-xs text-white/40 uppercase">{match.away_team.code}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setAway(Math.max(0, away - 1))} className="w-8 h-8 bg-white/10 rounded text-white hover:bg-white/20">−</button>
            <span className="font-lexend font-black text-4xl text-white w-12 text-center">{away}</span>
            <button onClick={() => setAway(away + 1)} className="w-8 h-8 bg-white/10 rounded text-white hover:bg-white/20">+</button>
          </div>
        </div>
      </div>

      <NeonButton className="w-full justify-center" onClick={handleSubmit} disabled={isPending}>
        Lock In Prediction
      </NeonButton>
    </GlassCard>
  )
}