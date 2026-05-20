import { GlassCard } from '@/components/ui/GlassCard'
import type { Match } from '@/types'

interface VibeMeterProps {
  value: number          // overall vibe 0-100
  atmosphere?: number    // 0-100
  crowdNoise?: number    // 0-100
  energyIndex?: number   // 0-100
  match?: Match
}

interface BarProps {
  label: string
  value: number
}

function SubBar({ label, value }: BarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/30 w-24 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] font-lexend font-bold text-primary-container w-8 text-right">
        {Math.round(value)}%
      </span>
    </div>
  )
}

export function VibeMeter({
  value,
  atmosphere = value,
  crowdNoise  = Math.min(100, value - 4),
  energyIndex = Math.min(100, value - 9),
  match,
}: VibeMeterProps) {
  const label =
    value >= 95 ? 'Electric'
    : value >= 80 ? 'Intense'
    : value >= 60 ? 'Lively'
    : 'Atmospheric'

  return (
    <GlassCard className="p-5 border-primary-container/20">
      {/* Match context */}
      {match && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/6">
          <div>
            <p className="font-lexend font-bold text-xs text-white">
              {match.home_team.code}
              <span className="text-white/25 mx-2 font-normal">vs</span>
              {match.away_team.code}
            </p>
            <p className="text-[10px] text-white/30 font-lexend mt-0.5">
              {match.stadium?.city ?? 'Venue'} · {match.stage}
            </p>
          </div>
          {match.status === 'live' && (
            <div className="flex items-center gap-1.5">
              <span className="font-lexend font-black text-lg text-primary-container">
                {match.home_score} – {match.away_score}
              </span>
              <span className="text-[10px] font-lexend text-white/30">{match.minute}'</span>
            </div>
          )}
        </div>
      )}

      {/* Score + bars */}
      <div className="flex gap-5 items-end">
        {/* Big number */}
        <div className="flex-shrink-0">
          <p className="font-lexend font-black text-5xl text-primary-container leading-none">
            {Math.round(value)}
          </p>
          <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/30 mt-1">
            Vibe score
          </p>
        </div>

        {/* Sub-bars */}
        <div className="flex-1 space-y-2.5">
          <SubBar label="Atmosphere"  value={atmosphere}  />
          <SubBar label="Crowd noise" value={crowdNoise}  />
          <SubBar label="Energy"      value={energyIndex} />
        </div>
      </div>

      {/* Footer scale */}
      <div className="flex justify-between mt-4 pt-3 border-t border-white/5">
        <span className="text-[9px] font-lexend font-bold uppercase tracking-widest text-white/20">
          Atmospheric
        </span>
        <span className={`text-[9px] font-lexend font-bold uppercase tracking-widest ${
          value >= 80 ? 'text-primary-container' : 'text-white/20'
        }`}>
          ⚡ {label}
        </span>
      </div>
    </GlassCard>
  )
}