// src/pages/MatchDetailPage.tsx
// Uses all mock data from mockMatchData.ts and sub-components from MatchDetailSubComponents.tsx

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScoreCard } from '@/components/matches/ScoreCard'
import { VibeMeter } from '@/components/matches/VibeMeter'
import { LiveChatPanel } from '@/components/fanzone/LiveChatPanel'
import { OraclePrediction } from '@/components/games/OraclePrediction'
import { GlassCard } from '@/components/ui/GlassCard'
import { useMatch } from '@/hooks/useMatches'
import { useOraclePrediction } from '@/hooks/useOracle'
import { ScorePredictor } from '@/components/matches/ScorePredictor'

import {
  MOCK_MOMENTUM,
  MOCK_TEAM_STATS,
  MOCK_PLAYER_STATS,
  MOCK_HOME_XI,
  MOCK_AWAY_XI,
  MOCK_H2H,
} from '@/components/matches/mockMatchData'

import {
  StatBar,
  MomentumChart,
  FormationPitch,
  H2HCard,
  POTMPoll,
  LiveFeed,
  PlayerStatRow,
} from '@/components/matches/MatchDetailSubComponents'

// ─────────────────────────────────────────────────────────────────────────────
type DetailTab = 'overview' | 'stats' | 'lineups' | 'h2h' | 'predictor'

const DETAIL_TABS: { id: DetailTab; label: string; icon: string }[] = [
  { id: 'overview',  label: 'Overview',   icon: 'sports_soccer'  },
  { id: 'stats',     label: 'Live Stats', icon: 'bar_chart'      },
  { id: 'lineups',   label: 'Lineups',    icon: 'people'         },
  { id: 'h2h',       label: 'H2H',        icon: 'compare_arrows' },
  { id: 'predictor', label: 'Predict',    icon: 'auto_awesome'   },
]

// ─────────────────────────────────────────────────────────────────────────────
export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { data: match, isLoading } = useMatch(matchId!)
  const { data: oracle } = useOraclePrediction(match)
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [playerMetric, setPlayerMetric] = useState<'speed' | 'passes' | 'distance' | 'rating'>('speed')

  if (isLoading) return (
    <PageWrapper>
      <div className="glass-card h-64 rounded-xl animate-pulse" />
    </PageWrapper>
  )
  if (!match) return (
    <PageWrapper>
      <p className="text-white/40 font-lexend">Match not found.</p>
    </PageWrapper>
  )

  const homeCode = match.home_team.code ?? match.home_team.name
  const awayCode = match.away_team.code ?? match.away_team.name
  const homeFlag = match.home_team.flag_url ?? ''
  const awayFlag = match.away_team.flag_url ?? ''

  return (
    <PageWrapper>
      {/* Score card */}
      <ScoreCard match={match} />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/8 my-5 overflow-x-auto scrollbar-none">
        {DETAIL_TABS.map((tab) => (
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
              data={MOCK_MOMENTUM}
              homeLabel={homeCode}
              awayLabel={awayCode}
            />
            <LiveFeed />
            <GlassCard className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
                  Team Statistics
                </p>
              </div>
              <div className="px-4 py-2">
                {MOCK_TEAM_STATS.map((s) => <StatBar key={s.label} {...s} />)}
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-4 space-y-5">
            {match.status === 'live' && (
              <VibeMeter value={94} atmosphere={98} crowdNoise={93} energyIndex={88} match={match} />
            )}
            <OraclePrediction
              match={match}
              homeWin={55} draw={18} awayWin={27}
              predictedHome={2} predictedAway={1}
              confidence={68}
            />
            <POTMPoll />
          </div>
        </div>
      )}

      {/* ── LIVE STATS ── */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <MomentumChart data={MOCK_MOMENTUM} homeLabel={homeCode} awayLabel={awayCode} />
            <GlassCard className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
                  Match Statistics
                </p>
                <div className="flex items-center gap-3 text-[9px] font-lexend font-bold uppercase tracking-widest">
                  <span className="text-primary-container flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                    {homeFlag} {homeCode}
                  </span>
                  <span className="text-white/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    {awayFlag} {awayCode}
                  </span>
                </div>
              </div>
              <div className="px-4 py-2">
                {MOCK_TEAM_STATS.map((s) => <StatBar key={s.label} {...s} />)}
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-4 space-y-5">
            <GlassCard className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2.5">
                  Player Rankings
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {(['speed', 'passes', 'distance', 'rating'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPlayerMetric(m)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-lexend font-black uppercase tracking-widest transition-colors ${
                        playerMetric === m
                          ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                          : 'bg-white/5 text-white/20 border border-transparent hover:text-white/40'
                      }`}
                    >
                      {m === 'speed' ? 'Speed' : m === 'passes' ? 'Pass%' : m === 'distance' ? 'Dist' : 'Rating'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 py-1">
                {[...MOCK_PLAYER_STATS]
                  .sort((a, b) => (b[playerMetric] as number) - (a[playerMetric] as number))
                  .map((p) => (
                    <PlayerStatRow key={p.name} player={p} metric={playerMetric} />
                  ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── LINEUPS ── */}
      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <FormationPitch
              homeXI={MOCK_HOME_XI}
              awayXI={MOCK_AWAY_XI}
              homeLabel={`${homeFlag} ${homeCode} 4-3-3`}
              awayLabel={`${awayFlag} ${awayCode} 4-2-3-1`}
            />
          </div>
          <div className="lg:col-span-4 space-y-5">
            {[
              { label: `${homeFlag} ${homeCode} · 4-3-3`,    xi: MOCK_HOME_XI, color: 'text-primary-container' },
              { label: `${awayFlag} ${awayCode} · 4-2-3-1`,  xi: MOCK_AWAY_XI, color: 'text-white/60'         },
            ].map(({ label, xi, color }) => (
              <GlassCard key={label} className="overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/8">
                  <p className={`font-lexend font-black text-[10px] uppercase tracking-widest ${color}`}>{label}</p>
                </div>
                <div className="divide-y divide-white/5">
                  {xi.map((p) => (
                    <div key={p.number} className="flex items-center gap-3 px-4 py-2">
                      <span className="font-lexend font-black text-[10px] text-white/20 w-5">{p.number}</span>
                      <span className="font-lexend font-semibold text-xs text-white/70 flex-1">{p.name}</span>
                      <span className="text-[9px] font-lexend font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded">{p.pos}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ── H2H ── */}
      {activeTab === 'h2h' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <H2HCard matches={MOCK_H2H} homeFlag={homeFlag} awayFlag={awayFlag} />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <OraclePrediction
              match={match}
              homeWin={oracle?.homeWin}
              draw={oracle?.draw}
              awayWin={oracle?.awayWin}
              predictedHome={oracle?.predictedHome}
              predictedAway={oracle?.predictedAway}
              confidence={oracle?.confidence}
            />
          </div>
        </div>
      )}

      {/* ── PREDICTOR ── */}
      {activeTab === 'predictor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-5">
            <ScorePredictor match={match} />
            <POTMPoll />
          </div>
          <div className="lg:col-span-7 space-y-5">
            <OraclePrediction
              match={match}
              homeWin={oracle?.homeWin}
              draw={oracle?.draw}
              awayWin={oracle?.awayWin}
              predictedHome={oracle?.predictedHome}
              predictedAway={oracle?.predictedAway}
              confidence={oracle?.confidence}
            />
            <MomentumChart data={MOCK_MOMENTUM} homeLabel={homeCode} awayLabel={awayCode} />
          </div>
        </div>
      )}

      {/* Live Chat — always visible */}
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
    </PageWrapper>
  )
}