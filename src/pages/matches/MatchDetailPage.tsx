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
import { getStaticOracle } from '@/lib/mockAdapters'
import { getEffectiveUser } from '@/lib/guestUser'
import { getPrediction, savePrediction, scorePrediction } from '@/lib/predictionsStorage'
import { useAuthStore } from '@/store/authStore'
import { formatKickoff } from '@/utils/formatDate'
import type { Match } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────
type DetailTab = 'overview' | 'stats' | 'lineups' | 'h2h' | 'predictor'

const DETAIL_TABS: { id: DetailTab; label: string; icon: string }[] = [
  { id: 'overview',  label: 'Overview',  icon: 'sports_soccer'   },
  { id: 'stats',     label: 'Live Stats',icon: 'bar_chart'       },
  { id: 'lineups',   label: 'Lineups',   icon: 'people'          },
  { id: 'h2h',       label: 'H2H',       icon: 'compare_arrows'  },
  { id: 'predictor', label: 'Predict',   icon: 'auto_awesome'    },
]

// ── Mock data helpers ─────────────────────────────────────────────────────────
const MOCK_MOMENTUM = [
  { min: 0,  home: 50, away: 50 },
  { min: 5,  home: 58, away: 42 },
  { min: 10, home: 62, away: 38 },
  { min: 15, home: 55, away: 45 },
  { min: 20, home: 45, away: 55 },
  { min: 25, home: 40, away: 60 },
  { min: 30, home: 48, away: 52 },
  { min: 35, home: 53, away: 47 },
  { min: 40, home: 60, away: 40 },
  { min: 45, home: 57, away: 43 },
  { min: 50, home: 52, away: 48 },
  { min: 55, home: 44, away: 56 },
  { min: 60, home: 38, away: 62 },
  { min: 65, home: 43, away: 57 },
  { min: 70, home: 55, away: 45 },
  { min: 75, home: 64, away: 36 },
  { min: 80, home: 68, away: 32 },
  { min: 85, home: 60, away: 40 },
]

const MOCK_PLAYER_STATS = [
  { name: 'Vinícius Jr.',  team: 'home', flag: '🇧🇷', speed: 34.2, passes: 87, distance: 9.8, rating: 8.6 },
  { name: 'Rodrygo',       team: 'home', flag: '🇧🇷', speed: 32.1, passes: 72, distance: 9.1, rating: 7.9 },
  { name: 'Casemiro',      team: 'home', flag: '🇧🇷', speed: 28.4, passes: 91, distance: 10.2, rating: 8.1 },
  { name: 'Müller',        team: 'away', flag: '🇩🇪', speed: 27.8, passes: 83, distance: 9.6, rating: 7.7 },
  { name: 'Kimmich',       team: 'away', flag: '🇩🇪', speed: 29.3, passes: 96, distance: 10.5, rating: 8.4 },
  { name: 'Gnabry',        team: 'away', flag: '🇩🇪', speed: 33.7, passes: 68, distance: 9.3, rating: 7.5 },
]

const MOCK_TEAM_STATS = [
  { label: 'Possession',       home: 58,  away: 42,  unit: '%', isPercent: true  },
  { label: 'Shots on Target',  home: 6,   away: 4,   unit: '',  isPercent: false },
  { label: 'Pass Accuracy',    home: 88,  away: 84,  unit: '%', isPercent: true  },
  { label: 'Corners',          home: 5,   away: 3,   unit: '',  isPercent: false },
  { label: 'Fouls',            home: 9,   away: 13,  unit: '',  isPercent: false },
  { label: 'xG',               home: 1.8, away: 1.1, unit: '',  isPercent: false },
  { label: 'Tackles Won',      home: 14,  away: 11,  unit: '',  isPercent: false },
]

const MOCK_HOME_XI = [
  { number: 1,  name: 'Alisson',    pos: 'GK', x: 50, y: 88 },
  { number: 2,  name: 'Militão',    pos: 'RB', x: 20, y: 72 },
  { number: 3,  name: 'Marquinhos', pos: 'CB', x: 38, y: 72 },
  { number: 4,  name: 'Silva',      pos: 'CB', x: 62, y: 72 },
  { number: 5,  name: 'Telles',     pos: 'LB', x: 80, y: 72 },
  { number: 8,  name: 'Casemiro',   pos: 'CM', x: 50, y: 55 },
  { number: 10, name: 'Paquetá',    pos: 'CM', x: 30, y: 44 },
  { number: 7,  name: 'Rafinha',    pos: 'CM', x: 70, y: 44 },
  { number: 11, name: 'Rapinha',    pos: 'LW', x: 78, y: 28 },
  { number: 9,  name: 'Richarlison',pos: 'ST', x: 50, y: 20 },
  { number: 20, name: 'Vini Jr.',   pos: 'RW', x: 22, y: 28 },
]

const MOCK_AWAY_XI = [
  { number: 1,  name: 'Neuer',     pos: 'GK', x: 50, y: 88 },
  { number: 2,  name: 'Kehrer',    pos: 'RB', x: 20, y: 72 },
  { number: 3,  name: 'Rüdiger',   pos: 'CB', x: 38, y: 72 },
  { number: 4,  name: 'Schlott.',  pos: 'CB', x: 62, y: 72 },
  { number: 5,  name: 'Raum',      pos: 'LB', x: 80, y: 72 },
  { number: 6,  name: 'Kimmich',   pos: 'CM', x: 35, y: 55 },
  { number: 8,  name: 'Gündogan',  pos: 'CM', x: 65, y: 55 },
  { number: 10, name: 'Müller',    pos: 'AM', x: 50, y: 40 },
  { number: 11, name: 'Gnabry',    pos: 'RW', x: 22, y: 26 },
  { number: 9,  name: 'Havertz',   pos: 'ST', x: 50, y: 18 },
  { number: 7,  name: 'Hofmann',   pos: 'LW', x: 78, y: 26 },
]

const MOCK_H2H = [
  { date: '2022-12-02', home: '🇧🇷 Brazil', away: '🇩🇪 Germany', score: '2 – 0', result: 'home' },
  { date: '2019-03-26', home: '🇩🇪 Germany', away: '🇧🇷 Brazil', score: '1 – 1', result: 'draw' },
  { date: '2017-06-27', home: '🇧🇷 Brazil', away: '🇩🇪 Germany', score: '1 – 0', result: 'home' },
  { date: '2014-07-08', home: '🇩🇪 Germany', away: '🇧🇷 Brazil', score: '7 – 1', result: 'home' },
  { date: '2011-08-10', home: '🇧🇷 Brazil', away: '🇩🇪 Germany', score: '3 – 2', result: 'home' },
  { date: '2006-06-30', home: '🇩🇪 Germany', away: '🇧🇷 Brazil', score: '1 – 2', result: 'away' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

/** Horizontal stat bar row */
function StatBar({ label, home, away, unit, isPercent: _isPercent }: {
  label: string; home: number; away: number; unit: string; isPercent: boolean
}) {
  const total   = home + away
  const homePct = total > 0 ? (home / total) * 100 : 50

  return (
    <div className="py-2.5 border-b border-white/5 last:border-0">
      <div className="flex justify-between items-center mb-1.5 text-[11px] font-lexend">
        <span className="font-black text-white">{typeof home === 'number' && !Number.isInteger(home) ? home.toFixed(1) : home}{unit}</span>
        <span className="text-white/30 uppercase tracking-widest font-bold">{label}</span>
        <span className="font-black text-white/40">{typeof away === 'number' && !Number.isInteger(away) ? away.toFixed(1) : away}{unit}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden flex">
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-700"
          style={{ width: `${homePct}%` }}
        />
      </div>
    </div>
  )
}

/** Momentum chart — pure CSS/SVG sparkline */
function MomentumChart({ data }: { data: typeof MOCK_MOMENTUM }) {
  const w = 540; const h = 80
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.home / 100) * h)
    return `${x},${y}`
  }).join(' ')

  const awayPts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.away / 100) * h)
    return `${x},${y}`
  }).join(' ')

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Match Momentum</p>
        <div className="flex gap-4 text-[10px] font-lexend font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary-container inline-block rounded-full" />
            <span className="text-primary-container">Brazil</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-white/20 inline-block rounded-full" />
            <span className="text-white/30">Germany</span>
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
        {/* 50% reference line */}
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Away fill */}
        <polyline
          points={awayPts}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Home fill */}
        <polyline
          points={pts}
          fill="none"
          stroke="#00ff41"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Goal marker example at min 30 */}
        <circle cx={(6 / (data.length - 1)) * w} cy={h - ((data[6].home / 100) * h)} r="4" fill="#00ff41" />
        <line
          x1={(6 / (data.length - 1)) * w}
          y1="0"
          x2={(6 / (data.length - 1)) * w}
          y2={h}
          stroke="#00ff41"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
      </svg>

      {/* Time axis */}
      <div className="flex justify-between mt-1 text-[9px] font-lexend text-white/15">
        {[0, 15, 30, 45, 60, 75, 90].map((m) => (
          <span key={m}>{m}'</span>
        ))}
      </div>
    </GlassCard>
  )
}

/** Formation dot */
function PlayerDot({ player, flipped }: { player: typeof MOCK_HOME_XI[0]; flipped?: boolean }) {
  const x = flipped ? (100 - player.x) : player.x
  const y = flipped ? (100 - player.y) : player.y

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-7 h-7 rounded-full bg-primary-container/20 border border-primary-container/50 flex items-center justify-center">
          <span className="text-[9px] font-lexend font-black text-primary-container">{player.number}</span>
        </div>
        <span className="text-[8px] font-lexend font-bold text-white/60 whitespace-nowrap bg-black/40 px-1 rounded">
          {player.name}
        </span>
      </div>
    </div>
  )
}

/** Football pitch with two formations */
function FormationPitch({ homeXI, awayXI }: { homeXI: typeof MOCK_HOME_XI; awayXI: typeof MOCK_AWAY_XI }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Starting Formations</p>
      </div>

      {/* Pitch */}
      <div
        className="relative mx-4 my-4 rounded-lg overflow-hidden"
        style={{
          background: 'repeating-linear-gradient(180deg, rgba(0,255,65,0.04) 0px, rgba(0,255,65,0.04) 24px, rgba(0,255,65,0.02) 24px, rgba(0,255,65,0.02) 48px)',
          border: '1px solid rgba(0,255,65,0.12)',
          height: 380,
        }}
      >
        {/* Pitch markings */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          {/* Centre line */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          {/* Centre circle */}
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="0.8" fill="rgba(0,255,65,0.3)" />
          {/* Home penalty area */}
          <rect x="25" y="76" width="50" height="22" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <rect x="35" y="86" width="30" height="14" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          {/* Away penalty area */}
          <rect x="25" y="2" width="50" height="22" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <rect x="35" y="2" width="30" height="14" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
        </svg>

        {/* Team label badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
          <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-primary-container/60 bg-black/30 px-2 py-0.5 rounded">🇧🇷 Brazil</span>
          <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-white/30 bg-black/30 px-2 py-0.5 rounded">🇩🇪 Germany</span>
        </div>

        {/* Home XI (bottom half) */}
        {homeXI.map((p) => <PlayerDot key={p.number} player={p} />)}

        {/* Away XI (top half — flipped) */}
        {awayXI.map((p) => <PlayerDot key={`away-${p.number}`} player={p} flipped />)}
      </div>
    </GlassCard>
  )
}

/** H2H record card */
function H2HCard({ matches, homeFlag: _homeFlag, awayFlag: _awayFlag }: {
  matches: typeof MOCK_H2H; homeFlag: string; awayFlag: string
}) {
  const homeW = matches.filter((m) => m.result === 'home').length
  const draws = matches.filter((m) => m.result === 'draw').length
  const awayW = matches.filter((m) => m.result === 'away').length

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Head-to-Head Record</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 px-4 py-4 border-b border-white/5">
        {[
          { label: 'Wins', value: homeW, color: 'text-primary-container' },
          { label: 'Draws', value: draws, color: 'text-white/40' },
          { label: 'Wins', value: awayW, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="flex-1 text-center">
            <p className={`font-lexend font-black text-2xl ${stat.color}`}>{stat.value}</p>
            <p className="text-[9px] font-lexend uppercase tracking-widest text-white/20">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent matches */}
      <div className="divide-y divide-white/5">
        {matches.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs font-lexend">
            <span className="text-white/20 w-16 flex-shrink-0">{m.date.slice(0, 7)}</span>
            <span className={`flex-1 truncate text-right text-[11px] ${m.result === 'home' ? 'text-white' : 'text-white/30'}`}>
              {m.home}
            </span>
            <span className={`font-black text-sm px-2 rounded min-w-[52px] text-center ${
              m.result === 'home' ? 'text-primary-container bg-primary-container/10'
              : m.result === 'away' ? 'text-red-400 bg-red-400/10'
              : 'text-white/40 bg-white/5'
            }`}>
              {m.score}
            </span>
            <span className={`flex-1 truncate text-[11px] ${m.result === 'away' ? 'text-white' : 'text-white/30'}`}>
              {m.away}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/** Score predictor game */
function ScorePredictor({ match }: { match: Match }) {
  const { user: authUser } = useAuthStore()
  const user = getEffectiveUser(authUser)
  const oracle = getStaticOracle(match.id)
  const existing = user ? getPrediction(user.id, match.id) : undefined

  const [homeGoals, setHomeGoals] = useState(existing?.predicted_home ?? 0)
  const [awayGoals, setAwayGoals] = useState(existing?.predicted_away ?? 0)
  const [submitted, setSubmitted] = useState(Boolean(existing))
  const [points, setPoints] = useState<number | null>(null)

  const canPredict = match.status === 'upcoming'
  const oraclePred = oracle ?? {
    homeWin: 50,
    draw: 25,
    awayWin: 25,
    predictedHome: 1,
    predictedAway: 1,
    confidence: 50,
  }

  const resolvedPoints =
    points ??
    (existing
      ? scorePrediction(
          existing.predicted_home,
          existing.predicted_away,
          oraclePred.predictedHome,
          oraclePred.predictedAway,
        )
      : null)

  function handleSubmit() {
    if (!user) return
    savePrediction(user.id, match.id, homeGoals, awayGoals)
    setSubmitted(true)
    setPoints(
      scorePrediction(
        homeGoals,
        awayGoals,
        oraclePred.predictedHome,
        oraclePred.predictedAway,
      ),
    )
  }

  const homeFlag = match.home_team.flag_url
  const awayFlag = match.away_team.flag_url

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Score Predictor</p>
        <div className="flex items-center gap-1.5 bg-primary-container/10 px-2.5 py-1 rounded-full border border-primary-container/20">
          <span className="material-symbols-outlined text-[12px] text-primary-container">emoji_events</span>
          <span className="text-[10px] font-lexend font-black text-primary-container">+50 pts</span>
        </div>
      </div>

      <div className="p-4">
        {!canPredict && !submitted && (
          <p className="text-[11px] font-lexend text-white/30 mb-4 text-center">
            Predictions open for upcoming matches only.
          </p>
        )}
        {!submitted && canPredict ? (
          <>
            <p className="text-[11px] font-lexend text-white/30 mb-4 text-center">
              Predict the exact score to earn 50 points · kickoff {formatKickoff(match.kickoff_at)}
            </p>

            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Home goals */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-lexend font-bold text-white/60">
                  {homeFlag && !homeFlag.startsWith('http') ? homeFlag : match.home_team.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHomeGoals(Math.max(0, homeGoals - 1))}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{homeGoals}</span>
                  <button
                    onClick={() => setHomeGoals(homeGoals + 1)}
                    className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container hover:bg-primary-container/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>

              <span className="font-lexend font-black text-2xl text-white/20">—</span>

              {/* Away goals */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-lexend font-bold text-white/60">
                  {awayFlag && !awayFlag.startsWith('http') ? awayFlag : match.away_team.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAwayGoals(Math.max(0, awayGoals - 1))}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-lexend font-black text-3xl text-white w-8 text-center">{awayGoals}</span>
                  <button
                    onClick={() => setAwayGoals(awayGoals + 1)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Win probability bar */}
            <div className="mb-5">
              <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                <div className="bg-primary-container rounded-l-full" style={{ width: `${oraclePred.homeWin}%` }} />
                <div className="bg-white/20" style={{ width: `${oraclePred.draw}%` }} />
                <div className="bg-red-400 rounded-r-full" style={{ width: `${oraclePred.awayWin}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-[9px] font-lexend text-white/20">
                <span className="text-primary-container">{oraclePred.homeWin}% win</span>
                <span>{oraclePred.draw}% draw</span>
                <span className="text-red-400">{oraclePred.awayWin}% win</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary-container font-lexend font-black text-xs uppercase tracking-widest hover:bg-primary-container/25 transition-colors"
            >
              Lock In Prediction
            </button>
          </>
        ) : submitted ? (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-4xl text-primary-container block mb-2">
              {resolvedPoints === 50 ? 'celebration' : (resolvedPoints ?? 0) > 0 ? 'check_circle' : 'sports_soccer'}
            </span>
            <p className="font-lexend font-black text-2xl text-white mb-1">
              {homeGoals} – {awayGoals}
            </p>
            <p className="text-[11px] font-lexend text-white/30 mb-3">Your prediction is locked in</p>
            {match.status === 'upcoming' && (
              <div className="bg-primary-container/10 border border-primary-container/20 rounded-lg px-4 py-2.5">
                <p className="font-lexend font-black text-primary-container text-sm">
                  Oracle pick: {oraclePred.predictedHome}–{oraclePred.predictedAway}
                </p>
                <p className="text-[10px] font-lexend text-white/30 mt-1">Points awarded after full time</p>
              </div>
            )}
            {match.status !== 'upcoming' && resolvedPoints !== null && (
              <div className="bg-primary-container/10 border border-primary-container/20 rounded-lg px-4 py-2.5">
                <p className="font-lexend font-black text-primary-container">
                  {resolvedPoints === 50 ? '+50 pts — Exact!' : resolvedPoints > 0 ? '+10 pts — Correct result!' : 'No points this time'}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </GlassCard>
  )
}

/** Player of the Match poll */
function POTMPoll() {
  const [voted, setVoted] = useState<string | null>(null)
  const candidates = [
    { name: 'Vini Jr.', flag: '🇧🇷', votes: 38 },
    { name: 'Kimmich',  flag: '🇩🇪', votes: 24 },
    { name: 'Casemiro', flag: '🇧🇷', votes: 21 },
    { name: 'Gnabry',   flag: '🇩🇪', votes: 17 },
  ]

  const total = candidates.reduce((s, c) => s + c.votes, 0)

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Player of the Match</p>
        <span className="text-[10px] font-lexend text-white/20">{total.toLocaleString()} votes</span>
      </div>

      <div className="divide-y divide-white/5">
        {candidates.map((c) => {
          const pct = Math.round((c.votes / total) * 100)
          const isVoted = voted === c.name
          return (
            <button
              key={c.name}
              onClick={() => setVoted(c.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                isVoted ? 'bg-primary-container/8' : 'hover:bg-white/3'
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className={`font-lexend font-bold text-xs flex-1 ${isVoted ? 'text-primary-container' : 'text-white/60'}`}>
                {c.name}
              </span>
              {voted && (
                <div className="w-24 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isVoted ? 'bg-primary-container' : 'bg-white/15'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-lexend font-bold w-8 text-right ${isVoted ? 'text-primary-container' : 'text-white/20'}`}>
                    {pct}%
                  </span>
                </div>
              )}
              {!voted && (
                <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center">
                  {isVoted && <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}

/** Live event commentary ticker */
function LiveFeed() {
  const events = [
    { min: "82'", type: 'goal',    icon: 'sports_soccer', text: 'GOAL! Vini Jr. fires low into the corner. Brazil lead 2–1.',       team: 'home' },
    { min: "74'", type: 'yellow',  icon: 'square',        text: 'Yellow card — Kimmich for a late challenge on Rodrygo.',           team: 'away' },
    { min: "68'", type: 'goal',    icon: 'sports_soccer', text: 'GOAL! Havertz equalises from close range. Germany level at 1–1.', team: 'away' },
    { min: "45'", type: 'whistle', icon: 'sports',        text: 'Half-time. Brazil lead 1–0. Dominant display in the first half.', team: null   },
    { min: "31'", type: 'goal',    icon: 'sports_soccer', text: 'GOAL! Richarlison heads home from a Rapinha cross. 1–0!',         team: 'home' },
    { min: "12'", type: 'yellow',  icon: 'square',        text: 'Yellow card — Schlotterbeck for foul on Rodrygo.',                team: 'away' },
  ]

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Live Commentary</p>
      </div>
      <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5">
            <span className="text-[10px] font-lexend font-black text-white/20 w-8 flex-shrink-0 pt-0.5">{ev.min}</span>
            <span className={`material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5 ${
              ev.type === 'goal' ? 'text-primary-container'
              : ev.type === 'yellow' ? 'text-yellow-400'
              : 'text-white/20'
            }`}>
              {ev.icon}
            </span>
            <p className={`text-xs font-lexend leading-relaxed ${
              ev.type === 'goal' ? 'text-white font-bold' : 'text-white/40'
            }`}>
              {ev.text}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/** Top player stat row */
function PlayerStatRow({ player, metric }: {
  player: typeof MOCK_PLAYER_STATS[0];
  metric: 'speed' | 'passes' | 'distance' | 'rating'
}) {
  const value    = player[metric]
  const maxValue = { speed: 40, passes: 100, distance: 12, rating: 10 }[metric]
  const pct      = (value / maxValue) * 100

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-sm leading-none">{player.flag}</span>
      <span className="font-lexend font-bold text-xs text-white/60 flex-1 truncate">{player.name}</span>
      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${player.team === 'home' ? 'bg-primary-container' : 'bg-white/20'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-lexend font-black text-sm text-white w-10 text-right">
        {metric === 'speed' ? `${value}` : metric === 'distance' ? value.toFixed(1) : value}
        <span className="text-[9px] text-white/20 font-normal ml-0.5">
          {metric === 'speed' ? 'km/h' : metric === 'passes' ? '%' : metric === 'distance' ? 'km' : ''}
        </span>
      </span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
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

  return (
    <PageWrapper>

      {/* ── Score card always visible ── */}
      <ScoreCard match={match} />

      {/* ── Tab bar ── */}
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

      {/* ══ OVERVIEW ══ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <MomentumChart data={MOCK_MOMENTUM} />
            <LiveFeed />

            {/* Team stats summary */}
            <GlassCard className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Team Statistics</p>
              </div>
              <div className="px-4 py-2">
                {MOCK_TEAM_STATS.map((s) => (
                  <StatBar key={s.label} {...s} />
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-4 space-y-5">
            {match.status === 'live' && (
              <VibeMeter value={94} atmosphere={98} crowdNoise={93} energyIndex={88} match={match} />
            )}
            <OraclePrediction
              match={match}
              homeWin={55}
              draw={18}
              awayWin={27}
              predictedHome={2}
              predictedAway={1}
              confidence={68}
            />
            <POTMPoll />
          </div>
        </div>
      )}

      {/* ══ LIVE STATS ══ */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            <MomentumChart data={MOCK_MOMENTUM} />

            {/* Team stats */}
            <GlassCard className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Match Statistics</p>
                <div className="flex items-center gap-3 text-[9px] font-lexend font-bold uppercase tracking-widest">
                  <span className="text-primary-container flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />🇧🇷 Brazil
                  </span>
                  <span className="text-white/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />🇩🇪 Germany
                  </span>
                </div>
              </div>
              <div className="px-4 py-2">
                {MOCK_TEAM_STATS.map((s) => (
                  <StatBar key={s.label} {...s} />
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Player stats sidebar */}
          <div className="lg:col-span-4 space-y-5">
            <GlassCard className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/8">
                <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20 mb-2.5">Player Rankings</p>
                {/* Metric selector */}
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
                {MOCK_PLAYER_STATS
                  .sort((a, b) => b[playerMetric] - a[playerMetric])
                  .map((p) => (
                    <PlayerStatRow key={p.name} player={p} metric={playerMetric} />
                  ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ══ LINEUPS ══ */}
      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <FormationPitch homeXI={MOCK_HOME_XI} awayXI={MOCK_AWAY_XI} />
          </div>
          <div className="lg:col-span-4 space-y-5">
            {/* Starting XI lists */}
            {[
              { label: '🇧🇷 Brazil 4-3-3', xi: MOCK_HOME_XI, color: 'text-primary-container' },
              { label: '🇩🇪 Germany 4-2-3-1', xi: MOCK_AWAY_XI, color: 'text-white/60' },
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

      {/* ══ H2H ══ */}
      {activeTab === 'h2h' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <H2HCard matches={MOCK_H2H} homeFlag="🇧🇷" awayFlag="🇩🇪" />
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

      {/* ══ PREDICTOR ══ */}
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
            <MomentumChart data={MOCK_MOMENTUM} />
          </div>
        </div>
      )}

      {/* ── Live Chat — always visible at bottom ── */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 bg-primary-container rounded-full" />
          <h2 className="font-lexend font-bold uppercase tracking-tighter text-sm">
            Match Chat
          </h2>
          <div className="flex items-center gap-1.5 bg-surface-container-high px-2.5 py-0.5 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            <span className="text-[10px] font-lexend font-bold text-primary-container">LIVE</span>
          </div>
        </div>
        <GlassCard className="h-[480px] flex flex-col overflow-hidden">
          <LiveChatPanel matchId={match.id} />
        </GlassCard>
      </div>

    </PageWrapper>
  )
}