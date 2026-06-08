// src/components/matches/GroupsTab.tsx

import { useState, useMemo } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { TeamFlag } from '@/components/ui/TeamFlag'
import { YearToggle } from '@/components/matches/YearToggle'
import { useMatches } from '@/hooks/useMatches'
import {
  buildGroupStandings,
  type GroupStanding,
  type TournamentYear,
} from '@/utils/tournament'

function GroupCard({ letter, standings }: { letter: string; standings: GroupStanding[] }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
        <span className="font-lexend font-black text-xs uppercase tracking-widest text-primary-container">
          Group {letter}
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1rem_1.25rem_1fr_repeat(4,1.5rem)] gap-x-1.5 px-4 py-1.5 border-b border-white/5 bg-white/2">
        <span />
        <span />
        <span className="text-[8px] font-lexend font-bold uppercase tracking-wider text-white/20">Team</span>
        <span className="text-[8px] font-lexend font-bold uppercase tracking-wider text-white/20 text-center">P</span>
        <span className="text-[8px] font-lexend font-bold uppercase tracking-wider text-white/20 text-center">GF</span>
        <span className="text-[8px] font-lexend font-bold uppercase tracking-wider text-white/20 text-center">GA</span>
        <span className="text-[8px] font-lexend font-bold uppercase tracking-wider text-primary-container/50 text-center">Pts</span>
      </div>

      {standings.map((row, i) => (
        <div
          key={row.team.id}
          className="grid grid-cols-[1rem_1.25rem_1fr_repeat(4,1.5rem)] gap-x-1.5 items-center px-4 py-2.5 border-b border-white/5 last:border-0"
        >
          <span className="text-[10px] font-lexend font-bold text-white/25">{i + 1}</span>
          <TeamFlag code={row.team.code} flagUrl={row.team.flag_url} size="sm" />
          <span className="font-lexend font-semibold text-xs truncate text-white/70 min-w-0">
            {row.team.name}
          </span>
          <span className="text-[10px] font-lexend font-semibold text-white/40 text-center">{row.played}</span>
          <span className="text-[10px] font-lexend font-semibold text-white/40 text-center">{row.gf}</span>
          <span className="text-[10px] font-lexend font-semibold text-white/40 text-center">{row.ga}</span>
          <span className="text-[10px] font-lexend font-black text-primary-container text-center">{row.pts}</span>
        </div>
      ))}
    </GlassCard>
  )
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} className="overflow-hidden animate-pulse">
          <div className="px-4 py-2.5 border-b border-white/8 bg-white/3">
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 last:border-0">
              <div className="w-3 h-2 bg-white/10 rounded" />
              <div className="w-5 h-[14px] bg-white/10 rounded" />
              <div className="flex-1 h-2 bg-white/10 rounded" />
            </div>
          ))}
        </GlassCard>
      ))}
    </div>
  )
}

export function GroupsTab() {
  const [year, setYear] = useState<TournamentYear>(2026)
  const { data: matches = [], isLoading, isError, refetch } = useMatches()

  const standings = useMemo(
    () => buildGroupStandings(matches, year),
    [matches, year],
  )

  const sortedLetters = Object.keys(standings).sort()
  const teamCount = sortedLetters.reduce((n, l) => n + standings[l].length, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
            FIFA World Cup {year} · Group Stage
          </p>
          {!isLoading && (
            <p className="text-[9px] font-lexend text-white/15 mt-0.5">
              {teamCount} teams · {sortedLetters.length} groups
            </p>
          )}
        </div>
        <YearToggle year={year} onChange={setYear} />
      </div>

      {isLoading && <SkeletonGrid count={year === 2022 ? 8 : 12} />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="material-symbols-outlined text-4xl text-white/10">wifi_off</span>
          <p className="font-lexend font-black text-sm text-white/20">Failed to load standings</p>
          <button
            onClick={() => refetch()}
            className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary-container/60 hover:text-primary-container transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {sortedLetters.map((letter) => (
              <GroupCard key={letter} letter={letter} standings={standings[letter]} />
            ))}
          </div>
          {sortedLetters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-4xl text-white/10 mb-3">groups</span>
              <p className="font-lexend font-black text-sm text-white/20">No groups found for {year}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
