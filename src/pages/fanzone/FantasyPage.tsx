// src/pages/fanzone/FantasyPage.tsx
// Fantasy draft — pulls real players from Supabase players table.
// Saves/loads squad via fantasy_squads + fantasy_players tables.

import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery, useMutation }        from '@tanstack/react-query'
import { useAuthStore }                 from '@/store/authStore'
import { fetchPlayers, fetchFantasySquad, saveFantasySquad } from '@/api/fanzone'
import type { Player, FantasySquadPlayer } from '@/api/fanzone'

// ── Constants ─────────────────────────────────────────────────────────────────

const BUDGET     = 100
const SQUAD_SIZE = 11

const MIN_POSITIONS: Record<Player['position'], number> = {
  GK: 1, DEF: 3, MID: 2, FWD: 1,
}

const POSITIONS: Player['position'][] = ['GK', 'DEF', 'MID', 'FWD']

const POSITION_COLORS: Record<Player['position'], string> = {
  GK:  '#F59E0B',
  DEF: '#3B82F6',
  MID: '#10B981',
  FWD: '#EF4444',
}

// ── Scoring ───────────────────────────────────────────────────────────────────

const SCORING = {
  goal_gk_def:       6,
  goal_outfield:     4,
  assist:            3,
  clean_sheet_gk_def: 4,
  clean_sheet_mid:   1,
  yellow_card:      -1,
  red_card:         -3,
}

function calcPoints(p: FantasySquadPlayer): number {
  const isDefensive = p.position === 'GK' || p.position === 'DEF'
  let pts = 0
  pts += p.goals        * (isDefensive ? SCORING.goal_gk_def : SCORING.goal_outfield)
  pts += p.assists      * SCORING.assist
  pts += p.yellow_cards * SCORING.yellow_card
  pts += p.red_cards    * SCORING.red_card
  if (p.clean_sheet) {
    pts += isDefensive ? SCORING.clean_sheet_gk_def : (p.position === 'MID' ? SCORING.clean_sheet_mid : 0)
  }
  return pts
}

// Keep calcPoints referenced so TS doesn't warn — used when locked squad shows real points
void calcPoints

// ── Component ─────────────────────────────────────────────────────────────────

export function FantasyPage() {
  const { user }       = useAuthStore()
  const matchdayId     = 'matchday_1' // derive from router/context when matchdays are live
  const [filter, setFilter]           = useState<Player['position'] | 'ALL'>('ALL')
  const [squad, setSquad]             = useState<Player[]>([])
  const [locked, setLocked]           = useState(false)
  const [savedMsg, setSavedMsg]       = useState(false)
  const squadRestoredRef             = useRef(false)

  // ── Fetch player pool ──────────────────────────────────────────────────────
  const { data: allPlayers = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn:  () => fetchPlayers(),
    staleTime: 5 * 60_000,
  })

  // ── Load existing squad ────────────────────────────────────────────────────
  const { data: existingSquad } = useQuery({
    queryKey: ['fantasy_squad', user?.id, matchdayId],
    queryFn:  () => fetchFantasySquad(user!.id, matchdayId),
    enabled:  !!user,
  })

  // Restore squad from DB into local state once data arrives.
  // squadRestoredRef ensures setSquad is only called on the first arrival of
  // existingSquad, preventing cascading renders after user modifications.
  useEffect(() => {
    if (!existingSquad || squadRestoredRef.current) return
    squadRestoredRef.current = true
    setSquad(existingSquad.players.map((p: FantasySquadPlayer) => ({
      id:       p.id,
      name:     p.name,
      team:     p.team,
      position: p.position,
      cost:     p.cost,
    })))
    setLocked(existingSquad.squad.locked_in)
  }, [existingSquad])

  // ── Save mutation ──────────────────────────────────────────────────────────
  const { mutate: persistSquad, isPending: saving } = useMutation({
    mutationFn: ({ lockedIn }: { lockedIn: boolean }) =>
      saveFantasySquad(user!.id, matchdayId, squad, lockedIn),
    onSuccess: () => {
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2000)
    },
  })

  // ── Derived state ──────────────────────────────────────────────────────────
  const spent     = useMemo(() => squad.reduce((s, p) => s + p.cost, 0), [squad])
  const remaining = BUDGET - spent
  const squadIds  = useMemo(() => new Set(squad.map(p => p.id)), [squad])

  const positionCounts = useMemo(() => {
    const c: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
    squad.forEach(p => c[p.position]++)
    return c
  }, [squad])

  const isValid =
    squad.length === SQUAD_SIZE &&
    POSITIONS.every(pos => positionCounts[pos] >= MIN_POSITIONS[pos])

  const visiblePlayers = allPlayers.filter(
    p => filter === 'ALL' || p.position === filter,
  )

  // ── Handlers ───────────────────────────────────────────────────────────────

  const addPlayer = (player: Player) => {
    if (locked) return
    if (squadIds.has(player.id)) return
    if (squad.length >= SQUAD_SIZE) return
    if (remaining < player.cost) return
    setSquad(prev => [...prev, player])
  }

  const removePlayer = (id: string) => {
    if (locked) return
    setSquad(prev => prev.filter(p => p.id !== id))
  }

  const handleSave = () => {
    if (!user) return
    persistSquad({ lockedIn: false })
  }

  const handleLock = () => {
    if (!user || !isValid) return
    setLocked(true)
    persistSquad({ lockedIn: true })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-24">
      {/* Header */}
      <h1 className="font-lexend font-black text-5xl uppercase italic leading-none mb-2">
        Fantasy Draft
      </h1>
      <p className="text-white/40 text-sm font-lexend mb-8">
        Pick {SQUAD_SIZE} players within a {BUDGET}-credit budget. Scores update live after kick-off.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left: Player Pool ── */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-lexend font-black text-xs uppercase tracking-widest text-white/60">
              Player Pool
            </h2>
            <span className="text-[10px] font-lexend text-white/30">
              {allPlayers.length} players
            </span>
          </div>

          {/* Position filter */}
          <div className="flex gap-1.5 px-4 py-3 border-b border-white/5 flex-wrap">
            {(['ALL', ...POSITIONS] as const).map(pos => (
              <button
                key={pos}
                onClick={() => setFilter(pos)}
                className="px-3 py-1 rounded-full text-[10px] font-lexend font-black uppercase tracking-widest border transition-all"
                style={{
                  borderColor: filter === pos
                    ? (pos === 'ALL' ? 'rgba(255,255,255,0.4)' : POSITION_COLORS[pos as Player['position']])
                    : 'rgba(255,255,255,0.1)',
                  background: filter === pos
                    ? (pos === 'ALL' ? 'rgba(255,255,255,0.1)' : `${POSITION_COLORS[pos as Player['position']]}20`)
                    : 'transparent',
                  color: filter === pos
                    ? (pos === 'ALL' ? 'rgba(255,255,255,0.8)' : POSITION_COLORS[pos as Player['position']])
                    : 'rgba(255,255,255,0.3)',
                }}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Player list */}
          <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
            {loadingPlayers && (
              <div className="p-4 space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-11 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!loadingPlayers && visiblePlayers.length === 0 && (
              <p className="text-center text-white/20 text-sm font-lexend py-10">
                No players found
              </p>
            )}

            {!loadingPlayers && visiblePlayers.map(player => {
              const inSquad    = squadIds.has(player.id)
              const affordable = remaining >= player.cost
              const full       = squad.length >= SQUAD_SIZE
              const disabled   = !inSquad && (!affordable || full)

              return (
                <button
                  key={player.id}
                  onClick={() => inSquad ? removePlayer(player.id) : addPlayer(player)}
                  disabled={locked || disabled}
                  className="flex items-center gap-3 w-full px-4 py-3 border-b border-white/5 last:border-0 text-left transition-all disabled:opacity-40"
                  style={{
                    background: inSquad ? `${POSITION_COLORS[player.position]}10` : 'transparent',
                    cursor: locked ? 'default' : disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span
                    className="text-[9px] font-lexend font-black px-1.5 py-0.5 rounded text-white flex-shrink-0"
                    style={{ background: POSITION_COLORS[player.position] }}
                  >
                    {player.position}
                  </span>
                  <span className="flex-1 text-sm font-lexend font-semibold text-white/80 truncate">
                    {player.name}
                  </span>
                  <span className="text-[11px] font-lexend text-white/30 flex-shrink-0">
                    {player.team}
                  </span>
                  <span
                    className="text-sm font-lexend font-black flex-shrink-0"
                    style={{ color: inSquad ? POSITION_COLORS[player.position] : 'rgba(255,255,255,0.6)' }}
                  >
                    {player.cost}cr
                  </span>
                  {inSquad && (
                    <span className="text-xs flex-shrink-0" style={{ color: POSITION_COLORS[player.position] }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right: Your Squad ── */}
        <div className="flex flex-col gap-4">

          {/* Budget bar */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex justify-between text-xs font-lexend mb-2">
              <span className="text-white/40">
                Budget: <span className="text-white/80 font-bold">{remaining}cr left</span> / {BUDGET}cr
              </span>
              <span className="text-white/40">{squad.length}/{SQUAD_SIZE} players</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(spent / BUDGET) * 100}%`,
                  background: spent / BUDGET > 0.9 ? '#EF4444' : '#10B981',
                }}
              />
            </div>

            {/* Position requirements */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {POSITIONS.map(pos => {
                const count = positionCounts[pos]
                const min   = MIN_POSITIONS[pos]
                const ok    = count >= min
                return (
                  <span
                    key={pos}
                    className="text-[10px] font-lexend font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: ok ? POSITION_COLORS[pos] : 'rgba(255,255,255,0.1)',
                      background:  ok ? `${POSITION_COLORS[pos]}15` : 'transparent',
                      color:       ok ? POSITION_COLORS[pos] : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {pos}: {count} {ok ? '✓' : `(min ${min})`}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Squad list */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h2 className="font-lexend font-black text-xs uppercase tracking-widest text-white/60">
                Your Squad
              </h2>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
              {squad.length === 0 && (
                <p className="text-center text-white/20 text-sm font-lexend py-10">
                  Click players from the pool to add them
                </p>
              )}

              {squad.map(player => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0"
                >
                  <span
                    className="text-[9px] font-lexend font-black px-1.5 py-0.5 rounded text-white flex-shrink-0"
                    style={{ background: POSITION_COLORS[player.position] }}
                  >
                    {player.position}
                  </span>
                  <span className="flex-1 text-sm font-lexend font-semibold text-white/80 truncate">
                    {player.name}
                  </span>
                  <span className="text-[11px] font-lexend text-white/30">{player.cost}cr</span>
                  {!locked && (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-white/20 hover:text-white/60 transition-colors text-lg leading-none ml-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total points if locked */}
            {locked && squad.length > 0 && (
              <div className="px-4 py-3 border-t border-white/5 text-center">
                <span className="font-lexend font-black text-2xl text-primary-container">
                  0 pts
                </span>
                <p className="text-[10px] font-lexend text-white/30 mt-0.5">
                  Points update after kick-off
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {!user ? (
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-sm font-lexend text-white/40">Sign in to save your squad</p>
            </div>
          ) : locked ? (
            <div className="glass-card rounded-xl p-4 text-center border border-primary-container/30 bg-primary-container/5">
              <p className="font-lexend font-black text-sm text-primary-container uppercase tracking-widest">
                ✓ Squad locked in
              </p>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || squad.length === 0}
                className="flex-1 py-3 rounded-xl border border-white/10 bg-transparent font-lexend font-bold text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-40"
              >
                {saving ? 'Saving...' : savedMsg ? 'Saved ✓' : 'Save Draft'}
              </button>
              <button
                onClick={handleLock}
                disabled={!isValid || saving}
                className="flex-1 py-3 rounded-xl font-lexend font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isValid ? '#10B981' : 'rgba(255,255,255,0.05)',
                  color:      isValid ? '#fff'    : 'rgba(255,255,255,0.3)',
                }}
              >
                Lock In Squad
              </button>
            </div>
          )}

          {/* Scoring guide */}
          <div className="glass-card rounded-xl overflow-hidden">
            <details>
              <summary className="px-4 py-3 text-[11px] font-lexend font-black uppercase tracking-widest text-white/30 cursor-pointer select-none hover:text-white/50 transition-colors">
                Scoring Rules
              </summary>
              <div className="px-4 pb-4 space-y-1.5">
                {[
                  [`⚽ Goal (GK/DEF)`,          `+${SCORING.goal_gk_def}pts`],
                  [`⚽ Goal (MID/FWD)`,          `+${SCORING.goal_outfield}pts`],
                  [`🅰️ Assist`,                  `+${SCORING.assist}pts`],
                  [`🛡️ Clean sheet (GK/DEF)`,   `+${SCORING.clean_sheet_gk_def}pts`],
                  [`🛡️ Clean sheet (MID)`,      `+${SCORING.clean_sheet_mid}pt`],
                  [`🟨 Yellow card`,             `${SCORING.yellow_card}pt`],
                  [`🟥 Red card`,                `${SCORING.red_card}pts`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-[11px] font-lexend">
                    <span className="text-white/40">{label}</span>
                    <span className="text-white/70 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}