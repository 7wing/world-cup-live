import { GlassCard } from '@/components/ui/GlassCard'
import type { Match } from '@/types'

interface OraclePredictionProps {
  match: Match
  homeWin?: number   // percentage 0-100
  draw?: number      // percentage 0-100
  awayWin?: number   // percentage 0-100
  predictedHome?: number
  predictedAway?: number
  confidence?: number
}

export function OraclePrediction({
  match,
  homeWin    = 55,
  draw       = 18,
  awayWin    = 27,
  predictedHome = 2,
  predictedAway = 1,
  confidence    = 68,
}: OraclePredictionProps) {
  const dominant =
    homeWin > awayWin ? 'home' : awayWin > homeWin ? 'away' : 'draw'

  return (
    <GlassCard className="p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-base text-primary-container">
          auto_awesome
        </span>
        <p className="font-lexend font-black text-[10px] uppercase tracking-widest text-white/40">
          Oracle Prediction
        </p>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col items-center gap-1 flex-1">
          {match.home_team.flag_url ? (
            <img src={match.home_team.flag_url} alt="" className="w-8 h-8 rounded object-cover" />
          ) : (
            <span className="text-2xl leading-none">{match.home_team.code}</span>
          )}
          <p className="font-lexend font-bold text-xs text-white text-center">
            {match.home_team.name}
          </p>
          <span className={`text-[10px] font-lexend font-black uppercase tracking-widest ${
            dominant === 'home' ? 'text-primary-container' : 'text-white/20'
          }`}>
            {Math.round(homeWin)}%
          </span>
        </div>

        <div className="flex flex-col items-center px-3">
          <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/20">
            Draw
          </p>
          <p className="text-xs font-lexend font-bold text-white/30">{Math.round(draw)}%</p>
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          {match.away_team.flag_url ? (
            <img src={match.away_team.flag_url} alt="" className="w-8 h-8 rounded object-cover" />
          ) : (
            <span className="text-2xl leading-none">{match.away_team.code}</span>
          )}
          <p className="font-lexend font-bold text-xs text-white text-center">
            {match.away_team.name}
          </p>
          <span className={`text-[10px] font-lexend font-black uppercase tracking-widest ${
            dominant === 'away' ? 'text-primary-container' : 'text-white/20'
          }`}>
            {Math.round(awayWin)}%
          </span>
        </div>
      </div>

      {/* Probability bar */}
      <div className="h-2 rounded-full overflow-hidden flex mb-2">
        <div
          className="h-full bg-primary-container transition-all duration-700"
          style={{ width: `${homeWin}%` }}
        />
        <div
          className="h-full bg-white/15 transition-all duration-700"
          style={{ width: `${draw}%` }}
        />
        <div
          className="h-full bg-white/30 transition-all duration-700"
          style={{ width: `${awayWin}%` }}
        />
      </div>

      <div className="flex justify-between text-[9px] font-lexend font-bold uppercase tracking-widest text-white/20 mb-4">
        <span>Home win</span>
        <span>Draw</span>
        <span>Away win</span>
      </div>

      {/* Predicted score */}
      <div className="flex items-center justify-between pt-3 border-t border-white/6">
        <div>
          <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/25">
            Predicted score
          </p>
          <p className="font-lexend font-black text-2xl text-white mt-0.5">
            {predictedHome} – {predictedAway}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/25">
            Confidence
          </p>
          <p className={`font-lexend font-black text-xl mt-0.5 ${
            confidence >= 70 ? 'text-primary-container'
            : confidence >= 50 ? 'text-amber-400'
            : 'text-white/40'
          }`}>
            {Math.round(confidence)}%
          </p>
        </div>
      </div>
    </GlassCard>
  )
}