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
import { useOraclePrediction } from '@/hooks/useOracle'
import { GROUPS_2026_CARDS, GROUPS_2022_CARDS, type GroupCardData } from '@/lib/mockAdapters'
import type { TournamentYear } from '@/utils/mockData'

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'schedule' | 'groups' | 'bracket'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'schedule', label: 'Schedule', icon: 'calendar_month' },
  { id: 'groups',   label: 'Groups',   icon: 'grid_view'      },
  { id: 'bracket',  label: 'Bracket',  icon: 'account_tree'   },
]

const MOCK_STANDINGS = [
  { pos: 1, team: 'Brazil',    played: 2, gd: 4,  points: 6, qualified: true  },
  { pos: 2, team: 'Germany',   played: 2, gd: 2,  points: 3, qualified: true  },
  { pos: 3, team: 'Ghana',     played: 2, gd: -1, points: 3                   },
  { pos: 4, team: 'Korea Rep', played: 2, gd: -5, points: 0                   },
]

// ── Trivia data ───────────────────────────────────────────────────────────────
const TRIVIA_QUESTIONS = [
  {
    question: 'Which country has won the most FIFA World Cups?',
    options: ['Germany', 'Brazil', 'Italy', 'Argentina'],
    answer: 1,
    points: 20,
  },
  {
    question: "Who holds the record for most goals in a single World Cup?",
    options: ['Ronaldo', 'Pelé', 'Just Fontaine', 'Miroslav Klose'],
    answer: 2,
    points: 30,
  },
  {
    question: 'In what year was the FIFA World Cup first held?',
    options: ['1924', '1930', '1938', '1950'],
    answer: 1,
    points: 25,
  },
]

// ── Team onboarding data ──────────────────────────────────────────────────────
const ONBOARDING_TEAMS = [
  { flag: '🇧🇷', name: 'Brazil' }, { flag: '🇦🇷', name: 'Argentina' },
  { flag: '🇫🇷', name: 'France' }, { flag: '🇩🇪', name: 'Germany'   },
  { flag: '🇪🇸', name: 'Spain'  }, { flag: '🇵🇹', name: 'Portugal'  },
  { flag: '🇳🇱', name: 'Netherlands' }, { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England' },
  { flag: '🇺🇸', name: 'USA'    }, { flag: '🇯🇵', name: 'Japan'     },
  { flag: '🇸🇳', name: 'Senegal'}, { flag: '🇲🇦', name: 'Morocco'  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function GroupCard({ group }: { group: GroupCardData }) {
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
          className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 last:border-0 ${team.qualified ? 'bg-primary-container/5' : ''}`}
        >
          <div className={`w-0.5 h-4 rounded-full flex-shrink-0 ${team.qualified ? 'bg-primary-container' : 'bg-white/8'}`} />
          <span className="text-[10px] font-lexend font-bold text-white/25 w-3">{i + 1}</span>
          <span className="text-sm leading-none">{team.flag}</span>
          <span className={`font-lexend font-semibold text-xs flex-1 truncate ${team.qualified ? 'text-white' : 'text-white/40'}`}>
            {team.name}
          </span>
          <div className="flex gap-3 text-xs font-lexend">
            <span className="text-white/25 w-4 text-center">{team.played}</span>
            <span className={`w-6 text-center font-semibold ${team.gd > 0 ? 'text-primary-container' : team.gd < 0 ? 'text-red-400' : 'text-white/25'}`}>
              {team.gd > 0 ? `+${team.gd}` : team.gd}
            </span>
            <span className="font-black text-sm text-white w-4 text-center">{team.pts}</span>
          </div>
        </div>
      ))}
    </GlassCard>
  )
}

// ── Half-time Trivia ──────────────────────────────────────────────────────────
function HalftimeTrivia() {
  const [qIndex,   setQIndex]   = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [total,    setTotal]    = useState(0)
  const [finished, setFinished] = useState(false)

  const q = TRIVIA_QUESTIONS[qIndex]

  function handleAnswer(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === q.answer) setTotal((p) => p + q.points)
  }

  function handleNext() {
    if (qIndex < TRIVIA_QUESTIONS.length - 1) {
      setQIndex((p) => p + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-primary-container">quiz</span>
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Half-time Trivia</p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary-container/10 px-2 py-0.5 rounded-full border border-primary-container/20">
          <span className="material-symbols-outlined text-[12px] text-primary-container">emoji_events</span>
          <span className="text-[10px] font-lexend font-black text-primary-container">{total} pts</span>
        </div>
      </div>

      <div className="p-4">
        {!finished ? (
          <>
            <div className="flex gap-1.5 mb-4">
              {TRIVIA_QUESTIONS.map((_, i) => (
                <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i < qIndex ? 'bg-primary-container' : i === qIndex ? 'bg-primary-container/50' : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="font-lexend font-semibold text-sm text-white leading-relaxed mb-4">{q.question}</p>
            <div className="space-y-2 mb-4">
              {q.options.map((opt, i) => {
                const isCorrect = selected !== null && i === q.answer
                const isWrong   = selected === i && i !== q.answer
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-lexend font-semibold transition-all ${
                      isCorrect ? 'bg-primary-container/15 border-primary-container/40 text-primary-container'
                      : isWrong ? 'bg-red-400/10 border-red-400/30 text-red-400'
                      : selected !== null ? 'bg-transparent border-white/5 text-white/20'
                      : 'bg-white/3 border-white/8 text-white/60 hover:bg-white/8 hover:border-white/15'
                    }`}
                  >
                    <span className="mr-2 text-white/20">{String.fromCharCode(65 + i)}.</span>{opt}
                    {isCorrect && <span className="material-symbols-outlined text-[14px] float-right mt-0.5">check_circle</span>}
                    {isWrong   && <span className="material-symbols-outlined text-[14px] float-right mt-0.5">cancel</span>}
                  </button>
                )
              })}
            </div>
            {selected !== null && (
              <div className="space-y-2">
                <div className={`text-center py-1.5 rounded text-[11px] font-lexend font-black ${selected === q.answer ? 'text-primary-container' : 'text-red-400'}`}>
                  {selected === q.answer ? `+${q.points} points!` : 'Incorrect — no points'}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 font-lexend font-black text-[10px] uppercase tracking-widest hover:bg-white/8 transition-colors"
                >
                  {qIndex < TRIVIA_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-4xl text-primary-container block mb-2">
              {total >= 50 ? 'celebration' : 'sports_soccer'}
            </span>
            <p className="font-lexend font-black text-3xl text-primary-container">{total}</p>
            <p className="text-[11px] font-lexend text-white/30 mb-4">points earned</p>
            <button
              onClick={() => { setQIndex(0); setSelected(null); setTotal(0); setFinished(false) }}
              className="px-4 py-2 rounded-lg bg-primary-container/10 border border-primary-container/20 text-primary-container font-lexend font-black text-[10px] uppercase tracking-widest hover:bg-primary-container/20 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

// ── Mini League Card ──────────────────────────────────────────────────────────
function MiniLeagueCard() {
  const [copied, setCopied] = useState(false)
  const code = 'WC2026-X8KQJ'

  function copyCode() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px] text-primary-container">trophy</span>
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Challenger League</p>
      </div>
      <div className="p-4">
        <p className="text-xs font-lexend text-white/40 leading-relaxed mb-4">
          Create a private mini-league and compete with friends across the tournament.
        </p>
        <div className="space-y-1.5 mb-4">
          {[
            { rank: 1, name: 'You',      pts: 340, badge: '🥇' },
            { rank: 2, name: 'Alex K.',  pts: 295, badge: '🥈' },
            { rank: 3, name: 'Sarah M.', pts: 270, badge: '🥉' },
          ].map((row) => (
            <div key={row.rank} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/3">
              <span className="text-sm">{row.badge}</span>
              <span className={`font-lexend font-bold text-xs flex-1 ${row.rank === 1 ? 'text-primary-container' : 'text-white/40'}`}>{row.name}</span>
              <span className={`font-lexend font-black text-sm ${row.rank === 1 ? 'text-primary-container' : 'text-white/30'}`}>{row.pts}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-lg px-3 py-2">
          <span className="font-lexend font-black text-xs text-primary-container/60 tracking-widest flex-1">{code}</span>
          <button
            onClick={copyCode}
            className="text-[10px] font-lexend font-black uppercase tracking-widest text-primary-container hover:text-primary-container/70 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

// ── Team Onboarding Modal ─────────────────────────────────────────────────────
function TeamOnboarding({ onSelect }: { onSelect: (name: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <GlassCard className="max-w-md w-full overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center border-b border-white/8">
          <span className="text-4xl block mb-3">⚽</span>
          <h2 className="font-lexend font-black text-lg text-white mb-1">Pick Your Team</h2>
          <p className="text-xs font-lexend text-white/30 leading-relaxed">
            We'll personalise your dashboard with your team's colours and send you priority alerts.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2 p-4">
          {ONBOARDING_TEAMS.map((team) => (
            <button
              key={team.name}
              onClick={() => onSelect(team.name)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/8 hover:border-white/20 hover:scale-105 transition-all"
            >
              <span className="text-2xl leading-none">{team.flag}</span>
              <span className="text-[9px] font-lexend font-bold text-white/40 text-center leading-tight">{team.name}</span>
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={() => onSelect('neutral')}
            className="w-full py-2 text-[10px] font-lexend font-bold text-white/20 hover:text-white/40 transition-colors uppercase tracking-widest"
          >
            Skip — no preference
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function MatchesPage() {
  const navigate = useNavigate()
  const { data: matches, isLoading } = useMatches()
  const [activeTab, setActiveTab] = useState<Tab>('schedule')
  const [tournamentYear, setTournamentYear] = useState<TournamentYear>('2026')

  // Onboarding: show once until user picks a team
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('preferredTeam')
  )

  const live     = matches?.filter((m) => m.status === 'live')     ?? []
  const upcoming = matches?.filter((m) => m.status === 'upcoming') ?? []
  const finished = matches?.filter((m) => m.status === 'finished') ?? []

  const featureMatch = live[0] ?? upcoming[0] ?? null
  const { data: oracle } = useOraclePrediction(featureMatch)
  const groups = tournamentYear === '2026' ? GROUPS_2026_CARDS : GROUPS_2022_CARDS

  return (
    <PageWrapper>

      {/* ── Team onboarding modal ── */}
      {showOnboarding && (
        <TeamOnboarding
          onSelect={(name) => {
            localStorage.setItem('preferredTeam', name)
            setShowOnboarding(false)
          }}
        />
      )}

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

      {/* ══ TAB: SCHEDULE ══ */}
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
                    <span className="font-lexend text-[11px] font-bold text-primary-container">{live.length} LIVE</span>
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
                <span className="material-symbols-outlined text-5xl text-white/10 block mb-3">sports_soccer</span>
                <p className="text-white/30 text-sm font-lexend">No matches scheduled yet.</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-5 space-y-5 min-w-0">

            {featureMatch && (
              <>
                {live[0] && (
                  <div>
                    <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2">Live atmosphere</p>
                    <VibeMeter
                      value={94}
                      atmosphere={98}
                      crowdNoise={93}
                      energyIndex={88}
                      match={live[0]}
                    />
                  </div>
                )}
                <div>
                  <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2">Oracle prediction</p>
                  <OraclePrediction
                    match={featureMatch}
                    homeWin={oracle?.homeWin}
                    draw={oracle?.draw}
                    awayWin={oracle?.awayWin}
                    predictedHome={oracle?.predictedHome}
                    predictedAway={oracle?.predictedAway}
                    confidence={oracle?.confidence}
                  />
                </div>
              </>
            )}

            {/* Standings always visible */}
            <StandingsTable standings={MOCK_STANDINGS} />

            {/* ── New additions ── */}
            <HalftimeTrivia />
            <MiniLeagueCard />
          </div>
        </div>
      )}

      {/* ══ TAB: GROUPS ══ */}
      {activeTab === 'groups' && (
        <div>
          <div className="flex gap-2 mb-4">
            {(['2026', '2022'] as TournamentYear[]).map((y) => (
              <button
                key={y}
                onClick={() => setTournamentYear(y)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest border transition-colors ${
                  tournamentYear === y
                    ? 'bg-primary-container/15 border-primary-container/40 text-primary-container'
                    : 'border-white/10 text-white/30 hover:text-white/50'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 bg-primary-container rounded-full" />
              <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/30">Qualified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 bg-white/10 rounded-full" />
              <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-white/30">Eliminated</span>
            </div>
          </div>
          <div className={`grid gap-3 sm:gap-4 ${tournamentYear === '2026' ? 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {groups.map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* ══ TAB: BRACKET ══ */}
      {activeTab === 'bracket' && <BracketTab />}

    </PageWrapper>
  )
}