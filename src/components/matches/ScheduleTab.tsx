// src/components/matches/ScheduleTab.tsx

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { TeamFlag } from '@/components/ui/TeamFlag'
import { useMatches } from '@/hooks/useMatches'
import { usePrefetchMatch } from '@/hooks/usePrefetchMatch'
import { formatMatchStageLabel, getKnockoutWinner, getPenaltyScores } from '@/utils/tournament'
import type { Match } from '@/types'

// ── Timezone helpers ──────────────────────────────────────────────────────────
function localTime(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function localDateKey(isoUtc: string): string {
  const d = new Date(isoUtc)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateLabel(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'long' })
}

function tzAbbr(): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find(p => p.type === 'timeZoneName')?.value ?? ''
  } catch { return '' }
}

function groupByLocalDate(matches: Match[]): [string, Match[]][] {
  const map: Record<string, Match[]> = {}
  for (const m of matches) {
    const key = localDateKey(m.kickoff_at)
    if (!map[key]) map[key] = []
    map[key].push(m)
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

// ── Fixture Row ───────────────────────────────────────────────────────────────
function FixtureRow({ match }: { match: Match }) {
  const navigate = useNavigate()
  const prefetch = usePrefetchMatch()
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'
  const winner = getKnockoutWinner(match)
  const pens = getPenaltyScores(match)

  return (
    <div
      onClick={() => navigate(`/matches/${match.id}`)}
      onMouseEnter={() => prefetch(match)}
      onFocus={() => prefetch(match)}
      tabIndex={0}
      className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group outline-none"
    >
      {/* Local time / FT / Live */}
      <div className="w-10 flex-shrink-0 text-center">
        {isFinished
          ? <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-primary-container/60">FT</span>
          : isLive
            ? <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-primary-container animate-pulse">{match.minute}'</span>
            : <span className="text-[10px] font-lexend font-bold text-white/25">{localTime(match.kickoff_at)}</span>
        }
      </div>

      {/* Home team */}
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <span className={`font-lexend font-semibold text-xs truncate text-right ${
          isFinished && winner === 'home' ? 'text-white'
          : isFinished ? 'text-white/35'
          : 'text-white/70'
        }`}>
          {match.home_team.name}
        </span>
        <TeamFlag code={match.home_team.code} flagUrl={match.home_team.flag_url} />
      </div>

      {/* Score / VS */}
      <div className="flex items-center gap-1.5 flex-shrink-0 w-14 justify-center">
        {(isLive || isFinished) ? (
          <>
            <span className={`font-lexend font-black text-sm w-4 text-center ${
              winner === 'home' ? 'text-white' : 'text-white/30'
            }`}>
              {match.home_score ?? 0}
            </span>
            <span className="text-white/15 font-lexend font-black text-xs">–</span>
            <span className={`font-lexend font-black text-sm w-4 text-center ${
              winner === 'away' ? 'text-white' : 'text-white/30'
            }`}>
              {match.away_score ?? 0}
            </span>
            {pens.decidedByPens && (
              <span className="text-[8px] font-lexend text-white/25 ml-0.5">({pens.home}-{pens.away}p)</span>
            )}
          </>
        ) : (
          <span className="text-[10px] font-lexend font-bold text-white/15 tracking-widest">vs</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamFlag code={match.away_team.code} flagUrl={match.away_team.flag_url} />
        <span className={`font-lexend font-semibold text-xs truncate ${
          isFinished && winner === 'away' ? 'text-white'
          : isFinished ? 'text-white/35'
          : 'text-white/70'
        }`}>
          {match.away_team.name}
        </span>
      </div>

      {/* Stage + venue */}
      <div className="hidden sm:flex flex-col items-end flex-shrink-0 w-40 gap-0.5">
        <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-primary-container/50">
          {formatMatchStageLabel(match)}
        </span>
        {match.stadium && (
          <span className="text-[9px] font-lexend text-white/15 w-full text-right truncate">
            {match.stadium.name}, {match.stadium.city}
          </span>
        )}
      </div>

      <span className="material-symbols-outlined text-[14px] text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0">
        chevron_right
      </span>
    </div>
  )
}

function DateSection({ matches }: { matches: Match[] }) {
  const label = formatDateLabel(matches[0].kickoff_at)
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2 bg-white/2 border-b border-white/5 sticky top-0 z-10 backdrop-blur-sm">
        <span className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">{label}</span>
        <span className="text-[9px] font-lexend text-white/15">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>
      {matches.map(m => <FixtureRow key={m.id} match={m} />)}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <GlassCard className="overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 animate-pulse">
          <div className="w-10 h-3 bg-white/10 rounded" />
          <div className="flex-1 h-3 bg-white/10 rounded" />
          <div className="w-14 h-3 bg-white/10 rounded" />
          <div className="flex-1 h-3 bg-white/10 rounded" />
        </div>
      ))}
    </GlassCard>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
type TabView = 'upcoming' | 'results'

export function ScheduleTab() {
  const [view, setView] = useState<TabView>('upcoming')
  const { data: matches = [], isLoading, isError, refetch } = useMatches()

  const upcoming = useMemo(() =>
    matches.filter(m => m.status === 'upcoming' || m.status === 'live')
      .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime()),
    [matches]
  )

  const results = useMemo(() =>
    matches.filter(m => m.status === 'finished')
      .sort((a, b) => new Date(b.kickoff_at).getTime() - new Date(a.kickoff_at).getTime()),
    [matches]
  )

  const upcomingByDate = useMemo(() => groupByLocalDate(upcoming), [upcoming])
  const resultsByDate  = useMemo(() => groupByLocalDate(results),  [results])

  const tz = tzAbbr()
  const activeList = view === 'upcoming' ? upcoming : results

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
            {isLoading ? 'Loading…' : `${activeList.length} ${activeList.length === 1 ? (view === 'upcoming' ? 'Fixture' : 'Result') : (view === 'upcoming' ? 'Fixtures' : 'Results')}`}
          </p>
          {tz && (
            <p className="text-[9px] font-lexend text-white/15 mt-0.5">
              Times shown in your local timezone · {tz}
            </p>
          )}
        </div>

        <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 self-end sm:self-auto">
          {(['upcoming', 'results'] as TabView[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-[10px] font-lexend font-bold uppercase tracking-wider rounded-md transition-all ${
                view === v ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {v === 'upcoming' ? 'Upcoming' : 'Results'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <SkeletonRows />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="material-symbols-outlined text-4xl text-white/10">wifi_off</span>
          <p className="font-lexend font-black text-sm text-white/20">Failed to load fixtures</p>
          <button
            onClick={() => refetch()}
            className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary-container/60 hover:text-primary-container transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && view === 'upcoming' && (
        upcomingByDate.length > 0 ? (
          <GlassCard className="overflow-hidden">
            {upcomingByDate.map(([dateKey, ms]) => <DateSection key={dateKey} matches={ms} />)}
          </GlassCard>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-3">sports_soccer</span>
            <p className="font-lexend font-black text-sm text-white/20">No upcoming fixtures</p>
          </div>
        )
      )}

      {!isLoading && !isError && view === 'results' && (
        resultsByDate.length > 0 ? (
          <GlassCard className="overflow-hidden">
            {resultsByDate.map(([dateKey, ms]) => <DateSection key={dateKey} matches={ms} />)}
          </GlassCard>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-3">sports_soccer</span>
            <p className="font-lexend font-black text-sm text-white/20">No results yet</p>
          </div>
        )
      )}
    </div>
  )
}