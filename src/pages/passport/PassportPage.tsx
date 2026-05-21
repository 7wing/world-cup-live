import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BadgeGrid } from '@/components/passport/BadgeGrid'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import { usePassport, usePredictionHistory } from '@/hooks/usePassport'
import { cn } from '@/utils/cn'
import type { User } from '@/types'

const TIER_THRESHOLDS: Record<string, number> = { fan: 0, elite: 5000, pro: 15000, mvp: 40000 }
const NEXT_TIER: Record<string, string> = { fan: 'elite', elite: 'pro', pro: 'mvp', mvp: 'mvp' }

const TIER_COLORS: Record<string, string> = {
  fan: 'from-white/20 to-white/5',
  elite: 'from-blue-400/30 to-blue-600/10',
  pro: 'from-purple-400/30 to-purple-600/10',
  mvp: 'from-primary-container/30 to-primary-container/5',
}

// ── Mock data for new auditor-requested feature sections ──────────────────────
const COLLECTIBLE_FRAMES = [
  { id: 'f1', label: 'Golden Boot', icon: '🥾', unlocked: true },
  { id: 'f2', label: 'Hat-trick Hero', icon: '🎩', unlocked: true },
  { id: 'f3', label: 'Clean Sheet', icon: '🧤', unlocked: false },
  { id: 'f4', label: 'Last Minute', icon: '⏱️', unlocked: false },
]

// ── XP Progress Bar ───────────────────────────────────────────────────────────
function XPBar({ user }: { user: User }) {
  const currentThreshold = TIER_THRESHOLDS[user.tier] ?? 0
  const nextThreshold = TIER_THRESHOLDS[NEXT_TIER[user.tier]] ?? user.xp
  const progress = Math.min(
    ((user.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100,
    100
  )
  const xpToNext = nextThreshold - user.xp

  return (
    <GlassCard className="p-6 flex flex-col items-center space-y-4 border-primary-container/20">
      <div className="flex items-center justify-between w-full">
        <span className="font-lexend text-xs text-white/40 uppercase tracking-widest">
          Next Rank Up
        </span>
        <span className="font-lexend text-xs font-bold text-primary-container uppercase">
          {NEXT_TIER[user.tier]}
        </span>
      </div>

      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-container to-white shadow-[0_0_10px_rgba(0,255,65,0.5)] transition-all duration-700 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between w-full text-xs font-lexend font-semibold">
        <span className="text-primary-container">{user.xp.toLocaleString()} XP</span>
        <span className="text-white/40">{xpToNext.toLocaleString()} XP to go</span>
      </div>

      {/* Daily check-in streak */}
      <div className="w-full border-t border-white/10 pt-4">
        <p className="text-[10px] text-white/40 uppercase font-lexend font-semibold mb-3">
          Check-in Streak
        </p>
        <div className="flex gap-1.5 justify-between">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-7 h-7 rounded flex items-center justify-center text-xs',
                  i < 5
                    ? 'bg-primary-container/20 border border-primary-container/50 text-primary-container'
                    : 'bg-white/5 border border-white/10 text-white/20'
                )}
              >
                {i < 5 ? '✓' : '·'}
              </div>
              <span className="text-[9px] text-white/30 font-lexend">{day}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-white/30 font-lexend text-center uppercase tracking-widest">
        Claim your daily bonus on the{' '}
        <a href="/fan-zone" className="text-primary-container hover:underline">Fan Zone</a>
      </p>
    </GlassCard>
  )
}

// ── Digital Collectibles / Profile Frames ─────────────────────────────────────
function CollectiblesSection() {
  const [activeFrame, setActiveFrame] = useState('f1')
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <h2 className="font-lexend font-black text-3xl uppercase italic flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
          Collectibles
        </h2>
        <span className="text-xs text-white/40 font-lexend uppercase font-semibold">
          {COLLECTIBLE_FRAMES.filter((f) => f.unlocked).length}/{COLLECTIBLE_FRAMES.length} Unlocked
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {COLLECTIBLE_FRAMES.map((frame) => (
          <button
            key={frame.id}
            onClick={() => frame.unlocked && setActiveFrame(frame.id)}
            className={cn(
              'relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all',
              frame.unlocked
                ? activeFrame === frame.id
                  ? 'bg-primary-container/15 border-primary-container shadow-[0_0_16px_rgba(0,255,65,0.2)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
            )}
          >
            <span className="text-4xl">{frame.icon}</span>
            <span className="font-lexend font-bold text-xs uppercase tracking-wide text-center">
              {frame.label}
            </span>
            {!frame.unlocked && (
              <span className="material-symbols-outlined text-white/20 text-base absolute top-2 right-2">
                lock
              </span>
            )}
            {activeFrame === frame.id && frame.unlocked && (
              <span className="text-[9px] text-primary-container font-lexend font-bold uppercase border border-primary-container/30 bg-primary-container/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function PassportPage() {
  const { user } = useAuthStore()
  const { data: badges, isLoading: badgesLoading } = usePassport(user?.id ?? '')
  const { data: predictions } = usePredictionHistory(user?.id ?? '')

  if (!user)
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-white/20">military_tech</span>
          <p className="font-lexend font-bold uppercase text-white/40">
            Log in to view your passport
          </p>
        </div>
      </PageWrapper>
    )


  const accuracyPct =
    predictions && predictions.length > 0
      ? Math.round((predictions.filter((p) => p.is_correct).length / predictions.length) * 100)
      : null

  return (
    <PageWrapper>
      {/* ── Hero: Avatar + Stats + XP Bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div
          className={cn(
            'md:col-span-8 glass-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden',
            'before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10',
            TIER_COLORS[user.tier]
          )}
        >
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-primary-container active-glow">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <span className="font-lexend font-black text-4xl text-primary-container">
                    {user.username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary font-lexend font-semibold px-3 py-1 rounded-sm text-xs tracking-tighter uppercase">
              {user.tier}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="font-lexend font-black text-4xl uppercase text-white mb-2">
              {user.username.toUpperCase()}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="px-6 py-3 bg-white/5 rounded-lg border border-white/10">
                <span className="block text-xs font-lexend font-semibold text-white/40 uppercase">
                  Global Rank
                </span>
                <span className="font-lexend font-black text-3xl text-primary-container">
                  #{user.global_rank ?? '—'}
                </span>
              </div>
              <div className="px-6 py-3 bg-white/5 rounded-lg border border-white/10">
                <span className="block text-xs font-lexend font-semibold text-white/40 uppercase">
                  Total XP
                </span>
                <span className="font-lexend font-black text-3xl">{user.xp.toLocaleString()}</span>
              </div>
              {accuracyPct !== null && (
                <div className="px-6 py-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="block text-xs font-lexend font-semibold text-white/40 uppercase">
                    Accuracy
                  </span>
                  <span className="font-lexend font-black text-3xl text-primary-container">
                    {accuracyPct}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-4">
          <XPBar user={user} />
        </div>
      </div>

      {/* ── Collectibles / Profile Frames ── */}
      <CollectiblesSection />

      {/* ── Digital Passport Badges ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <h2 className="font-lexend font-black text-3xl uppercase italic">Digital Passport</h2>
          <button className="text-primary-container font-lexend font-semibold uppercase tracking-wider text-sm flex items-center gap-2 hover:text-green-300 transition-colors">
            View Full Book
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {badgesLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card aspect-[3/4] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <BadgeGrid badges={badges ?? []} />
        )}
      </section>
    </PageWrapper>
  )
}