import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { NeonButton } from '@/components/ui/NeonButton'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { fetchAllUsers } from '@/api/profile'
import { useSendFriendRequest } from '@/hooks/useProfile'
import { cn } from '@/utils/cn'

const TIER_BADGES: Record<string, { label: string; color: string }> = {
  fan:  { label: 'Fan',      color: 'text-white/50' },
  elite:{ label: 'Elite',    color: 'text-blue-400' },
  pro:  { label: 'Pro',      color: 'text-purple-400' },
  mvp:  { label: 'MVP',      color: 'text-primary-container' },
}

export function DiscoverPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => fetchAllUsers(user?.id),
    enabled: true,
  })

  const { mutate: sendRequest, isPending: sendingMap } = useSendFriendRequest(user?.id ?? '')

  const filtered = allUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-lexend font-black text-4xl uppercase italic">Discover Players</h1>
      </div>

      {/* ── Search ── */}
      <GlassCard className="p-4 mb-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl font-lexend text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors"
          />
        </div>
      </GlassCard>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-1 border border-white/5">
          <span className="material-symbols-outlined text-primary-container text-xl">group</span>
          <span className="font-lexend font-black text-2xl">{allUsers.length}</span>
          <span className="text-[10px] text-white/40 uppercase font-lexend font-semibold">
            Players Online
          </span>
        </div>
        <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-1 border border-white/5">
          <span className="material-symbols-outlined text-primary-container text-xl">emoji_events</span>
          <span className="font-lexend font-black text-2xl">#{allUsers[0]?.global_rank ?? '—'}</span>
          <span className="text-[10px] text-white/40 uppercase font-lexend font-semibold">
            Top Rank
          </span>
        </div>
        <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-1 border border-white/5">
          <span className="material-symbols-outlined text-primary-container text-xl">bolt</span>
          <span className="font-lexend font-black text-2xl">
            {allUsers.length > 0 ? allUsers.reduce((s, u) => s + u.xp, 0).toLocaleString() : 0}
          </span>
          <span className="text-[10px] text-white/40 uppercase font-lexend font-semibold">
            Total XP
          </span>
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card h-28 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-white/20">person_search</span>
          <p className="font-lexend font-bold uppercase text-white/40">
            {search ? 'No players found' : 'No players yet'}
          </p>
        </div>
      )}

      {/* ── User grid ── */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((player) => {
            const badge = TIER_BADGES[player.tier] ?? TIER_BADGES.fan
            const isSending = sendingMap

            return (
              <GlassCard
                key={player.id}
                className={cn(
                  'p-5 flex flex-col gap-4 hover:border-white/20 transition-colors',
                  player.tier === 'mvp' && 'border-primary-container/30'
                )}
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={player.avatar_url}
                    username={player.username}
                    size="lg"
                    className="w-14 h-14"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-lexend font-black uppercase text-sm truncate">
                      {player.username}
                    </p>
                    <p className={cn('text-[11px] font-lexend uppercase font-semibold mt-0.5', badge.color)}>
                      {badge.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="font-lexend font-black text-lg text-primary-container">
                        {player.global_rank ? `#${player.global_rank}` : '—'}
                      </p>
                      <p className="text-[9px] text-white/30 uppercase font-lexend font-semibold">Rank</p>
                    </div>
                    <div className="text-center">
                      <p className="font-lexend font-black text-lg">
                        {player.xp.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-white/30 uppercase font-lexend font-semibold">XP</p>
                    </div>
                  </div>

                  {user && player.id !== user.id && (
                    <NeonButton
                      size="sm"
                      variant="outline"
                      disabled={isSending}
                      onClick={() => sendRequest({ userId: user.id, friendId: player.id })}
                    >
                      <span className="material-symbols-outlined text-base">person_add</span>
                      Add
                    </NeonButton>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}