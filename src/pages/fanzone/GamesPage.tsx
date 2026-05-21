import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'

// ── Types ─────────────────────────────────────────────────────────────────────
type GameTab = 'trivia' | 'predictor' | 'bracket' | 'duel'

const GAME_TABS: { id: GameTab; label: string; icon: string }[] = [
  { id: 'trivia',    label: 'AI Trivia',   icon: 'psychology'     },
  { id: 'predictor', label: 'Predictor',   icon: 'auto_awesome'   },
  { id: 'bracket',   label: 'Bracket',     icon: 'account_tree'   },
  { id: 'duel',      label: 'Fan Duel',    icon: 'swords'         },
]

// ── Tribes leaderboard ────────────────────────────────────────────────────────
const TRIBES_LEADERBOARD = [
  { rank: 1, name: 'Samba Kings',    points: 12840, trend: 'up'      },
  { rank: 2, name: 'Die Mannschaft', points: 11205, trend: 'neutral' },
  { rank: 3, name: 'The Lions',      points: 9800,  trend: 'down'    },
  { rank: 4, name: 'La Roja',        points: 8102,  trend: 'neutral' },
]

// ── AI trivia questions ───────────────────────────────────────────────────────
const AI_TRIVIA = [
  {
    id: 't1',
    isLive: true,
    question: 'Which midfielder completed 15 consecutive passes in the final third during the current Brazil vs Germany match?',
    options: ['Casemiro', 'Paquetá', 'Kimmich', 'Gündogan'],
    answer: 1,
    points: 40,
    tag: 'Live Match',
  },
  {
    id: 't2',
    isLive: false,
    question: 'Which country has never been eliminated in the group stage of a World Cup they hosted?',
    options: ['South Africa', 'South Korea', 'Germany', 'Japan'],
    answer: 2,
    points: 30,
    tag: 'History',
  },
  {
    id: 't3',
    isLive: false,
    question: 'Who is the only player to have won the Golden Boot at two different World Cups?',
    options: ['Ronaldo', 'Gerd Müller', 'Gary Lineker', 'Davor Šuker'],
    answer: 0,
    points: 35,
    tag: 'Records',
  },
]

// ── Score predictor data ──────────────────────────────────────────────────────
const UPCOMING_FOR_PREDICT = [
  { id: 'p1', home: '🇫🇷 France',    away: '🇦🇷 Argentina', date: 'QF · Fri 18:00', pts: 50 },
  { id: 'p2', home: '🇳🇱 Netherlands', away: '🇵🇹 Portugal', date: 'QF · Fri 21:00', pts: 50 },
  { id: 'p3', home: '🇧🇷 Brazil',    away: '🇬🇧 England',   date: 'SF · Mon 18:00', pts: 75 },
]

// ── Duel mock ─────────────────────────────────────────────────────────────────
const DUEL_OPPONENTS = [
  { id: 'd1', name: 'FootballNerd99', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pts: 1840, streak: 4 },
  { id: 'd2', name: 'SambaMaster',   flag: '🇧🇷', pts: 2210, streak: 7 },
  { id: 'd3', name: 'TacticoX',      flag: '🇦🇷', pts: 1590, streak: 2 },
]

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── AI Trivia tab ─────────────────────────────────────────────────────────────
function AiTriviaTab() {
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [totalPts, setTotalPts] = useState(0)

  function handleAnswer(qid: string, i: number, correct: number, pts: number) {
    if (answers[qid] !== undefined) return
    setAnswers((prev) => ({ ...prev, [qid]: i }))
    if (i === correct) setTotalPts((p) => p + pts)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 space-y-5">
        {AI_TRIVIA.map((q) => {
          const picked = answers[q.id] ?? null
          return (
            <GlassCard key={q.id} className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {q.isLive && (
                    <div className="flex items-center gap-1.5 bg-primary-container/10 px-2 py-0.5 rounded-full border border-primary-container/20">
                      <div className="w-1 h-1 rounded-full bg-primary-container animate-pulse" />
                      <span className="text-[9px] font-lexend font-black text-primary-container uppercase">{q.tag}</span>
                    </div>
                  )}
                  {!q.isLive && (
                    <span className="text-[9px] font-lexend font-bold text-white/25 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{q.tag}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-lexend font-black text-primary-container">
                  <span className="material-symbols-outlined text-[13px]">emoji_events</span>
                  +{q.points} pts
                </div>
              </div>
              <div className="p-4">
                <p className="font-lexend font-semibold text-sm text-white leading-relaxed mb-4">{q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, i) => {
                    const isCorrect = picked !== null && i === q.answer
                    const isWrong   = picked === i && i !== q.answer
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(q.id, i, q.answer, q.points)}
                        className={`text-left px-3 py-2.5 rounded-lg border text-xs font-lexend font-semibold transition-all ${
                          isCorrect ? 'bg-primary-container/15 border-primary-container/40 text-primary-container'
                          : isWrong ? 'bg-red-400/10 border-red-400/30 text-red-400'
                          : picked !== null ? 'bg-transparent border-white/5 text-white/20'
                          : 'bg-white/3 border-white/8 text-white/60 hover:bg-white/8 hover:border-white/15'
                        }`}
                      >
                        <span className="mr-1.5 text-white/20">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {isCorrect && <span className="material-symbols-outlined text-[13px] float-right mt-0.5">check_circle</span>}
                        {isWrong   && <span className="material-symbols-outlined text-[13px] float-right mt-0.5">cancel</span>}
                      </button>
                    )
                  })}
                </div>
                {picked !== null && (
                  <p className={`mt-3 text-center text-[11px] font-lexend font-black ${picked === q.answer ? 'text-primary-container' : 'text-red-400'}`}>
                    {picked === q.answer ? `Correct! +${q.points} points` : 'Incorrect — no points this time'}
                  </p>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-5">
        {/* Running total */}
        <GlassCard className="p-4 text-center">
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2">Session Score</p>
          <p className="font-lexend font-black text-4xl text-primary-container">{totalPts}</p>
          <p className="text-[10px] font-lexend text-white/20 mt-1">pts earned</p>
        </GlassCard>

        {/* Tribe Battleground */}
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary-container">shield</span>
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Tribe Battleground</p>
          </div>
          <div className="divide-y divide-white/5">
            {TRIBES_LEADERBOARD.map(({ rank, name, points, trend }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3">
                <span className="font-lexend font-black text-base text-primary-container italic w-6">{String(rank).padStart(2, '0')}</span>
                <div className="flex-1">
                  <p className="font-lexend font-semibold text-xs text-white/70">{name}</p>
                  <p className="text-[10px] text-white/30 font-lexend">{points.toLocaleString()} pts</p>
                </div>
                <span className={`material-symbols-outlined text-sm ${trend === 'up' ? 'text-primary-container' : trend === 'down' ? 'text-red-400' : 'text-white/20'}`}>
                  {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'remove'}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 pt-3">
            <NeonButton variant="outline" className="w-full justify-center">Join a Tribe</NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ── Score Predictor tab ───────────────────────────────────────────────────────
function PredictorTab() {
  const [predictions, setPredictions] = useState<Record<string, [number, number]>>({})
  const [locked, setLocked] = useState<Record<string, boolean>>({})

  function setPred(id: string, side: 0 | 1, v: number) {
    const cur = predictions[id] ?? [0, 0]
    const next = [...cur] as [number, number]
    next[side] = Math.max(0, v)
    setPredictions((p) => ({ ...p, [id]: next }))
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-xs font-lexend text-white/30 leading-relaxed">
        Predict the exact final score before kick-off. Exact score = 50 pts, correct result = 10 pts.
      </p>
      {UPCOMING_FOR_PREDICT.map((m) => {
        const pred = predictions[m.id] ?? [0, 0]
        const isLocked = locked[m.id]
        return (
          <GlassCard key={m.id} className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
              <span className="text-[10px] font-lexend text-white/25">{m.date}</span>
              <div className="flex items-center gap-1 text-[10px] font-lexend font-black text-primary-container">
                <span className="material-symbols-outlined text-[13px]">emoji_events</span>
                +{m.pts} pts exact
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              {/* Home */}
              <div className="flex-1 text-right">
                <p className="font-lexend font-semibold text-xs text-white/60 mb-2">{m.home}</p>
                <div className="flex items-center justify-end gap-2">
                  {!isLocked && (
                    <button onClick={() => setPred(m.id, 0, pred[0] - 1)} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                  )}
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{pred[0]}</span>
                  {!isLocked && (
                    <button onClick={() => setPred(m.id, 0, pred[0] + 1)} className="w-7 h-7 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container hover:bg-primary-container/30 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  )}
                </div>
              </div>

              <span className="font-lexend font-black text-xl text-white/15">–</span>

              {/* Away */}
              <div className="flex-1">
                <p className="font-lexend font-semibold text-xs text-white/60 mb-2">{m.away}</p>
                <div className="flex items-center gap-2">
                  {!isLocked && (
                    <button onClick={() => setPred(m.id, 1, pred[1] - 1)} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">remove</span>
                    </button>
                  )}
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{pred[1]}</span>
                  {!isLocked && (
                    <button onClick={() => setPred(m.id, 1, pred[1] + 1)} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lock button */}
              <button
                onClick={() => setLocked((p) => ({ ...p, [m.id]: true }))}
                disabled={isLocked}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest transition-colors flex-shrink-0 ${
                  isLocked
                    ? 'bg-primary-container/10 text-primary-container/40 border border-primary-container/10 cursor-default'
                    : 'bg-primary-container/20 text-primary-container border border-primary-container/30 hover:bg-primary-container/30'
                }`}
              >
                {isLocked ? 'Locked ✓' : 'Lock In'}
              </button>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

// ── Fan Duel tab ──────────────────────────────────────────────────────────────
function FanDuelTab() {
  const [challenged, setChallenged] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 space-y-5">
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary-container">sports_mma</span>
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Challenge a Fan</p>
          </div>
          <div className="p-4">
            <p className="text-xs font-lexend text-white/30 leading-relaxed mb-4">
              Head-to-head trivia duels against other fans. First to 3 correct answers wins. Stake your points.
            </p>
            <div className="space-y-3">
              {DUEL_OPPONENTS.map((opp) => (
                <div key={opp.id} className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-xl flex-shrink-0">
                    {opp.flag}
                  </div>
                  <div className="flex-1">
                    <p className="font-lexend font-bold text-sm text-white/70">{opp.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] font-lexend text-primary-container font-bold">{opp.pts.toLocaleString()} pts</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-lexend text-white/25">
                        🔥 {opp.streak} streak
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setChallenged(opp.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest transition-colors ${
                      challenged === opp.id
                        ? 'bg-primary-container/15 text-primary-container border border-primary-container/30'
                        : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white/50'
                    }`}
                  >
                    {challenged === opp.id ? 'Challenged!' : 'Duel'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Active duel mock */}
        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-primary-container">Live Duel</p>
            </div>
            <span className="text-[10px] font-lexend text-white/20">First to 3 wins</span>
          </div>
          <div className="p-4">
            {/* Score */}
            <div className="flex items-center justify-center gap-8 mb-5">
              <div className="text-center">
                <p className="font-lexend font-black text-3xl text-primary-container">2</p>
                <p className="text-[10px] font-lexend text-white/30 mt-1">You</p>
              </div>
              <span className="font-lexend font-black text-xl text-white/10">vs</span>
              <div className="text-center">
                <p className="font-lexend font-black text-3xl text-white/40">1</p>
                <p className="text-[10px] font-lexend text-white/30 mt-1">FootballNerd99</p>
              </div>
            </div>
            {/* Question */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-4">
              <p className="text-[10px] font-lexend font-bold text-primary-container uppercase tracking-widest mb-2">Question 4 / 5</p>
              <p className="font-lexend font-semibold text-sm text-white leading-relaxed">
                Which team holds the record for most consecutive wins in a single World Cup tournament?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Germany 2014', 'France 1998', 'Brazil 1970', 'Italy 1982'].map((opt) => (
                <button key={opt} className="text-left px-3 py-2.5 rounded-lg border border-white/8 bg-white/3 text-xs font-lexend font-semibold text-white/60 hover:bg-white/8 hover:border-white/15 transition-all">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Duel sidebar */}
      <div className="lg:col-span-4 space-y-5">
        <GlassCard className="p-4 text-center">
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-1">Your Duel Record</p>
          <div className="flex justify-center gap-6 py-3">
            <div>
              <p className="font-lexend font-black text-2xl text-primary-container">12</p>
              <p className="text-[9px] font-lexend text-white/20 uppercase">Wins</p>
            </div>
            <div>
              <p className="font-lexend font-black text-2xl text-white/30">4</p>
              <p className="text-[9px] font-lexend text-white/20 uppercase">Losses</p>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: '75%' }} />
          </div>
          <p className="text-[9px] font-lexend text-primary-container mt-1.5">75% win rate</p>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/8">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Recent Duels</p>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { opp: 'SambaMaster',   result: 'W', score: '3–1', pts: '+80' },
              { opp: 'TacticoX',     result: 'W', score: '3–2', pts: '+60' },
              { opp: 'GoalKing',     result: 'L', score: '1–3', pts: '-40' },
              { opp: 'EuroFanatic',  result: 'W', score: '3–0', pts: '+100'},
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs font-lexend">
                <span className={`font-black w-4 ${d.result === 'W' ? 'text-primary-container' : 'text-red-400'}`}>{d.result}</span>
                <span className="text-white/40 flex-1 truncate">{d.opp}</span>
                <span className="text-white/20">{d.score}</span>
                <span className={`font-black w-10 text-right ${d.pts.startsWith('+') ? 'text-primary-container' : 'text-red-400'}`}>{d.pts}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ── Bracket tab placeholder ───────────────────────────────────────────────────
function BracketGameTab() {
  return (
    <GlassCard className="p-8 text-center">
      <span className="material-symbols-outlined text-5xl text-white/10 block mb-3">account_tree</span>
      <p className="font-lexend font-bold text-white/30 text-sm">Bracket predictor coming once the group stage concludes.</p>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function GamesPage() {
  const [activeTab, setActiveTab] = useState<GameTab>('trivia')

  return (
    <PageWrapper>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00FF41]" />
        <span className="text-primary-container font-lexend font-semibold uppercase text-sm">Live Fan Games Hub</span>
      </div>
      <h1 className="font-lexend font-black text-5xl uppercase italic mb-6">Fan Games & AI Hub</h1>

      {/* ── Game tab bar ── */}
      <div className="flex gap-1 border-b border-white/8 mb-6 overflow-x-auto scrollbar-none">
        {GAME_TABS.map((tab) => (
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

      {activeTab === 'trivia'    && <AiTriviaTab />}
      {activeTab === 'predictor' && <PredictorTab />}
      {activeTab === 'duel'      && <FanDuelTab />}
      {activeTab === 'bracket'   && <BracketGameTab />}
    </PageWrapper>
  )
}