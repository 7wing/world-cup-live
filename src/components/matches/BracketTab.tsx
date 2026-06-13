// src/components/matches/BracketTab.tsx

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatches } from '@/hooks/useMatches'
import { TeamFlag } from '@/components/ui/TeamFlag'
import { YearToggle } from '@/components/matches/YearToggle'
import { TROPHY_BY_YEAR } from '@/assets/trophy'
import {
  KNOCKOUT_STAGES,
  filterByYear,
  getKnockoutWinner,
  getPenaltyScores,
  type TournamentYear,
} from '@/utils/tournament'
import type { Match } from '@/types'

function tzAbbr(): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}

function localDateLabel(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function MatchCard({
  match,
  isFinal = false,
  predictionMode,
  picked,
  onPick,
}: {
  match: Match | null
  isFinal?: boolean
  predictionMode?: boolean
  picked?: Record<string, string>
  onPick?: (matchId: string, teamId: string, teamName: string) => void
}) {
  const navigate = useNavigate()
  const [showPicker, setShowPicker] = useState(false)
  const isPlaceholder = !match

  if (isPlaceholder) {
    return (
      <div className={`rounded-xl overflow-hidden border border-white/8 bg-white/3 ${isFinal ? 'border-amber-400/20 bg-amber-400/3' : ''}`}>
        {[0, 1].map((i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 ${i === 0 ? 'border-b border-white/8' : ''}`}>
            <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0" />
            <span className="font-lexend font-normal text-[11px] flex-1 truncate text-white/20 italic">TBC</span>
          </div>
        ))}
        <div className="px-3 py-1 bg-white/2 border-t border-white/5">
          <p className="text-[9px] font-lexend text-white/10">&nbsp;</p>
        </div>
      </div>
    )
  }

  const isFinished = match.status === 'finished'
  const isUpcoming = match.status === 'upcoming'
  const isClickable = isFinished || match.status === 'live'
  const winner = getKnockoutWinner(match)
  const pens = getPenaltyScores(match)

  const rows = [
    { side: 'home', team: match.home_team, score: match.home_score, penScore: pens.home, isWinner: winner === 'home' },
    { side: 'away', team: match.away_team, score: match.away_score, penScore: pens.away, isWinner: winner === 'away' },
  ]

  const predictedTeamId = match?.id ? picked?.[match.id] : undefined

  return (
    <div
      onClick={() => {
        if (!predictionMode && isClickable && match) {
          navigate(`/matches/${match.id}`)
        }
      }}
      className={`rounded-xl overflow-hidden border transition-all relative ${
        isFinal
          ? 'border-amber-400/40 bg-amber-400/5'
          : 'border-white/10 bg-white/3 hover:border-white/20'
      } ${isClickable && !predictionMode ? 'cursor-pointer hover:border-white/30' : 'cursor-default'}`}
    >
      {predictionMode && (
        <div className="absolute top-1 right-1 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setShowPicker((s) => !s) }}
            className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/20 transition-colors"
            title="Pick winner"
          >
            <span className="material-symbols-outlined text-[12px]">edit</span>
          </button>
        </div>
      )}
      {showPicker && predictionMode && (
        <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3">
          <p className="text-[9px] font-lexend font-black uppercase tracking-widest text-white/40 mb-1">Pick Winner</p>
          {rows.map((r) => (
            <button
              key={r.side}
              onClick={() => {
                onPick?.(match.id, r.team?.id ?? '', r.team?.name ?? 'TBC')
                setShowPicker(false)
              }}
              className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-primary-container/20 hover:border-primary-container/40 transition-colors text-[11px] font-lexend font-bold text-white/80 truncate"
            >
              {r.team?.name ?? 'TBC'}
            </button>
          ))}
          <button onClick={() => setShowPicker(false)} className="text-[10px] text-white/30 hover:text-white/50 font-lexend mt-1">Close</button>
        </div>
      )}
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-3 py-2 ${i === 0 ? 'border-b border-white/8' : ''} ${row.isWinner ? 'bg-primary-container/10' : ''} ${predictedTeamId && row.team?.id === predictedTeamId ? 'ring-1 ring-primary-container/50' : ''}`}
        >
          <TeamFlag code={row.team?.code} flagUrl={row.team?.flag_url} />
          <span className={`font-lexend font-semibold text-[11px] flex-1 truncate ${
            row.isWinner ? 'text-white'
            : isFinished ? 'text-white/35'
            : 'text-white/70'
          }`}>
            {row.team?.name ?? 'TBC'}
          </span>
          {isFinished && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`font-lexend font-black text-sm ${row.isWinner ? 'text-primary-container' : 'text-white/20'}`}>
                {row.score ?? '-'}
              </span>
              {pens.decidedByPens && row.penScore != null && (
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
            pens.decidedByPens && isFinished ? 'pens.' : null,
          ].filter(Boolean).join(' · ') || '\u00A0'}
        </p>
      </div>
    </div>
  )
}

function RoundCol({ label, matches, predictionMode, picked, onPick }: { label: string; matches: (Match | null)[]; predictionMode?: boolean; picked?: Record<string,string>; onPick?: (matchId:string,teamId:string,teamName:string)=>void }) {
  return (
    <div className="flex flex-col flex-1 min-w-[120px]">
      <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">{label}</p>
      <div className="flex flex-col flex-1 justify-around gap-3">
        {matches.map((m, i) => (
          <MatchCard key={m?.id ?? i} match={m} predictionMode={predictionMode} picked={picked} onPick={onPick} />
        ))}
      </div>
    </div>
  )
}

function BracketSkeleton() {
  return (
    <div className="flex gap-2 min-w-[640px] items-stretch animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-col flex-1 min-w-[120px] gap-3">
          <div className="h-3 w-16 mx-auto bg-white/10 rounded mb-3" />
          {Array.from({ length: i === 3 ? 1 : i < 3 ? 4 - i : 4 - (6 - i) || 1 }).map((_, j) => (
            <div key={j} className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
              {[0, 1].map((k) => (
                <div key={k} className={`flex items-center gap-2 px-3 py-2 ${k === 0 ? 'border-b border-white/8' : ''}`}>
                  <div className="w-5 h-[14px] bg-white/10 rounded" />
                  <div className="flex-1 h-2 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function BracketTab() {
  const [year, setYear] = useState<TournamentYear>(2026)
  const [isPredicting, setIsPredicting] = useState(false)
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`bracket-picks-${year}`) ?? '{}')
    } catch {
      return {}
    }
  })

  const { data: allMatches = [], isLoading, isError, refetch } = useMatches()

  // Persist picks whenever they change
  useEffect(() => {
    localStorage.setItem(`bracket-picks-${year}`, JSON.stringify(picked))
  }, [picked, year])

  // Advance a picked winner into the next round slot
  const downstream: Record<string, { matchId: string; slot: 'home' | 'away' }> = {
    'of-2022-57': { matchId: 'of-2022-61', slot: 'away' },
    'of-2022-58': { matchId: 'of-2022-61', slot: 'home' },
    'of-2022-59': { matchId: 'of-2022-62', slot: 'away' },
    'of-2022-60': { matchId: 'of-2022-62', slot: 'home' },
    'of-2022-61': { matchId: 'of-2022-64', slot: 'home' },
    'of-2022-62': { matchId: 'of-2022-64', slot: 'away' },
  }

  const handlePick = (matchId: string, teamId: string, teamName: string) => {
    const next = downstream[matchId]
    setPicked((prev) => {
      const updated = { ...prev, [matchId]: teamId }
      if (next) {
        // propagate winner team name as raw string into next slot
        // (we store display-name predictions for downstream placeholders)
        updated[next.matchId] = teamName
      }
      return updated
    })
  }

  const clearPicks = () => {
    setPicked({})
    localStorage.removeItem(`bracket-picks-${year}`)
  }

  const matches = useMemo(
    () => filterByYear(allMatches, year).filter((m) => KNOCKOUT_STAGES.includes(m.stage as typeof KNOCKOUT_STAGES[number])),
    [allMatches, year],
  )

  const byStage = (stage: string): Match[] =>
    matches
      .filter((m) => m.stage === stage)
      .sort((a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime())

  const r16 = byStage('round-of-16')
  const qf = byStage('quarter-final')
  const sf = byStage('semi-final')
  const finals = byStage('final')
  const third = byStage('third-place')

  const pad = (arr: Match[], count: number): (Match | null)[] =>
    [...arr, ...Array(Math.max(0, count - arr.length)).fill(null)]

  const r16Padded = pad(r16, 8)
  const qfLeft = pad(qf.slice(0, 2), 2)
  const qfRight = pad(qf.slice(2, 4), 2)
  const sfLeft = pad(sf.slice(0, 1), 1)
  const sfRight = pad(sf.slice(1, 2), 1)
  const finalMatch = finals[0] ?? null
  const thirdMatch = third[0] ?? null

  let champion = 'TBC'
  if (finalMatch && finalMatch.status === 'finished') {
    const winner = getKnockoutWinner(finalMatch)
    champion = winner === 'home'
      ? (finalMatch.home_team?.name ?? 'TBC')
      : winner === 'away'
        ? (finalMatch.away_team?.name ?? 'TBC')
        : 'TBC'
  }
  // Show predicted champion if final match has a prediction
  const predictedChampionId = finalMatch?.id ? picked[finalMatch.id] : undefined
  if (predictedChampionId) {
    const team = finalMatch?.home_team?.id === predictedChampionId
      ? finalMatch.home_team
      : finalMatch?.away_team?.id === predictedChampionId
        ? finalMatch.away_team
        : undefined
    if (team) champion = team.name
  }

  const trophy = TROPHY_BY_YEAR[year]
  const is2026Empty = year === 2026 && matches.length === 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
            FIFA World Cup {year} · Knockout Stage
          </p>
          {tzAbbr() && (
            <p className="text-[9px] font-lexend text-white/15 mt-0.5">
              Times shown in your local timezone · {tzAbbr()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPredicting((p) => !p)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-lexend font-bold uppercase tracking-widest border transition-colors ${
              isPredicting
                ? 'bg-primary-container/10 border-primary-container/30 text-primary-container'
                : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'
            }`}
          >
            {isPredicting ? 'Done Predicting' : 'Predict Bracket'}
          </button>
          <YearToggle year={year} onChange={setYear} />
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
          {is2026Empty && (
            <p className="text-[10px] font-lexend text-white/20 text-center mb-4 uppercase tracking-widest">
              Knockout fixtures TBC · Group stage in progress
            </p>
          )}

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
            <div className="flex gap-2 min-w-[640px] items-stretch">
              <RoundCol label="Quarterfinal" matches={qfLeft} predictionMode={isPredicting} picked={picked} onPick={handlePick} />
              <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
                {qfLeft.map((_, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div className="w-full border-t border-white/8" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col flex-1 min-w-[120px] justify-center">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">Semifinal</p>
                <MatchCard match={sfLeft[0]} predictionMode={isPredicting} picked={picked} onPick={handlePick} />
              </div>
              <div className="flex items-center w-3 flex-shrink-0">
                <div className="w-full border-t border-white/8" />
              </div>

              <div className="flex flex-col items-center justify-center min-w-[130px] flex-shrink-0 gap-3">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/60 text-center">Final</p>
                <div className="flex flex-col items-center gap-1 py-3 px-4 bg-amber-400/8 border border-amber-400/25 rounded-xl w-full">
                  <img src={trophy} alt="" className="w-10 h-10 object-contain drop-shadow-lg" />
                  <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/70">{year} Champion</p>
                  <p className={`font-lexend font-black text-xs mt-0.5 ${champion === 'TBC' ? 'text-white/25 italic' : 'text-amber-400'}`}>
                    {champion}
                  </p>
                </div>
                <MatchCard match={finalMatch} isFinal predictionMode={isPredicting} picked={picked} onPick={handlePick} />
              </div>

              <div className="flex items-center w-3 flex-shrink-0">
                <div className="w-full border-t border-white/8" />
              </div>

              <div className="flex flex-col flex-1 min-w-[120px] justify-center">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">Semifinal</p>
                <MatchCard match={sfRight[0]} predictionMode={isPredicting} picked={picked} onPick={handlePick} />
              </div>
              <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
                {qfRight.map((_, i) => (
                  <div key={i} className="flex-1 flex items-center">
                    <div className="w-full border-t border-white/8" />
                  </div>
                ))}
              </div>

              <RoundCol label="Quarterfinal" matches={qfRight} predictionMode={isPredicting} picked={picked} onPick={handlePick} />
            </div>
          </div>

          <p className="flex items-center gap-1.5 mt-3 text-[10px] font-lexend text-white/15 sm:hidden">
            <span className="material-symbols-outlined text-sm">swipe</span>
            Swipe to see full bracket
          </p>

          {(thirdMatch || matches.some((m) => m.stage === 'semi-final')) && (
            <div className="mt-6">
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 mb-3">Third Place</p>
              <div className="max-w-[200px]">
                <MatchCard match={thirdMatch} predictionMode={isPredicting} picked={picked} onPick={handlePick} />
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 mb-4">Round of 16</p>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[480px]">
                {r16Padded.map((m, i) => <MatchCard key={m?.id ?? `placeholder-${i}`} match={m} predictionMode={isPredicting} picked={picked} onPick={handlePick} />)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
