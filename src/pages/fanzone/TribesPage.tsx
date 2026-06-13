import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchTribes, createTribe } from '@/api/fanzone'
import { useAuthStore } from '@/store/authStore'
import { useJoinTribe } from '@/hooks/useTribes'
import { cn } from '@/utils/cn'
import type { Tribe } from '@/types'

// ── Global Tribe Leaderboard ──────────────────────────────────────────────────
function TribeLeaderboard({ tribes }: { tribes: Tribe[] }) {
  const top3 = tribes.slice(0, 3)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <GlassCard className="p-6 mb-8">
      <h2 className="font-lexend font-black text-xl uppercase mb-5 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container">emoji_events</span>
        Global Tribe Leaderboard
      </h2>
      <div className="space-y-3">
        {top3.map((tribe, i) => (
          <div
            key={tribe.id}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg border transition-colors',
              i === 0
                ? 'bg-primary-container/10 border-primary-container/30'
                : 'bg-white/[0.03] border-white/[0.07]'
            )}
          >
            <span className={cn('font-lexend font-black text-2xl w-8 text-center', i === 0 ? 'text-primary-container' : 'text-white/30')}>
              {medals[i]}
            </span>
            <span className="font-lexend font-bold uppercase flex-1 text-sm">{tribe.name}</span>
            <span className="font-lexend font-black text-lg text-primary-container">
              {tribe.total_points.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ── Tribe Card ────────────────────────────────────────────────────────────────
function TribeCard({
  tribe,
  onJoin,
  isJoining,
  isLoggedIn,
  onViewDetail,
}: {
  tribe: Tribe
  onJoin: (id: string) => void
  isJoining: boolean
  isLoggedIn: boolean
  onViewDetail: (id: string) => void
}) {
  const [joined, setJoined] = useState(false)

  const handleJoin = () => {
    if (joined) return
    setJoined(true)
    onJoin(tribe.id)
  }

  return (
    <GlassCard
      className="p-6 flex flex-col gap-4 hover:border-white/20 transition-colors cursor-pointer"
      onClick={() => onViewDetail(tribe.id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center shrink-0">
          {tribe.badge_url ? (
            <img src={tribe.badge_url} alt={tribe.name} className="w-7 h-7 object-contain" />
          ) : (
            <span className="material-symbols-outlined text-primary-container">shield</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-lexend font-bold uppercase truncate">{tribe.name}</h3>
          <p className="text-[11px] text-white/40 uppercase font-lexend mt-0.5">
            {tribe.member_count.toLocaleString()} members
          </p>
        </div>
        <span className="material-symbols-outlined text-white/20 text-base shrink-0">arrow_forward</span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <div>
          <span className="font-lexend font-black text-2xl text-primary-container">
            {tribe.total_points.toLocaleString()}
          </span>
          <span className="text-[10px] text-white/40 uppercase font-semibold font-lexend ml-2">pts</span>
        </div>
        <NeonButton
          variant={joined ? undefined : 'outline'}
          size="sm"
          disabled={isJoining || !isLoggedIn || joined}
          onClick={(e) => { e.stopPropagation(); handleJoin() }}
        >
          {joined ? 'Joined ✓' : isJoining ? 'Joining…' : 'Join Tribe'}
        </NeonButton>
      </div>
    </GlassCard>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function TribesPage() {
  const navigate = useNavigate()
  const { data: tribes, isLoading } = useQuery({ queryKey: ['tribes'], queryFn: fetchTribes })
  const { user } = useAuthStore()
  const { joinMutation, isJoining } = useJoinTribe()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBadge, setNewBadge] = useState('⚽')

  const createMutation = useMutation({
    mutationFn: (name: string) => createTribe({ name, badge_url: newBadge, team_id: null }),
    onSuccess: (tribe) => {
      setShowCreate(false)
      setNewName('')
      navigate(`/tribes/${tribe.id}`)
    },
  })

  const handleJoin = (tribeId: string) => joinMutation.mutate(tribeId)

  const filtered = tribes?.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-lexend font-black text-5xl uppercase italic">Tribes</h1>
        <div className="flex gap-3">
          {user && (
            <NeonButton size="sm" onClick={() => setShowCreate(true)}>
              <span className="material-symbols-outlined text-base">add</span>
              Create Tribe
            </NeonButton>
          )}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-base">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tribes..."
              className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-lexend text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors w-48"
            />
          </div>
          <NeonButton size="sm" onClick={() => navigate(`/profile/${user?.id}/friends`)}>
            <span className="material-symbols-outlined text-base">emoji_events</span>
            My Leagues
          </NeonButton>
        </div>
      </div>

      {/* ── Global Leaderboard — driven by live data ── */}
      {tribes && tribes.length > 0 && <TribeLeaderboard tribes={tribes} />}

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-lexend font-bold uppercase text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">groups</span>
          All Tribes
          {filtered && (
            <span className="text-xs text-white/30 font-normal ml-1">({filtered.length})</span>
          )}
        </h2>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card h-48 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered?.map((tribe) => (
          <TribeCard
            key={tribe.id}
            tribe={tribe}
            onJoin={handleJoin}
            isJoining={isJoining(tribe.id)}
            isLoggedIn={!!user}
            onViewDetail={(id) => navigate(`/tribes/${id}`)}
          />
        ))}
      </div>

      {filtered?.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="material-symbols-outlined text-5xl text-white/20">search_off</span>
          <p className="font-lexend font-bold uppercase text-white/40">No tribes found</p>
        </div>
      )}

      {!user && (
        <div className="mt-10 p-6 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-lexend font-black uppercase text-lg">Join the Community</p>
            <p className="text-white/40 text-sm font-lexend mt-1">Sign in to join tribes and compete with friends</p>
          </div>
          <NeonButton size="sm">Sign In</NeonButton>
        </div>
      )}
      {/* Create Tribe Modal */}
      {showCreate && (
        <div
          onClick={() => setShowCreate(false)}
          className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-[10px] flex items-end justify-center p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] animate-[fadeUp_0.2s_ease_forwards]"
          >
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-lexend font-black text-sm uppercase tracking-widest text-white/80 mb-4">New Tribe</h3>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tribe name..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-lexend text-sm placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors mb-3"
              />
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-lexend text-white/30">Badge:</span>
                <input
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  maxLength={2}
                  className="w-12 text-center bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white font-lexend text-lg placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-xs font-lexend font-bold text-white/40 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <NeonButton
                  size="sm"
                  disabled={!newName.trim() || createMutation.isPending}
                  onClick={() => createMutation.mutate(newName.trim())}
                >
                  {createMutation.isPending ? 'Creating…' : 'Create Tribe'}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}