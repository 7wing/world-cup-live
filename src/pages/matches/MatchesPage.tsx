import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ScoreCard } from '@/components/matches/ScoreCard'
import { StandingsTable } from '@/components/matches/StandingsTable'
import { VibeMeter } from '@/components/matches/VibeMeter'
import { OraclePrediction } from '@/components/games/OraclePrediction'
import { BracketTab } from '@/components/matches/BracketTab'
import { GlassCard } from '@/components/ui/GlassCard'
import { useMatches } from '@/hooks/useMatches'

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'schedule' | 'groups' | 'bracket'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'schedule', label: 'Schedule', icon: 'calendar_month' },
  { id: 'groups',   label: 'Groups',   icon: 'grid_view'      },
  { id: 'bracket',  label: 'Bracket',  icon: 'account_tree'   },
]

// ── Mock group data — replace with real hook when available ───────────────────
const GROUPS = [
  {
    name: 'A', teams: [
      { flag: '🇺🇸', name: 'USA',         played: 3, gd:  3, pts: 7, qualified: true  },
      { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',    played: 3, gd:  1, pts: 6, qualified: true  },
      { flag: '🇮🇷', name: 'Iran',        played: 3, gd: -2, pts: 3, qualified: false },
      { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', name: 'Wales',      played: 3, gd: -3, pts: 1, qualified: false },
    ],
  },
  {
    name: 'B', teams: [
      { flag: '🇦🇷', name: 'Argentina',   played: 3, gd:  5, pts: 9, qualified: true  },
      { flag: '🇲🇽', name: 'Mexico',      played: 3, gd: -1, pts: 4, qualified: true  },
      { flag: '🇵🇱', name: 'Poland',      played: 3, gd: -2, pts: 3, qualified: false },
      { flag: '🇸🇦', name: 'Saudi Ar.',   played: 3, gd: -2, pts: 1, qualified: false },
    ],
  },
  {
    name: 'C', teams: [
      { flag: '🇫🇷', name: 'France',      played: 3, gd:  4, pts: 7, qualified: true  },
      { flag: '🇩🇰', name: 'Denmark',     played: 3, gd:  0, pts: 4, qualified: true  },
      { flag: '🇹🇳', name: 'Tunisia',     played: 3, gd: -2, pts: 3, qualified: false },
      { flag: '🇦🇺', name: 'Australia',   played: 3, gd: -2, pts: 0, qualified: false },
    ],
  },
  {
    name: 'D', teams: [
      { flag: '🇧🇷', name: 'Brazil',      played: 3, gd:  6, pts: 9, qualified: true  },
      { flag: '🇨🇭', name: 'Switzerland', played: 3, gd: -1, pts: 4, qualified: true  },
      { flag: '🇷🇸', name: 'Serbia',      played: 3, gd: -2, pts: 3, qualified: false },
      { flag: '🇨🇲', name: 'Cameroon',    played: 3, gd: -3, pts: 1, qualified: false },
    ],
  },
  {
    name: 'E', teams: [
      { flag: '🇪🇸', name: 'Spain',       played: 3, gd:  4, pts: 7, qualified: true  },
      { flag: '🇩🇪', name: 'Germany',     played: 3, gd:  0, pts: 4, qualified: true  },
      { flag: '🇯🇵', name: 'Japan',       played: 3, gd: -1, pts: 3, qualified: false },
      { flag: '🇨🇷', name: 'Costa Rica',  played: 3, gd: -3, pts: 0, qualified: false },
    ],
  },
  {
    name: 'F', teams: [
      { flag: '🇧🇪', name: 'Belgium',     played: 3, gd:  2, pts: 6, qualified: true  },
      { flag: '🇲🇦', name: 'Morocco',     played: 3, gd:  1, pts: 5, qualified: true  },
      { flag: '🇭🇷', name: 'Croatia',     played: 3, gd:  0, pts: 4, qualified: false },
      { flag: '🇨🇦', name: 'Canada',      played: 3, gd: -3, pts: 1, qualified: false },
    ],
  },
  {
    name: 'G', teams: [
      { flag: '🇵🇹', name: 'Portugal',    played: 3, gd:  5, pts: 9, qualified: true  },
      { flag: '🇺🇾', name: 'Uruguay',     played: 3, gd:  0, pts: 4, qualified: true  },
      { flag: '🇰🇷', name: 'South Korea', played: 3, gd: -2, pts: 3, qualified: false },
      { flag: '🇬🇭', name: 'Ghana',       played: 3, gd: -3, pts: 1, qualified: false },
    ],
  },
  {
    name: 'H', teams: [
      { flag: '🇳🇱', name: 'Netherlands', played: 3, gd:  2, pts: 6, qualified: true  },
      { flag: '🇸🇳', name: 'Senegal',     played: 3, gd:  0, pts: 4, qualified: true  },
      { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Ecuador',    played: 3, gd: -2, pts: 3, qualified: false },
      { flag: '🇶🇦', name: 'Qatar',       played: 3, gd: -1, pts: 1, qualified: false },
    ],
  },
]

const MOCK_STANDINGS = [
  { pos: 1, team: 'Brazil',    played: 2, gd: 4,  points: 6, qualified: true  },
  { pos: 2, team: 'Germany',   played: 2, gd: 2,  points: 3, qualified: true  },
  { pos: 3, team: 'Ghana',     played: 2, gd: -1, points: 3                   },
  { pos: 4, team: 'Korea Rep', played: 2, gd: -5, points: 0                   },
]

// ── Group card ────────────────────────────────────────────────────────────────
function GroupCard({ group }: { group: typeof GROUPS[0] }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
        <span className="font-lexend font-black text-xs uppercase tracking-widest text-primary-container">
          Group {group.name}
        </span>
        <div className="flex gap-3 text-[10px] font-lexend font-bold uppercase tracking-widest text-white/20">
          <span>PL</span><span>GD</span><span>PTS</span>
        </div>
      </div>

      {group.teams.map((team, i) => (
        <div
          key={team.name}
          className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 last:border-0 ${
            team.qualified ? 'bg-primary-container/5' : ''
          }`}
        >
          <div className={`w-0.5 h-4 rounded-full flex-shrink-0 ${
            team.qualified ? 'bg-primary-container' : 'bg-white/8'
          }`} />
          <span className="text-[10px] font-lexend font-bold text-white/25 w-3">{i + 1}</span>
          <span className="text-sm leading-none">{team.flag}</span>
          <span className={`font-lexend font-semibold text-xs flex-1 truncate ${
            team.qualified ? 'text-white' : 'text-white/40'
          }`}>
            {team.name}
          </span>
          <div className="flex gap-3 text-xs font-lexend">
            <span className="text-white/25 w-4 text-center">{team.played}</span>
            <span className={`w-6 text-center font-semibold ${
              team.gd > 0 ? 'text-primary-container'
              : team.gd < 0 ? 'text-red-400'
              : 'text-white/25'
            }`}>
              {team.gd > 0 ? `+${team.gd}` : team.gd}
            </span>
            <span className="font-black text-sm text-white w-4 text-center">{team.pts}</span>
          </div>
        </div>
      ))}
    </GlassCard>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function MatchesPage() {
  const navigate   = useNavigate()
  const { data: matches, isLoading } = useMatches()
  const [activeTab, setActiveTab]    = useState<Tab>('schedule')

  const live     = matches?.filter((m) => m.status === 'live')     ?? []
  const upcoming = matches?.filter((m) => m.status === 'upcoming') ?? []
  const finished = matches?.filter((m) => m.status === 'finished') ?? []

  // Best match to show in sidebar widgets: prefer live, fall back to next upcoming
  const featureMatch = live[0] ?? upcoming[0] ?? null

  return (
    <PageWrapper>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 border-b border-white/8 mb-6 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
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

      {/* ══════════════════════════════════════════
          TAB: SCHEDULE
      ══════════════════════════════════════════ */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left — match list */}
          <div className="lg:col-span-7 space-y-6 min-w-0">

            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card h-24 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {live.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-lexend font-bold uppercase tracking-tighter flex items-center gap-2 text-sm">
                    <span className="w-1 h-5 bg-primary-container rounded-full" />
                    Live Now
                  </h2>
                  <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00ff41]" />
                    <span className="font-lexend text-[11px] font-bold text-primary-container">
                      {live.length} LIVE
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {live.map((m) => (
                    <ScoreCard key={m.id} match={m} onClick={() => navigate(`/matches/${m.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <h2 className="font-lexend font-bold uppercase tracking-tighter flex items-center gap-2 mb-3 text-sm">
                  <span className="w-1 h-5 bg-white/20 rounded-full" />
                  Next Up
                </h2>
                <div className="space-y-3">
                  {upcoming.map((m) => (
                    <ScoreCard key={m.id} match={m} onClick={() => navigate(`/matches/${m.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {finished.length > 0 && (
              <section>
                <h2 className="font-lexend font-bold uppercase tracking-tighter flex items-center gap-2 mb-3 text-sm">
                  <span className="w-1 h-5 bg-white/20 rounded-full" />
                  Final Scores
                </h2>
                <div className="space-y-3">
                  {finished.map((m) => (
                    <ScoreCard key={m.id} match={m} onClick={() => navigate(`/matches/${m.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {!isLoading && !featureMatch && (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-white/10 block mb-3">
                  sports_soccer
                </span>
                <p className="text-white/30 text-sm font-lexend">No matches scheduled yet.</p>
              </div>
            )}
          </div>

          {/* Right sidebar — only on schedule tab */}
          <div className="lg:col-span-5 space-y-5 min-w-0">

            {featureMatch && (
              <>
                {/* VibeMeter — only when live */}
                {live[0] && (
                  <div>
                    <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2">
                      Live atmosphere
                    </p>
                    <VibeMeter
                      value={94}
                      atmosphere={98}
                      crowdNoise={93}
                      energyIndex={88}
                      match={live[0]}
                    />
                  </div>
                )}

                {/* Oracle prediction */}
                <div>
                  <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2">
                    Oracle prediction
                  </p>
                  <OraclePrediction
                    match={featureMatch}
                    homeWin={55}
                    draw={18}
                    awayWin={27}
                    predictedHome={2}
                    predictedAway={1}
                    confidence={68}
                  />
                </div>
              </>
            )}

            {/* Standings always visible */}
            <StandingsTable standings={MOCK_STANDINGS} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: GROUPS
      ══════════════════════════════════════════ */}
      {activeTab === 'groups' && (
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 bg-primary-container rounded-full" />
              <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/30">
                Qualified
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 bg-white/10 rounded-full" />
              <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/30">
                Eliminated
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {GROUPS.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: BRACKET
      ══════════════════════════════════════════ */}
      {activeTab === 'bracket' && <BracketTab />}

    </PageWrapper>
  )
}