import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { FriendList } from '@/components/profile/FriendList'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { useFriends } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

// ── Mock challenge leaderboard for friends (mini-league) ─────────────────────
// In production wire this to a real supabase query:
// supabase.from('friend_leagues').select('*').eq('owner_id', userId)
const MINI_LEAGUE_MOCK = [
  { rank: 1, username: 'YourFriend01', xp: 8240, tier: 'pro', isOnline: true },
  { rank: 2, username: 'CousinLuka', xp: 6100, tier: 'elite', isOnline: false },
  { rank: 3, username: 'OfficeRival', xp: 5500, tier: 'elite', isOnline: true },
]

// ── Friend Challenge Leaderboard ──────────────────────────────────────────────
function FriendLeague() {
  const [invited, setInvited] = useState(false)
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary-container">emoji_events</span>
        <h3 className="font-lexend font-black uppercase text-lg">Challenger League</h3>
        <span className="ml-auto text-[10px] bg-primary-container/20 text-primary-container px-2 py-0.5 rounded-full border border-primary-container/30 font-lexend font-bold uppercase">
          This Week
        </span>
      </div>

      <div className="space-y-2 mb-5">
        {MINI_LEAGUE_MOCK.map((entry) => (
          <div
            key={entry.username}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-colors',
              entry.rank === 1
                ? 'bg-primary-container/10 border-primary-container/30'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
            )}
          >
            <span
              className={cn(
                'font-lexend font-black text-lg w-6 text-center',
                entry.rank === 1 ? 'text-primary-container' : 'text-white/30'
              )}
            >
              {entry.rank}
            </span>

            {/* Avatar placeholder with online dot */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center">
                <span className="font-lexend font-black text-xs text-white/60">
                  {entry.username.slice(0, 2).toUpperCase()}
                </span>
              </div>
              {entry.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary-container border-2 border-surface-container-lowest" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-lexend font-bold uppercase text-sm truncate">{entry.username}</p>
              <p className="text-[10px] text-white/30 font-lexend uppercase">{entry.tier}</p>
            </div>

            <span
              className={cn(
                'font-lexend font-black text-base',
                entry.rank === 1 ? 'text-primary-container' : 'text-white/70'
              )}
            >
              {entry.xp.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <NeonButton
        variant="outline"
        size="sm"
        className="w-full justify-center"
        disabled={invited}
        onClick={() => setInvited(true)}
      >
        {invited ? 'Invite Sent ✓' : 'Invite Friends to League'}
      </NeonButton>
    </GlassCard>
  )
}

// ── Friend Search / Invite ────────────────────────────────────────────────────
function FindFriends() {
  const [query, setQuery] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <GlassCard className="p-6">
      <h3 className="font-lexend font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-lg">
          person_search
        </span>
        Find Friends
      </h3>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-base">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-lexend text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors"
          />
        </div>
        <NeonButton
          size="sm"
          disabled={!query.trim() || sent}
          onClick={() => setSent(true)}
        >
          {sent ? '✓' : 'Search'}
        </NeonButton>
      </div>
      {sent && (
        <p className="mt-3 text-xs text-primary-container font-lexend font-semibold uppercase">
          Friend request sent!
        </p>
      )}
    </GlassCard>
  )
}

// ── Stat Summary Banner ───────────────────────────────────────────────────────
function FriendStats({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: 'Friends', value: count, icon: 'group' },
        { label: 'Online Now', value: MINI_LEAGUE_MOCK.filter((f) => f.isOnline).length, icon: 'wifi' },
        { label: 'In League', value: MINI_LEAGUE_MOCK.length, icon: 'shield' },
      ].map(({ label, value, icon }) => (
        <div
          key={label}
          className="glass-card rounded-xl p-4 flex flex-col items-center gap-1 border border-white/5"
        >
          <span className="material-symbols-outlined text-primary-container text-xl">{icon}</span>
          <span className="font-lexend font-black text-2xl">{value}</span>
          <span className="text-[10px] text-white/40 uppercase font-lexend font-semibold">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function FriendsPage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuthStore()
  const navigate = useNavigate()
  const { data: friends, isLoading } = useFriends(userId!)
  const isOwn = currentUser?.id === userId

  return (
    <PageWrapper>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-lexend font-black text-4xl uppercase italic">Friends</h1>
        {isOwn && (
          <NeonButton size="sm" onClick={() => navigate('/discover')}>
            <span className="material-symbols-outlined text-base">person_add</span>
            Discover Players
          </NeonButton>
        )}
      </div>

      {/* ── Stats Row ── */}
      <FriendStats count={friends?.length ?? 0} />

      {/* ── Main content: Friends List + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Friends List */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <div className="glass-card h-64 rounded-xl animate-pulse" />
          ) : friends && friends.length > 0 ? (
            <FriendList friends={friends} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center glass-card rounded-xl border border-white/5">
              <span className="material-symbols-outlined text-6xl text-white/20">group</span>
              <p className="font-lexend font-bold uppercase text-white/40">No friends yet</p>
              <p className="text-sm text-white/20 font-lexend max-w-xs">
                Join tribes and compete in leagues to connect with fellow fans
              </p>
              {isOwn && (
                <NeonButton size="sm" onClick={() => navigate('/tribes')}>
                  Browse Tribes
                </NeonButton>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-5 space-y-5">
          {isOwn && <FindFriends />}
          <FriendLeague />
        </aside>
      </div>
    </PageWrapper>
  )
}