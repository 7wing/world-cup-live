import { GlassCard } from '@/components/ui/GlassCard'
import { TeamFlag } from '@/components/ui/TeamFlag'
import { formatKickoff } from '@/utils/formatDate'
import { getKnockoutWinner, getPenaltyScores } from '@/utils/tournament'
import type { Match } from '@/types'
import { cn } from '@/utils/cn'

interface ScoreCardProps {
  match: Match
  onClick?: () => void
}

export function ScoreCard({ match, onClick }: ScoreCardProps) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const pens = getPenaltyScores(match)
  const winner = getKnockoutWinner(match)

  return (
    <GlassCard
      className={cn('p-4 cursor-pointer hover:border-white/20 transition-all', isLive && 'border-l-2 border-l-primary-container bg-primary-container/5')}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="font-lexend text-[10px] font-semibold text-on-surface-variant uppercase">
          {match.stage} · {isLive ? `${match.minute}'` : isFinished ? 'Full Time' : formatKickoff(match.kickoff_at)}
        </span>
        {isLive && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="text-[10px] font-bold text-primary-container uppercase">Live</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamFlag code={match.home_team.code} flagUrl={match.home_team.flag_url} size="md" />
          <span className={cn(
            'font-lexend font-bold uppercase text-sm truncate',
            winner === 'home' && isFinished && 'text-white',
            winner === 'away' && isFinished && 'text-white/40',
          )}>{match.home_team.name}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          {(isLive || isFinished) ? (
            <>
              <span className={cn('font-lexend font-black text-xl', isLive && 'text-primary-container')}>
                {match.home_score} - {match.away_score}
              </span>
              {pens.decidedByPens && isFinished && (
                <span className="text-[9px] font-lexend text-white/30">
                  pens {pens.home}–{pens.away}
                </span>
              )}
            </>
          ) : (
            <span className="font-lexend text-white/20 text-sm uppercase tracking-widest">vs</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className={cn(
            'font-lexend font-bold uppercase text-sm truncate text-right',
            winner === 'away' && isFinished && 'text-white',
            winner === 'home' && isFinished && 'text-white/40',
          )}>{match.away_team.name}</span>
          <TeamFlag code={match.away_team.code} flagUrl={match.away_team.flag_url} size="md" />
        </div>
      </div>

      {isLive && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/40 font-semibold uppercase">Possession</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary-container" style={{ width: `${match.home_possession}%` }} />
            </div>
            <span className="text-[10px] text-primary-container font-semibold">{match.home_possession}%</span>
          </div>
        </div>
      )}
    </GlassCard>
  )
}