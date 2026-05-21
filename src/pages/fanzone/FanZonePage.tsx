import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PostComposer } from '@/components/fanzone/PostComposer'
import { PostCard } from '@/components/fanzone/PostCard'
import { FAB } from '@/components/layout/FAB'
import { usePosts, useToggleLike } from '@/hooks/usePosts'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'

// ── Types ─────────────────────────────────────────────────────────────────────
type FeedFilter = 'all' | 'trending' | 'following'

const HASHTAGS = ['#GoldenBoot26', '#WC2026', '#JogaBonito', '#FinalSamba', '#VAROut']

// ── Mock social feed (aggregated from X/TikTok/Instagram) ────────────────────
const SOCIAL_FEED = [
  {
    id: 's1',
    platform: 'x',
    handle: '@fifaworldcup',
    avatar: '🌍',
    text: 'WHAT. A. GOAL. Vinicius Jr. with an absolute screamer in the 82nd minute. #WC2026 #Brazil',
    time: '2m ago',
    likes: 48200,
    verified: true,
  },
  {
    id: 's2',
    platform: 'tiktok',
    handle: '@footballdaily',
    avatar: '🎬',
    text: 'The crowd noise right now at SoFi Stadium is UNREAL 🔥 Watch party vibes on another level #WC2026',
    time: '5m ago',
    likes: 12800,
    verified: false,
  },
  {
    id: 's3',
    platform: 'instagram',
    handle: '@brfootball',
    avatar: '📸',
    text: 'Rodrygo & Vinicius Jr. have been UNSTOPPABLE tonight. Brazil putting on a show for the ages. 🇧🇷',
    time: '8m ago',
    likes: 31500,
    verified: true,
  },
  {
    id: 's4',
    platform: 'x',
    handle: '@goal',
    avatar: '⚽',
    text: 'Germany pushing for an equaliser but Brazil\'s defensive block looks impenetrable. Militão is a wall. #BRAGED',
    time: '11m ago',
    likes: 8900,
    verified: true,
  },
]

// ── Mock badge data ───────────────────────────────────────────────────────────
const AVAILABLE_BADGES = [
  { id: 'early_bird',   icon: '🌅', label: 'Early Bird',     desc: 'Logged in on Day 1',        earned: true  },
  { id: 'predictor',   icon: '🔮', label: 'Oracle',          desc: '5 correct predictions',     earned: true  },
  { id: 'streak_7',    icon: '🔥', label: '7-Day Streak',    desc: 'Check in 7 days in a row',  earned: false },
  { id: 'top_tribe',   icon: '🏆', label: 'Tribe Champion',  desc: 'Finish #1 in your tribe',   earned: false },
  { id: 'potm_voter',  icon: '🗳️', label: 'Fan Voice',       desc: 'Vote in 10 POTM polls',     earned: true  },
  { id: 'hatrick',     icon: '⚽', label: 'Hat-trick',       desc: '3 correct exact scores',    earned: false },
]

// ── Mock watch parties ────────────────────────────────────────────────────────
const WATCH_PARTIES = [
  { id: 'wp1', name: 'Brazil HQ',      host: 'Samba Kings Tribe', viewers: 1204, live: true  },
  { id: 'wp2', name: 'Das Finale Room',host: 'Die Mannschaft',    viewers: 876,  live: true  },
  { id: 'wp3', name: 'Neutral Ground', host: 'WC2026 Official',   viewers: 3401, live: true  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, string> = { x: 'X', tiktok: '♪', instagram: '▣' }
  const colors: Record<string, string> = {
    x: 'text-white/60',
    tiktok: 'text-pink-400',
    instagram: 'text-orange-400',
  }
  return (
    <span className={`text-[10px] font-black ${colors[platform] ?? 'text-white/40'}`}>
      {icons[platform] ?? '?'}
    </span>
  )
}

function SocialCard({ post }: { post: typeof SOCIAL_FEED[0] }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 text-base leading-none">
        {post.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-lexend font-bold text-[11px] text-white/70">{post.handle}</span>
          {post.verified && (
            <span className="material-symbols-outlined text-[11px] text-primary-container">verified</span>
          )}
          <PlatformIcon platform={post.platform} />
          <span className="text-[10px] text-white/20 ml-auto flex-shrink-0">{post.time}</span>
        </div>
        <p className="text-xs font-lexend text-white/50 leading-relaxed line-clamp-2">{post.text}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="material-symbols-outlined text-[12px] text-white/15">favorite</span>
          <span className="text-[10px] font-lexend text-white/20">{post.likes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function SocialAggregator() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Social Buzz</p>
        </div>
        <div className="flex gap-2 text-[9px] font-black">
          <span className="text-white/30">X</span>
          <span className="text-pink-400/60">TikTok</span>
          <span className="text-orange-400/60">IG</span>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {SOCIAL_FEED.map((post) => <SocialCard key={post.id} post={post} />)}
      </div>
      <div className="px-4 py-2.5 border-t border-white/5">
        <p className="text-[9px] font-lexend text-white/15 text-center uppercase tracking-widest">
          Aggregated from official tournament feeds
        </p>
      </div>
    </GlassCard>
  )
}

function WatchPartyCard() {
  const [joined, setJoined] = useState<string | null>(null)

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px] text-primary-container">live_tv</span>
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Watch Parties</p>
      </div>
      <div className="divide-y divide-white/5">
        {WATCH_PARTIES.map((party) => (
          <div key={party.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="font-lexend font-bold text-xs text-white/70 truncate">{party.name}</p>
              <p className="text-[10px] font-lexend text-white/25 truncate">{party.host}</p>
            </div>
            <div className="flex items-center gap-1 mr-2">
              <span className="material-symbols-outlined text-[11px] text-white/20">person</span>
              <span className="text-[10px] font-lexend text-white/20">{party.viewers.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setJoined(party.id)}
              className={`px-3 py-1 rounded-full text-[10px] font-lexend font-black uppercase tracking-widest transition-colors flex-shrink-0 ${
                joined === party.id
                  ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                  : 'bg-white/5 text-white/30 border border-white/10 hover:bg-white/10'
              }`}
            >
              {joined === party.id ? 'Joined ✓' : 'Join'}
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function BadgeShelf() {
  const [hovered, setHovered] = useState<string | null>(null)
  const earned = AVAILABLE_BADGES.filter((b) => b.earned)
  const locked = AVAILABLE_BADGES.filter((b) => !b.earned)

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-primary-container">military_tech</span>
          <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Your Badges</p>
        </div>
        <span className="text-[10px] font-lexend text-primary-container font-bold">{earned.length}/{AVAILABLE_BADGES.length}</span>
      </div>
      <div className="p-4">
        {/* Earned */}
        <p className="text-[9px] font-lexend font-bold uppercase tracking-widest text-white/20 mb-2">Earned</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {earned.map((badge) => (
            <div
              key={badge.id}
              className="relative"
              onMouseEnter={() => setHovered(badge.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/25 flex items-center justify-center text-2xl cursor-default">
                {badge.icon}
              </div>
              {hovered === badge.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-surface-container-high border border-white/10 rounded-lg px-2 py-1.5 z-10 pointer-events-none">
                  <p className="font-lexend font-bold text-[10px] text-white text-center">{badge.label}</p>
                  <p className="font-lexend text-[9px] text-white/30 text-center leading-tight">{badge.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Locked */}
        <p className="text-[9px] font-lexend font-bold uppercase tracking-widest text-white/20 mb-2">Locked</p>
        <div className="flex gap-2 flex-wrap">
          {locked.map((badge) => (
            <div
              key={badge.id}
              className="relative"
              onMouseEnter={() => setHovered(badge.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-12 h-12 rounded-xl bg-white/3 border border-white/8 flex items-center justify-center text-2xl cursor-default opacity-30 grayscale">
                {badge.icon}
              </div>
              {hovered === badge.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-surface-container-high border border-white/10 rounded-lg px-2 py-1.5 z-10 pointer-events-none">
                  <p className="font-lexend font-bold text-[10px] text-white/50 text-center">{badge.label}</p>
                  <p className="font-lexend text-[9px] text-white/25 text-center leading-tight">{badge.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

function DailyCheckIn() {
  const [checked, setChecked] = useState(false)
  const streak = 4

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container/10 border border-primary-container/25 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-primary-container">
            {checked ? 'check_circle' : 'today'}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-lexend font-bold text-xs text-white/70">Daily Check-in</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-sm">🔥</span>
            <span className="text-[10px] font-lexend font-bold text-primary-container">{streak} day streak</span>
          </div>
        </div>
        <button
          onClick={() => setChecked(true)}
          disabled={checked}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-lexend font-black uppercase tracking-widest transition-colors ${
            checked
              ? 'bg-primary-container/10 text-primary-container/40 border border-primary-container/10 cursor-default'
              : 'bg-primary-container/20 text-primary-container border border-primary-container/30 hover:bg-primary-container/30'
          }`}
        >
          {checked ? '+10 pts ✓' : 'Check In'}
        </button>
      </div>
    </GlassCard>
  )
}

// ── Feed filter bar ───────────────────────────────────────────────────────────
function FeedFilterBar({ active, onChange }: { active: FeedFilter; onChange: (f: FeedFilter) => void }) {
  const filters: { id: FeedFilter; label: string }[] = [
    { id: 'all',       label: 'All'       },
    { id: 'trending',  label: 'Trending'  },
    { id: 'following', label: 'Following' },
  ]
  return (
    <div className="flex gap-1 bg-white/3 rounded-full p-0.5 border border-white/8 self-start">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-4 py-1.5 rounded-full text-[11px] font-lexend font-bold uppercase tracking-widest transition-colors ${
            active === f.id
              ? 'bg-primary-container/20 text-primary-container'
              : 'text-white/30 hover:text-white/50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function FanZonePage() {
  const { data: posts, isLoading } = usePosts()
  const { mutate: toggleLike } = useToggleLike()
  const { user } = useAuthStore()
  const [showComposer, setShowComposer] = useState(false)
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')

  const handleLike = (postId: string) => {
    if (!user) return
    toggleLike({ postId, userId: user.id, liked: true })
  }

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: main feed ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Daily check-in banner */}
          <DailyCheckIn />

          {/* Composer */}
          <PostComposer />

          {/* Hashtag pills */}
          <div className="flex flex-wrap gap-2">
            {HASHTAGS.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 glass-card rounded-full text-xs font-lexend font-semibold text-primary-container border border-primary-container/30 cursor-pointer hover:bg-primary-container/10 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Feed filter */}
          <div className="flex items-center justify-between">
            <FeedFilterBar active={feedFilter} onChange={setFeedFilter} />
            <span className="text-[10px] font-lexend text-white/20 uppercase tracking-widest">
              {posts?.length ?? 0} posts
            </span>
          </div>

          {/* Skeleton */}
          {isLoading && [1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-48 rounded-xl animate-pulse" />
          ))}

          {/* Post cards */}
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>

        {/* ── Right sidebar ── */}
        <aside className="lg:col-span-4 space-y-5">

          {/* Badges */}
          <BadgeShelf />

          {/* Watch Parties */}
          <WatchPartyCard />

          {/* Social Aggregator */}
          <SocialAggregator />

          {/* Tribes CTA */}
          <GlassCard className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary-container">shield</span>
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Tribes</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { flag: '🇧🇷', name: 'Samba Kings',    members: 4821, pts: 12840 },
                { flag: '🇩🇪', name: 'Die Mannschaft', members: 3190, pts: 11205 },
                { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'The Lions',      members: 2850, pts: 9800  },
              ].map((tribe, i) => (
                <div key={tribe.name} className="flex items-center gap-2.5">
                  <span className="text-[10px] font-lexend font-black text-white/20 w-4">{i + 1}</span>
                  <span className="text-base leading-none">{tribe.flag}</span>
                  <span className="font-lexend font-bold text-xs text-white/60 flex-1 truncate">{tribe.name}</span>
                  <span className="font-lexend font-black text-sm text-primary-container">{tribe.pts.toLocaleString()}</span>
                </div>
              ))}
              <Link
                to="/fan-zone/tribes"
                className="block text-center text-[10px] font-lexend font-black text-primary-container uppercase tracking-widest hover:underline mt-1"
              >
                View all tribes →
              </Link>
            </div>
          </GlassCard>

          {/* Games CTA */}
          <GlassCard className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary-container">psychology</span>
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/20">Fan Games</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-lexend text-white/30 leading-relaxed mb-3">
                Trivia, duels, and Oracle predictions — earn points every match day.
              </p>
              <Link
                to="/fan-zone/games"
                className="block w-full py-2 text-center rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary-container font-lexend font-black text-[10px] uppercase tracking-widest hover:bg-primary-container/25 transition-colors"
              >
                Play Now →
              </Link>
            </div>
          </GlassCard>

        </aside>
      </div>

      {/* ── FAB ── */}
      <FAB icon="add" onClick={() => setShowComposer(true)} label="New post" />

      {showComposer && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={() => setShowComposer(false)}
        >
          <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <PostComposer />
          </div>
        </div>
      )}
    </PageWrapper>
  )
}