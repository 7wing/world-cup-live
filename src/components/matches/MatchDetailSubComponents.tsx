// src/components/matches/MatchDetailSubComponents.tsx
// All sub-components for the Match Detail screen.
// Data contracts match the exports from mockMatchData.ts exactly.

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import type { H2HMatch, PlayerStat, PitchPlayer } from './mockMatchData'

// ─────────────────────────────────────────────────────────────────────────────
// StatBar
// ─────────────────────────────────────────────────────────────────────────────
export function StatBar({
  label, home, away, unit,
}: {
  label: string; home: number; away: number; unit: string; isPercent: boolean
}) {
  const total   = home + away
  const homePct = total > 0 ? (home / total) * 100 : 50

  const fmt = (v: number) =>
    typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(1) : String(v)

  return (
    <div className="py-2.5 border-b border-white/5 last:border-0">
      <div className="flex justify-between items-center mb-1.5 text-[11px] font-lexend">
        <span className="font-black text-white">{fmt(home)}{unit}</span>
        <span className="text-white/30 uppercase tracking-widest font-bold">{label}</span>
        <span className="font-black text-white/40">{fmt(away)}{unit}</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// MomentumChart
// Expects: { minute: number; home: number; away: number }[]
// ─────────────────────────────────────────────────────────────────────────────
export function MomentumChart({
  data,
  homeLabel = 'Home',
  awayLabel = 'Away',
}: {
  data: { minute: number; home: number; away: number }[]
  homeLabel?: string
  awayLabel?: string
}) {
  const W = 540; const H = 80
  const pts  = (key: 'home' | 'away') =>
    data.map((d, i) => `${(i / (data.length - 1)) * W},${H - (d[key] / 100) * H}`).join(' ')

  // goal marker: first point where home jumps by ≥20
  const goalIdx = data.findIndex((d, i) => i > 0 && d.home - data[i - 1].home >= 20)
  const markerX = goalIdx >= 0 ? (goalIdx / (data.length - 1)) * W : null
  const markerY = goalIdx >= 0 ? H - (data[goalIdx].home / 100) * H : null

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
          Match Momentum
        </p>
        <div className="flex gap-4 text-[10px] font-lexend font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary-container inline-block rounded-full" />
            <span className="text-primary-container">{homeLabel}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-white/20 inline-block rounded-full" />
            <span className="text-white/30">{awayLabel}</span>
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
        {/* midline */}
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
        {/* away line */}
        <polyline points={pts('away')} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* home line */}
        <polyline points={pts('home')} fill="none" stroke="#00ff41" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* goal marker */}
        {markerX !== null && markerY !== null && (
          <>
            <circle cx={markerX} cy={markerY} r="4" fill="#00ff41" />
            <line x1={markerX} y1="0" x2={markerX} y2={H} stroke="#00ff41" strokeWidth="0.5" strokeOpacity="0.3" />
          </>
        )}
      </svg>

      <div className="flex justify-between mt-1 text-[9px] font-lexend text-white/15">
        {[0, 15, 30, 45, 60, 75, 90].map((m) => <span key={m}>{m}'</span>)}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FormationPitch
// Expects PitchPlayer[] from mockMatchData
// ─────────────────────────────────────────────────────────────────────────────
function PlayerDot({ player, flipped }: { player: PitchPlayer; flipped?: boolean }) {
  const x = flipped ? 100 - player.x : player.x
  const y = flipped ? 100 - player.y : player.y
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

export function FormationPitch({
  homeXI,
  awayXI,
  homeLabel = '🇧🇷 Home',
  awayLabel = '🇩🇪 Away',
}: {
  homeXI: PitchPlayer[]
  awayXI: PitchPlayer[]
  homeLabel?: string
  awayLabel?: string
}) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
          Starting Formations
        </p>
      </div>
      <div
        className="relative mx-4 my-4 rounded-lg overflow-hidden"
        style={{
          background:
            'repeating-linear-gradient(180deg,rgba(0,255,65,0.04) 0px,rgba(0,255,65,0.04) 24px,rgba(0,255,65,0.02) 24px,rgba(0,255,65,0.02) 48px)',
          border: '1px solid rgba(0,255,65,0.12)',
          height: 380,
        }}
      >
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="0.8" fill="rgba(0,255,65,0.3)" />
          <rect x="25" y="76" width="50" height="22" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <rect x="35" y="86" width="30" height="14" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <rect x="25" y="2"  width="50" height="22" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
          <rect x="35" y="2"  width="30" height="14" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.3" />
        </svg>
        <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
          <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-primary-container/60 bg-black/30 px-2 py-0.5 rounded">
            {homeLabel}
          </span>
          <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-white/30 bg-black/30 px-2 py-0.5 rounded">
            {awayLabel}
          </span>
        </div>
        {homeXI.map((p) => <PlayerDot key={p.number}         player={p} />)}
        {awayXI.map((p) => <PlayerDot key={`away-${p.number}`} player={p} flipped />)}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// H2HCard
// ─────────────────────────────────────────────────────────────────────────────
export function H2HCard({
  matches,
  homeFlag = '',
  awayFlag = '',
}: {
  matches: H2HMatch[]
  homeFlag?: string
  awayFlag?: string
}) {
  const homeW = matches.filter((m) => m.result === 'home').length
  const draws  = matches.filter((m) => m.result === 'draw').length
  const awayW  = matches.filter((m) => m.result === 'away').length

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
          Head-to-Head Record
        </p>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
        <div className="flex-1 text-center">
          <p className="font-lexend font-black text-2xl text-primary-container">{homeW}</p>
          <p className="text-[9px] font-lexend uppercase tracking-widest text-white/20">
            {homeFlag} Wins
          </p>
        </div>
        <div className="flex-1 text-center">
          <p className="font-lexend font-black text-2xl text-white/40">{draws}</p>
          <p className="text-[9px] font-lexend uppercase tracking-widest text-white/20">Draws</p>
        </div>
        <div className="flex-1 text-center">
          <p className="font-lexend font-black text-2xl text-red-400">{awayW}</p>
          <p className="text-[9px] font-lexend uppercase tracking-widest text-white/20">
            {awayFlag} Wins
          </p>
        </div>
      </div>

      {/* Match rows */}
      <div className="divide-y divide-white/5">
        {matches.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-xs font-lexend">
            <span className="text-white/20 w-16 flex-shrink-0">{m.date.slice(0, 7)}</span>
            <span className={`flex-1 truncate text-right text-[11px] ${m.result === 'home' ? 'text-white' : 'text-white/30'}`}>
              {m.home}
            </span>
            <span className={`font-black text-sm px-2 rounded min-w-[56px] text-center ${
              m.result === 'home' ? 'text-primary-container bg-primary-container/10'
              : m.result === 'away' ? 'text-red-400 bg-red-400/10'
              : 'text-white/40 bg-white/5'
            }`}>
              {m.score}
            </span>
            <span className={`flex-1 truncate text-[11px] ${m.result === 'away' ? 'text-white' : 'text-white/30'}`}>
              {m.away}
            </span>
            <span className="text-[9px] text-white/15 flex-shrink-0">{m.tournament}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// POTMPoll
// ─────────────────────────────────────────────────────────────────────────────
const POTM_CANDIDATES = [
  { name: 'Vini Jr.',  flag: '🇧🇷', votes: 38 },
  { name: 'Kimmich',   flag: '🇩🇪', votes: 24 },
  { name: 'Casemiro',  flag: '🇧🇷', votes: 21 },
  { name: 'Gnabry',    flag: '🇩🇪', votes: 17 },
]

export function POTMPoll() {
  const [voted, setVoted] = useState<string | null>(null)
  const total = POTM_CANDIDATES.reduce((s, c) => s + c.votes, 0)

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
          Player of the Match
        </p>
        <span className="text-[10px] font-lexend text-white/20">{total.toLocaleString()} votes</span>
      </div>
      <div className="divide-y divide-white/5">
        {POTM_CANDIDATES.map((c) => {
          const pct     = Math.round((c.votes / total) * 100)
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
              {voted ? (
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
              ) : (
                <div className="w-5 h-5 rounded-full border border-white/10" />
              )}
            </button>
          )
        })}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LiveFeed  (commentary ticker)
// ─────────────────────────────────────────────────────────────────────────────
const LIVE_EVENTS = [
  { min: "82'", type: 'goal',   icon: 'sports_soccer', text: 'GOAL! Vini Jr. fires low into the corner. Brazil lead 2–1.' },
  { min: "74'", type: 'yellow', icon: 'square',        text: 'Yellow card — Kimmich for a late challenge on Rodrygo.' },
  { min: "68'", type: 'goal',   icon: 'sports_soccer', text: 'GOAL! Havertz equalises from close range. Germany level at 1–1.' },
  { min: "45'", type: 'text',   icon: 'sports',        text: 'Half-time. Brazil lead 1–0. Dominant first half.' },
  { min: "31'", type: 'goal',   icon: 'sports_soccer', text: 'GOAL! Richarlison heads home from a Raphinha cross. 1–0!' },
]

export function LiveFeed() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">
          Live Commentary
        </p>
      </div>
      <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
        {LIVE_EVENTS.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5">
            <span className="text-[10px] font-lexend font-black text-white/20 w-8 flex-shrink-0 pt-0.5">
              {ev.min}
            </span>
            <span className={`material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5 ${
              ev.type === 'goal' ? 'text-primary-container' : ev.type === 'yellow' ? 'text-yellow-400' : 'text-white/20'
            }`}>
              {ev.icon}
            </span>
            <p className={`text-xs font-lexend leading-relaxed ${ev.type === 'goal' ? 'text-white font-bold' : 'text-white/40'}`}>
              {ev.text}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PlayerStatRow
// ─────────────────────────────────────────────────────────────────────────────
const METRIC_MAX: Record<string, number> = { speed: 40, passes: 100, distance: 12, rating: 10 }
const METRIC_UNIT: Record<string, string> = { speed: 'km/h', passes: '%', distance: 'km', rating: '' }

export function PlayerStatRow({
  player,
  metric,
}: {
  player: PlayerStat
  metric: keyof PlayerStat & ('speed' | 'passes' | 'distance' | 'rating')
}) {
  const value  = player[metric] as number
  const pct    = (value / METRIC_MAX[metric]) * 100

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
      <span className="font-lexend font-black text-sm text-white w-14 text-right">
        {metric === 'distance' ? value.toFixed(1) : value}
        <span className="text-[9px] text-white/20 font-normal ml-0.5">{METRIC_UNIT[metric]}</span>
      </span>
    </div>
  )
}