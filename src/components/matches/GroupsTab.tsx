// src/components/matches/GroupsTab.tsx

import { useQuery } from '@tanstack/react-query'
import * as Flags from 'country-flag-icons/react/3x2'
import { GlassCard } from '@/components/ui/GlassCard'
import { fetchStandings } from '@/api/matches'
import type { Team } from '@/types'

// ── Flag ──────────────────────────────────────────────────────────────────────
function TeamFlag({ code }: { code: string | null }) {
  if (!code) return <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0" />
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code]
  if (!FlagComponent) {
    return (
      <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0 items-center justify-center">
        <span className="text-[7px] font-mono text-white/30">{code}</span>
      </span>
    )
  }
  return <FlagComponent className="w-5 h-[14px] rounded-[2px] flex-shrink-0 shadow-sm" style={{ display: 'inline-block' }} />
}

// ── GroupCard ─────────────────────────────────────────────────────────────────
// Teams from Supabase have no computed W/D/L/GD — we display what we have.
// Once match results are seeded, a view or RPC can provide full standings.
// For now we render the team list per group ordered by the DB (group_letter).
function GroupCard({ letter, teams }: { letter: string; teams: Team[] }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
        <span className="font-lexend font-black text-xs uppercase tracking-widest text-primary-container">
          Group {letter}
        </span>
      </div>
      {teams.map((team, i) => (
        <div
          key={team.id}
          className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 last:border-0"
        >
          <span className="text-[10px] font-lexend font-bold text-white/25 w-3 flex-shrink-0">{i + 1}</span>
          <TeamFlag code={team.code} />
          <span className="font-lexend font-semibold text-xs flex-1 truncate text-white/70">
            {team.name}
          </span>
        </div>
      ))}
    </GlassCard>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
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

// ── Main ──────────────────────────────────────────────────────────────────────
export function GroupsTab() {
  const { data: teams = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['standings'],
    queryFn: fetchStandings,
    staleTime: 60_000,
  })

  // Group teams by group_letter
  const grouped = (teams as Team[]).reduce<Record<string, Team[]>>((acc, team) => {
    const letter = team.group_letter ?? 'TBD'
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(team)
    return acc
  }, {})

  const sortedLetters = Object.keys(grouped).sort()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
          FIFA World Cup 2026 · Group Stage
        </p>
      </div>

      {isLoading && <SkeletonGrid />}

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
            {sortedLetters.map(letter => (
              <GroupCard key={letter} letter={letter} teams={grouped[letter]} />
            ))}
          </div>
          {sortedLetters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-4xl text-white/10 mb-3">groups</span>
              <p className="font-lexend font-black text-sm text-white/20">No teams found</p>
            </div>
          )}
          <p className="mt-5 text-[10px] font-lexend text-white/15 text-center uppercase tracking-widest">
            48 teams · 12 groups · Official FIFA World Cup 2026
          </p>
        </>
      )}
    </div>
  )
}