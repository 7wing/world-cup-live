// src/pages/matches/MatchDetailPage.tsx
// All data from Supabase. No mock data anywhere.

import { useState, useMemo, useEffect } from 'react'
import { useTranslation }       from 'react-i18next'
import { useParams }            from 'react-router-dom'
import { PageWrapper }          from '@/components/layout/PageWrapper'
import { ScoreCard }            from '@/components/matches/ScoreCard'
// VibeMeter import kept for when vibe data pipeline is added
// import { VibeMeter }            from '@/components/matches/VibeMeter'
import { LiveChatPanel }        from '@/components/fanzone/LiveChatPanel'
import { OraclePrediction }     from '@/components/games/OraclePrediction'
import { GlassCard }            from '@/components/ui/GlassCard'
import { ScorePredictor }       from '@/components/matches/ScorePredictor'
import {
  useMatch,
  useMatchStats,
  useLineups,
  useMatchEvents,
  useH2H,
} from '@/hooks/useMatches'
import { useOraclePrediction }  from '@/hooks/useOracle'
import { buildMomentumSeries }  from '@/api/matchEvents'
import { resolveHomePossession } from '@/utils/resolveHomePossession'
import { getMatchYear }         from '@/utils/tournament'
import type { Lineup }          from '@/types'
import type { MatchEvent }      from '@/api/matchEvents'
import type { MatchStat }       from '@/api/matches'

import {
  StatBar,
  MomentumChart,
  FormationPitch,
  H2HCard,
  POTMPoll,
  LiveFeed,
  type PitchPlayer,
  type H2HMatch,
  type POTMCandidate,
} from '@/components/matches/MatchDetailSubComponents'

// ── Data transformation helpers ───────────────────────────────────────────────

type StatRow = { label: string; home: number; away: number; unit: string }

/**
 * Build stat bar rows from match_stats + match.home_possession.
 *
 * home_possession comes from the `matches` table (match.home_possession),
 * NOT from match_stats. All other stats come from the match_stats row.
 * Returns [] when matchStat is null (pre-kickoff) so the UI shows the
 * "stats not yet available" placeholder.
 */
function buildStatRows(
  matchStat:       MatchStat | null | undefined,
  homePossession:  number,
): StatRow[] {
  if (!matchStat) return []

  return [
    { label: 'Possession',    home: homePossession,                       away: 100 - homePossession,                   unit: '%' },
    { label: 'Shots',         home: matchStat.home_shots             ?? 0, away: matchStat.away_shots             ?? 0, unit: ''  },
    { label: 'On Target',     home: matchStat.home_shots_on_target   ?? 0, away: matchStat.away_shots_on_target   ?? 0, unit: ''  },
    { label: 'Corners',       home: matchStat.home_corners           ?? 0, away: matchStat.away_corners           ?? 0, unit: ''  },
    { label: 'Fouls',         home: matchStat.home_fouls             ?? 0, away: matchStat.away_fouls             ?? 0, unit: ''  },
    { label: 'Yellow Cards',  home: matchStat.home_yellow_cards      ?? 0, away: matchStat.away_yellow_cards      ?? 0, unit: ''  },
    { label: 'Red Cards',     home: matchStat.home_red_cards         ?? 0, away: matchStat.away_red_cards         ?? 0, unit: ''  },
    { label: 'Passes',        home: matchStat.home_passes            ?? 0, away: matchStat.away_passes            ?? 0, unit: ''  },
    { label: 'Pass Accuracy', home: matchStat.home_pass_accuracy     ?? 0, away: matchStat.away_pass_accuracy     ?? 0, unit: '%' },
  ]
}

/**
 * Map starter lineup rows → PitchPlayer[] for FormationPitch.
 * Falls back to x=50, y=50 when position coordinates are missing,
 * so the pitch renders with players stacked in the centre rather than
 * throwing. Expect real coordinates once lineups are seeded.
 */
function lineupsToXI(lineups: Lineup[], teamId: string): PitchPlayer[] {
  return lineups
    .filter(l => l.team_id === teamId && l.is_starter)
    .map(l => ({
      number: l.player_number ?? 0,
      name:   l.player_name,
      x:      l.position_x   ?? 50,
      y:      l.position_y   ?? 50,
    }))
}

/**
 * Map finished match rows → H2HMatch[] for H2HCard.
 * stage is stored in the DB; falls back to 'World Cup' when absent.
 */
function matchesToH2HRows(matches: unknown[]): H2HMatch[] {
  return matches.map(m => {
    const homeScore = m.home_score ?? 0
    const awayScore = m.away_score ?? 0
    const result: H2HMatch['result'] =
      homeScore > awayScore ? 'home'
      : awayScore > homeScore ? 'away'
      : 'draw'

    return {
      date:       m.kickoff_at as string,
      home:       (m.home_team as { name: string })?.name ?? '?',
      away:       (m.away_team as { name: string })?.name ?? '?',
      score:      `${homeScore} – ${awayScore}`,
      result,
      tournament: (m.stage as string) ?? 'World Cup',
    }
  })
}

/**
 * Derive POTM candidates from goal events.
 * Uses a house emoji for home / plane for away — swap for real flag data
 * once team flags are available on match_events.
 */
function eventsToPOTMCandidates(
  events:     MatchEvent[],
  homeTeamId: string,
): POTMCandidate[] {
  const goalEvents = events.filter(e => e.event_type === 'goal' && e.player_name)
  if (!goalEvents.length) return []

  const map = new Map<string, { votes: number; flag: string }>()
  for (const ev of goalEvents) {
    const key  = ev.player_name!
    const flag = ev.team_id === homeTeamId ? '🏠' : '✈️'
    const prev = map.get(key)
    map.set(key, { votes: (prev?.votes ?? 0) + 1, flag: prev?.flag ?? flag })
  }

  return Array.from(map.entries())
    .map(([name, { votes, flag }]) => ({ name, flag, votes }))
    .sort((a, b) => b.votes - a.votes)
}

// ── Year-based conditional rendering helper ───────────────────────────────────

/** 2022 matches have already happened — hide prediction and chat features. */
function is2022Match(matchId: string): boolean {
  return getMatchYear(matchId) === 2022
}

/** Knockout slots that haven't been resolved yet use placeholder team names. */
function hasPlaceholderTeams(match: Match): boolean {
  const placeholder = /^(Winner|Runner|W\d+|R\d+|TBC|To Be Confirmed|Placeholders?)/i
  return placeholder.test(match.home_team.name) || placeholder.test(match.away_team.name)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <PageWrapper>
      <div className="glass-card h-28 rounded-xl animate-pulse mb-5" />
      <div className="flex gap-2 mb-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-white/5 rounded animate-pulse" />
        ))}
      </div>
      <div className="h-64 glass-card rounded-xl animate-pulse" />
    </PageWrapper>
  )
}

// ── Tab definition ────────────────────────────────────────────────────────────

type DetailTab = 'overview' | 'stats' | 'lineups' | 'h2h' | 'predictor'

const DETAIL_TABS: { id: DetailTab; label: string; icon: string }[] = [
  { id: 'overview',  label: 'Overview',   icon: 'sports_soccer'  },
  { id: 'stats',     label: 'Live Stats', icon: 'bar_chart'      },
  { id: 'lineups',   label: 'Lineups',    icon: 'people'         },
  { id: 'h2h',       label: 'H2H',        icon: 'compare_arrows' },
  { id: 'predictor', label: 'Predict',    icon: 'auto_awesome'   },
]

// ── Starting XI sidebar (reused in Stats + Lineups tabs) ──────────────────────

function StartingXISidebar({ lineups }: { lineups: Lineup[] }) {
  const starters = lineups.filter(l => l.is_starter)
  if (!starters.length) {
    return (
      <GlassCard className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/8">
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Starting XI</p>
        </div>
        <p className="p-4 text-center text-[11px] font-lexend text-white/20">Lineups not yet confirmed</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Starting XI</p>
      </div>
      <div className="divide-y divide-white/5">
        {starters.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-2">
            <span className="font-lexend font-black text-[10px] text-white/20 w-5">
              {p.player_number ?? '–'}
            </span>
            <span className="font-lexend font-semibold text-xs text-white/70 flex-1">
              {p.player_name}
            </span>
            <span className="text-[9px] font-lexend font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
              {p.position ?? '–'}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ── Match Stats card (reused in Overview + Stats tabs) ────────────────────────

function MatchStatsCard({
  statRows,
  homeCode,
  awayCode,
  showLegend = false,
}: {
  statRows:   StatRow[]
  homeCode:   string
  awayCode:   string
  showLegend?: boolean
}) {
  if (!statRows.length) {
    return (
      <GlassCard className="p-6 text-center">
        <p className="text-[11px] font-lexend text-white/20">Match statistics not yet available</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
          {showLegend ? 'Match Statistics' : 'Team Statistics'}
        </p>
        {showLegend && (
          <div className="flex items-center gap-3 text-[9px] font-lexend font-bold uppercase tracking-widest">
            <span className="text-primary-container flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              {homeCode}
            </span>
            <span className="text-white/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              {awayCode}
            </span>
          </div>
        )}
      </div>
      <div className="px-4 py-2">
        {statRows.map(s => (
          <StatBar key={s.label} label={s.label} home={s.home} away={s.away} unit={s.unit} />
        ))}
      </div>
    </GlassCard>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function MatchDetailPage() {
  const { t } = useTranslation()
  const { matchId }  = useParams<{ matchId: string }>()
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: match,    isLoading } = useMatch(matchId!)

  // Hide Predict tab for finished / 2022 matches (already decided)
  const showPredict = match ? match.status !== 'finished' && !is2022Match(match.id) : true
  const visibleTabs = showPredict ? DETAIL_TABS : DETAIL_TABS.filter(t => t.id !== 'predictor')

  // If active tab gets hidden after match load, fall back to overview
  useEffect(() => {
    if (match && !visibleTabs.some(t => t.id === activeTab)) {
      setActiveTab('overview')
    }
  }, [match, activeTab, visibleTabs])

  const { data: oracle }              = useOraclePrediction(match ?? null)
  const { data: matchStat }           = useMatchStats(matchId)
  const { data: lineups = [] }        = useLineups(matchId)
  const { data: events  = [] }        = useMatchEvents(matchId)
  const { data: h2hRaw  = [] }        = useH2H(
    match?.home_team.id,
    match?.away_team.id,
  )

  // ── Derived data ───────────────────────────────────────────────────────────
  // home_possession is on the `matches` row, NOT on match_stats.
  // matchStat covers shots, corners, fouls, cards, pass accuracy.
  const statRows = useMemo(
    () => buildStatRows(matchStat, resolveHomePossession(matchId!, match?.home_possession ?? 50)),
    [matchStat, match?.home_possession, matchId],
  )

  const momentumData = useMemo(
    () => match ? buildMomentumSeries(events as MatchEvent[], match.home_team.id) : [],
    [events, match],
  )

  const homeXI = useMemo(
    () => match ? lineupsToXI(lineups as Lineup[], match.home_team.id) : [],
    [lineups, match],
  )
  const awayXI = useMemo(
    () => match ? lineupsToXI(lineups as Lineup[], match.away_team.id) : [],
    [lineups, match],
  )

  const h2hRows = useMemo(() => matchesToH2HRows(h2hRaw), [h2hRaw])

  const potmCandidates = useMemo(
    () => match ? eventsToPOTMCandidates(events as MatchEvent[], match.home_team.id) : [],
    [events, match],
  )

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return <DetailSkeleton />
  if (!match) {
    return (
      <PageWrapper>
        <p className="text-white/40 font-lexend">Match not found.</p>
      </PageWrapper>
    )
  }

  const homeCode = match.home_team.code ?? match.home_team.name
  const awayCode = match.away_team.code ?? match.away_team.name
  const homeFlag = match.home_team.flag_url ?? ''
  const awayFlag = match.away_team.flag_url ?? ''

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>

      {/* Score card */}
      <ScoreCard match={match} />

      {/* Seeding pending notice */}
      {hasPlaceholderTeams(match) && (
        <div className="mt-4 p-3 rounded-lg border border-amber-400/20 bg-amber-400/5 text-center">
          <p className="text-xs font-lexend text-amber-400/80">
            This will be confirmed when the games start
          </p>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/8 my-5 overflow-x-auto scrollbar-none">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 pb-3 pt-1
              text-[11px] font-lexend font-bold uppercase tracking-widest
              border-b-2 transition-all whitespace-nowrap flex-shrink-0
              ${activeTab === tab.id
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-white/30 hover:text-white/60'}
            `}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <MomentumChart
              data={momentumData}
              homeLabel={homeCode}
              awayLabel={awayCode}
              matchEvents={events as MatchEvent[]}
            />
            <LiveFeed events={events as MatchEvent[]} />
            <MatchStatsCard statRows={statRows} homeCode={homeCode} awayCode={awayCode} />
          </div>

          <div className="lg:col-span-4 space-y-5">
            {/* VibeMeter requires real-time vibe data (vibe_score, atmosphere, crowdNoise,
                 energyIndex) which is not yet available on the Match type. Hidden until
                 the data pipeline is in place. */}
            {!is2022Match(match.id) && (
              <>
                <OraclePrediction
                  match={match}
                  homeWin={oracle?.homeWin}
                  draw={oracle?.draw}
                  awayWin={oracle?.awayWin}
                  predictedHome={oracle?.predictedHome}
                  predictedAway={oracle?.predictedAway}
                  confidence={oracle?.confidence}
                />
                {potmCandidates.length > 0 && (
                  <POTMPoll candidates={potmCandidates} />
                )}
              </>
            )}
            {is2022Match(match.id) && potmCandidates.length > 0 && (
              <POTMPoll candidates={potmCandidates} />
            )}
          </div>
        </div>
      )}

      {/* ── LIVE STATS ── */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <MomentumChart
              data={momentumData}
              homeLabel={homeCode}
              awayLabel={awayCode}
              matchEvents={events as MatchEvent[]}
            />
            <MatchStatsCard
              statRows={statRows}
              homeCode={homeCode}
              awayCode={awayCode}
              showLegend
            />
          </div>

          <div className="lg:col-span-4">
            <StartingXISidebar lineups={lineups as Lineup[]} />
          </div>
        </div>
      )}

      {/* ── LINEUPS ── */}
      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            {homeXI.length > 0 || awayXI.length > 0 ? (
              <FormationPitch
                homeXI={homeXI}
                awayXI={awayXI}
                homeLabel={`${homeFlag} ${homeCode}`}
                awayLabel={`${awayFlag} ${awayCode}`}
              />
            ) : (
              <GlassCard className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-white/10 block mb-3">people</span>
                <p className="font-lexend font-black text-sm text-white/20">Lineups not yet announced</p>
              </GlassCard>
            )}
          </div>

          <div className="lg:col-span-4 space-y-5">
            {[
              { label: homeCode, xi: homeXI, color: 'text-primary-container' },
              { label: awayCode, xi: awayXI, color: 'text-white/60'          },
            ].map(({ label, xi, color }) => (
              <GlassCard key={label} className="overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/8">
                  <p className={`font-lexend font-black text-[10px] uppercase tracking-widest ${color}`}>
                    {label}
                  </p>
                </div>
                {xi.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {xi.map(p => (
                      <div key={p.number} className="flex items-center gap-3 px-4 py-2">
                        <span className="font-lexend font-black text-[10px] text-white/20 w-5">
                          {p.number}
                        </span>
                        <span className="font-lexend font-semibold text-xs text-white/70 flex-1">
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-center text-[11px] font-lexend text-white/20">Not yet announced</p>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ── H2H ── */}
      {activeTab === 'h2h' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            {h2hRows.length > 0 ? (
              <H2HCard matches={h2hRows} homeFlag={homeFlag} awayFlag={awayFlag} />
            ) : (
              <GlassCard className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-white/10 block mb-3">compare_arrows</span>
                <p className="font-lexend font-black text-sm text-white/20">No previous meetings found</p>
              </GlassCard>
            )}
          </div>
          <div className="lg:col-span-5 space-y-5">
            {!is2022Match(match.id) && (
              <OraclePrediction
                match={match}
                homeWin={oracle?.homeWin}
                draw={oracle?.draw}
                awayWin={oracle?.awayWin}
                predictedHome={oracle?.predictedHome}
                predictedAway={oracle?.predictedAway}
                confidence={oracle?.confidence}
              />
            )}
          </div>
        </div>
      )}

      {/* ── PREDICTOR ── */}
      {activeTab === 'predictor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-5">
            <ScorePredictor match={match} />
            {potmCandidates.length > 0 && (
              <POTMPoll candidates={potmCandidates} />
            )}
          </div>
          <div className="lg:col-span-7 space-y-5">
            {!is2022Match(match.id) && (
              <OraclePrediction
                match={match}
                homeWin={oracle?.homeWin}
                draw={oracle?.draw}
                awayWin={oracle?.awayWin}
                predictedHome={oracle?.predictedHome}
                predictedAway={oracle?.predictedAway}
                confidence={oracle?.confidence}
              />
            )}
            <MomentumChart
              data={momentumData}
              homeLabel={homeCode}
              awayLabel={awayCode}
              matchEvents={events as MatchEvent[]}
            />
          </div>
        </div>
      )}

      {/* Live Chat — hidden for past 2022 matches */}
      {!is2022Match(match.id) && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-5 bg-primary-container rounded-full" />
            <h2 className="font-lexend font-bold uppercase tracking-tighter text-sm">Match Chat</h2>
            {match.status === 'live' && (
              <div className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-0.5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                <span className="text-[10px] font-lexend font-bold text-primary-container">LIVE</span>
              </div>
            )}
          </div>
          <GlassCard className="h-[480px] flex flex-col overflow-hidden">
            <LiveChatPanel matchId={match.id} />
          </GlassCard>
        </div>
      )}

    </PageWrapper>
  )
}