// src/components/matches/BracketTab.tsx

import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as Flags from 'country-flag-icons/react/3x2'
import { supabase } from '@/lib/supabase'
import type { Match } from '@/types'

// ── Supabase query ────────────────────────────────────────────────────────────
const KNOCKOUT_STAGES = ['round_of_16', 'quarter_final', 'semi_final', 'final', 'third_place']

const MATCH_SELECT = `
  *,
  home_team:teams!matches_home_team_id_fkey(*),
  away_team:teams!matches_away_team_id_fkey(*),
  stadium:stadiums(*)
`

async function fetchKnockoutMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .in('stage', KNOCKOUT_STAGES)
    .order('kickoff_at', { ascending: true })

  if (error) throw error
  return data as Match[]
}

function useKnockoutMatches() {
  return useQuery({
    queryKey: ['matches', 'knockout'],
    queryFn: fetchKnockoutMatches,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function tzAbbr(): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find(p => p.type === 'timeZoneName')?.value ?? ''
  } catch { return '' }
}

function localDateLabel(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ── Flag ──────────────────────────────────────────────────────────────────────
function TeamFlag({ code }: { code: string | null | undefined }) {
  if (!code) return <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0" />
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code]
  if (!FlagComponent)
    return (
      <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0 items-center justify-center">
        <span className="text-[7px] font-mono text-white/30">{code}</span>
      </span>
    )
  return <FlagComponent className="w-5 h-[14px] rounded-[2px] flex-shrink-0 shadow-sm" style={{ display: 'inline-block' }} />
}

// ── MatchCard ─────────────────────────────────────────────────────────────────
function MatchCard({ match, isFinal = false }: { match: Match | null; isFinal?: boolean }) {
  const navigate = useNavigate()
  const isPlaceholder = !match

  if (isPlaceholder) {
    return (
      <div className={`rounded-xl overflow-hidden border border-white/8 bg-white/3 ${isFinal ? 'border-amber-400/20 bg-amber-400/3' : ''}`}>
        {[0, 1].map(i => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 ${i === 0 ? 'border-b border-white/8' : ''}`}>
            <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0" />
            <span className="font-lexend font-normal text-[11px] flex-1 truncate text-white/20 italic">TBD</span>
          </div>
        ))}
        <div className="px-3 py-1 bg-white/2 border-t border-white/5">
          <p className="text-[9px] font-lexend text-white/10">&nbsp;</p>
        </div>
      </div>
    )
  }

  const isFinished = match.status === 'finished'
  const isClickable = isFinished || match.status === 'live'
  const homeWins = (match.home_score ?? 0) > (match.away_score ?? 0) ||
    (match.decided_by_pens && (match.home_score_pens ?? 0) > (match.away_score_pens ?? 0))
  const awayWins = !homeWins && isFinished

  const rows = [
    {
      team: match.home_team,
      score: match.home_score,
      penScore: match.home_score_pens,
      winner: homeWins,
    },
    {
      team: match.away_team,
      score: match.away_score,
      penScore: match.away_score_pens,
      winner: awayWins,
    },
  ]

  return (
    <div
      onClick={() => isClickable && navigate(`/matches/${match.id}`)}
      className={`rounded-xl overflow-hidden border transition-all ${
        isFinal
          ? 'border-amber-400/40 bg-amber-400/5'
          : 'border-white/10 bg-white/3 hover:border-white/20'
      } ${isClickable ? 'cursor-pointer hover:border-white/30' : 'cursor-default'}`}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-3 py-2 ${i === 0 ? 'border-b border-white/8' : ''} ${row.winner ? 'bg-primary-container/10' : ''}`}
        >
          <TeamFlag code={row.team?.code} />
          <span className={`font-lexend font-semibold text-[11px] flex-1 truncate ${
            row.winner ? 'text-white'
            : isFinished ? 'text-white/35'
            : 'text-white/70'
          }`}>
            {row.team?.name ?? 'TBD'}
          </span>
          {isFinished && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`font-lexend font-black text-sm ${row.winner ? 'text-primary-container' : 'text-white/20'}`}>
                {row.score ?? '–'}
              </span>
              {match.decided_by_pens && row.penScore != null && (
                <span className="text-[9px] font-lexend text-white/30">({row.penScore})</span>
              )}
            </div>
          )}
        </div>
      ))}
      <div className="px-3 py-1 bg-white/2 border-t border-white/5">
        <p className="text-[9px] font-lexend text-white/20 truncate">
          {[
            match.stadium?.name,
            match.kickoff_at ? localDateLabel(match.kickoff_at) : null,
            match.decided_by_pens && isFinished ? 'pens.' : null,
          ].filter(Boolean).join(' · ') || '\u00A0'}
        </p>
      </div>
    </div>
  )
}

// ── Round column ──────────────────────────────────────────────────────────────
function RoundCol({ label, matches }: { label: string; matches: (Match | null)[] }) {
  return (
    <div className="flex flex-col flex-1 min-w-[120px]">
      <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">{label}</p>
      <div className="flex flex-col flex-1 justify-around gap-3">
        {matches.map((m, i) => <MatchCard key={m?.id ?? i} match={m} />)}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function BracketSkeleton() {
  return (
    <div className="flex gap-2 min-w-[640px] items-stretch animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-col flex-1 min-w-[120px] gap-3">
          <div className="h-3 w-16 mx-auto bg-white/10 rounded mb-3" />
          {Array.from({ length: i === 3 ? 1 : i < 3 ? 4 - i : 4 - (6 - i) || 1 }).map((_, j) => (
            <div key={j} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
              {[0, 1].map(k => (
                <div key={k} className={`flex items-center gap-2 px-3 py-2 ${k === 0 ? 'border-b border-white/8' : ''}`}>
                  <div className="w-5 h-[14px] bg-white/10 rounded" />
                  <div className="flex-1 h-2 bg-white/10 rounded" />
                </div>
              ))}
              <div className="px-3 py-1 bg-white/2 border-t border-white/5">
                <div className="h-2 w-20 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function BracketTab() {
  const { data: matches = [], isLoading, isError, refetch } = useKnockoutMatches()

  const byStage = (stage: string): Match[] =>
    matches.filter(m => m.stage === stage)
      .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())

  const r16      = byStage('round_of_16')
  const qf       = byStage('quarter_final')
  const sf       = byStage('semi_final')
  const finals   = byStage('final')
  const third    = byStage('third_place')

  // Pad arrays to expected counts with nulls for placeholders
  const pad = (arr: Match[], count: number): (Match | null)[] =>
    [...arr, ...Array(Math.max(0, count - arr.length)).fill(null)]

  const r16Padded = pad(r16, 8)
  const qfLeft    = pad(qf.slice(0, 2), 2)
  const qfRight   = pad(qf.slice(2, 4), 2)
  const sfLeft    = pad(sf.slice(0, 1), 1)
  const sfRight   = pad(sf.slice(1, 2), 1)
  const finalMatch   = finals[0] ?? null
  const thirdMatch   = third[0] ?? null

  // Determine champion
  let champion = 'TBD'
  if (finalMatch && finalMatch.status === 'finished') {
    const homeWins = (finalMatch.home_score ?? 0) > (finalMatch.away_score ?? 0) ||
      (finalMatch.decided_by_pens && (finalMatch.home_score_pens ?? 0) > (finalMatch.away_score_pens ?? 0))
    champion = homeWins ? (finalMatch.home_team?.name ?? 'TBD') : (finalMatch.away_team?.name ?? 'TBD')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
            FIFA World Cup 2026 · Knockout Stage
          </p>
          {tzAbbr() && (
            <p className="text-[9px] font-lexend text-white/15 mt-0.5">
              Times shown in your local timezone · {tzAbbr()}
            </p>
          )}
        </div>
        <div className="hidden md:flex items-center gap-3 text-[9px] font-lexend font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container/60" />
            <span className="text-white/25">Winner</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400/60" />
            <span className="text-white/25">Final</span>
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
          <BracketSkeleton />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <span className="material-symbols-outlined text-4xl text-white/10">wifi_off</span>
          <p className="font-lexend font-black text-sm text-white/20">Failed to load bracket</p>
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
          {/* Main bracket */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
            <div className="flex gap-2 min-w-[640px] items-stretch">

              {/* Left QF */}
              <RoundCol label="Quarterfinal" matches={qfLeft} />
              <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
                {qfLeft.map((_, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div className="w-full border-t border-white/8" />
                  </div>
                ))}
              </div>

              {/* Left SF */}
              <div className="flex flex-col flex-1 min-w-[120px] justify-center">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">Semifinal</p>
                <MatchCard match={sfLeft[0]} />
              </div>
              <div className="flex items-center w-3 flex-shrink-0">
                <div className="w-full border-t border-white/8" />
              </div>

              {/* Center: Final + Champion */}
              <div className="flex flex-col items-center justify-center min-w-[130px] flex-shrink-0 gap-3">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/60 text-center">Final</p>
                <div className="flex flex-col items-center gap-1 py-3 px-4 bg-amber-400/8 border border-amber-400/25 rounded-xl w-full">
                  <span className="material-symbols-outlined text-2xl text-amber-400/60">emoji_events</span>
                  <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/70">2026 Champion</p>
                  <p className={`font-lexend font-black text-xs mt-0.5 ${champion === 'TBD' ? 'text-white/25 italic' : 'text-amber-400'}`}>
                    {champion}
                  </p>
                </div>
                <MatchCard match={finalMatch} isFinal />
              </div>

              <div className="flex items-center w-3 flex-shrink-0">
                <div className="w-full border-t border-white/8" />
              </div>

              {/* Right SF */}
              <div className="flex flex-col flex-1 min-w-[120px] justify-center">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">Semifinal</p>
                <MatchCard match={sfRight[0]} />
              </div>
              <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
                {qfRight.map((_, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div className="w-full border-t border-white/8" />
                  </div>
                ))}
              </div>

              {/* Right QF */}
              <RoundCol label="Quarterfinal" matches={qfRight} />
            </div>
          </div>

          <p className="flex items-center gap-1.5 mt-3 text-[10px] font-lexend text-white/15 sm:hidden">
            <span className="material-symbols-outlined text-sm">swipe</span>
            Swipe to see full bracket
          </p>

          {/* Third place */}
          {(thirdMatch || matches.some(m => m.stage === 'semi_final')) && (
            <div className="mt-6">
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 mb-3">Third Place</p>
              <div className="max-w-[200px]">
                <MatchCard match={thirdMatch} />
              </div>
            </div>
          )}

          {/* Round of 16 */}
          <div className="mt-8">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 mb-4">Round of 16</p>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[480px]">
                {r16Padded.map((m, i) => <MatchCard key={m?.id ?? `placeholder-${i}`} match={m} />)}
              </div>
            </div>
          </div>

          {matches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center mt-4">
              <span className="material-symbols-outlined text-4xl text-white/10 mb-3">account_tree</span>
              <p className="font-lexend font-black text-sm text-white/20">Knockout stage hasn't started yet</p>
              <p className="font-lexend text-[11px] text-white/10 mt-1">Check back after the group stage</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}