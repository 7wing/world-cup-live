import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { FriendList } from '@/components/profile/FriendList'
import { BadgeGrid } from '@/components/profile/BadgeGrid'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { NeonButton } from '@/components/ui/NeonButton'
import {
  useProfile,
  useFriends,
  useUserPhotos,
  useUserBadges,
  usePredictionHistory,
  useSubmitPrediction,
  useDeletePrediction,
  useSendFriendRequest,
  useUpdateProfile,
  useUploadAvatar,
} from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import type { Prediction } from '@/types'

// ── Tier colours ──────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
  fan: 'from-white/20 to-white/5',
  elite: 'from-blue-400/30 to-blue-600/10',
  pro: 'from-purple-400/30 to-purple-600/10',
  mvp: 'from-primary-container/30 to-primary-container/5',
}

type Tab = 'overview' | 'badges' | 'predictions' | 'photos'

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({
  username,
  avatarUrl,
  userId,
  onClose,
}: {
  username: string
  avatarUrl: string | null
  userId: string
  onClose: () => void
}) {
  const [name, setName] = useState(username)
  const fileRef = useRef<HTMLInputElement>(null)
  const { mutate: updateProfile, isPending: saving } = useUpdateProfile(userId)
  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar(userId)
  const busy = saving || uploading

  function handleSave() {
    if (name.trim() && name !== username) {
      updateProfile({ username: name.trim() })
    }
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadAvatar(file)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <GlassCard
        className="w-full max-w-sm p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-lexend font-black uppercase text-lg">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary-container/50 hover:border-primary-container transition-colors group"
          >
            <Avatar src={avatarUrl} username={username} size="lg" className="w-full h-full" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container animate-spin text-2xl">
                  progress_activity
                </span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-[10px] text-white/30 font-lexend">Tap to change avatar</p>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-lexend font-semibold uppercase text-white/40 tracking-wider">
            Username
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-lexend text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors"
          />
        </div>

        <NeonButton className="w-full justify-center" disabled={busy} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Changes'}
        </NeonButton>
      </GlassCard>
    </div>
  )
}

// ── Prediction row ────────────────────────────────────────────────────────────
function PredictionRow({
  prediction,
  userId,
}: {
  prediction: Prediction & { match?: any }
  userId: string
}) {
  const [editing, setEditing] = useState(false)
  const [home, setHome] = useState(prediction.predicted_home)
  const [away, setAway] = useState(prediction.predicted_away)
  const { mutate: submit, isPending: saving } = useSubmitPrediction(userId)
  const { mutate: remove, isPending: removing } = useDeletePrediction(userId)

  const match = prediction.match
  const kickoff = match?.kickoff_at ? new Date(match.kickoff_at) : null
  const canEdit = kickoff ? kickoff > new Date() : false
  const matchStatus = match?.status ?? 'upcoming'

  const statusColor: Record<string, string> = {
    upcoming: 'text-white/40',
    live: 'text-green-400',
    finished: prediction.is_correct ? 'text-primary-container' : 'text-red-400/70',
  }

  function saveEdit() {
    submit({ user_id: userId, match_id: prediction.match_id, predicted_home: home, predicted_away: away })
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-lexend font-bold text-xs uppercase truncate">
          {match?.home_team?.name ?? '—'} vs {match?.away_team?.name ?? '—'}
        </p>
        <p className={cn('text-[10px] font-lexend uppercase font-semibold mt-0.5', statusColor[matchStatus])}>
          {matchStatus === 'finished'
            ? prediction.is_correct
              ? `✓ Correct · +${prediction.points_earned} pts`
              : '✗ Incorrect'
            : matchStatus === 'live'
            ? 'Live now'
            : kickoff
            ? kickoff.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Upcoming'}
        </p>
      </div>

      {editing ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number" min={0} max={99} value={home}
            onChange={(e) => setHome(Number(e.target.value))}
            className="w-10 text-center bg-white/10 border border-primary-container/40 rounded px-1 py-1 font-lexend font-black text-sm text-primary-container focus:outline-none"
          />
          <span className="text-white/30 font-lexend font-bold text-xs">–</span>
          <input
            type="number" min={0} max={99} value={away}
            onChange={(e) => setAway(Number(e.target.value))}
            className="w-10 text-center bg-white/10 border border-primary-container/40 rounded px-1 py-1 font-lexend font-black text-sm text-primary-container focus:outline-none"
          />
          <button onClick={saveEdit} disabled={saving} className="ml-1 text-primary-container hover:text-green-300 transition-colors">
            <span className="material-symbols-outlined text-base">check_circle</span>
          </button>
          <button onClick={() => setEditing(false)} className="text-white/30 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-base">cancel</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-lexend font-black text-base text-white/80">
            {prediction.predicted_home} – {prediction.predicted_away}
          </span>
          {canEdit && (
            <>
              <button onClick={() => setEditing(true)} className="text-white/20 hover:text-primary-container transition-colors" aria-label="Edit prediction">
                <span className="material-symbols-outlined text-base">edit</span>
              </button>
              <button onClick={() => remove(prediction.id)} disabled={removing} className="text-white/20 hover:text-red-400 transition-colors" aria-label="Delete prediction">
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Predictions tab ───────────────────────────────────────────────────────────
function PredictionsSection({ userId, isOwn }: { userId: string; isOwn: boolean }) {
  const { data: predictions, isLoading } = usePredictionHistory(userId)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all')

  const filtered = (predictions ?? []).filter((p: any) => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return p.match?.status === 'upcoming'
    return p.match?.status === 'finished'
  })

  const correct = (predictions ?? []).filter((p: any) => p.is_correct).length
  const total = (predictions ?? []).filter((p: any) => p.is_correct !== null).length

  if (isLoading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />)}
      </div>
    )

  return (
    <div className="space-y-4">
      {total > 0 && (
        <div className="flex gap-4">
          <div className="px-4 py-2.5 bg-white/5 rounded-lg border border-white/10 text-center">
            <p className="font-lexend font-black text-xl text-primary-container">
              {Math.round((correct / total) * 100)}%
            </p>
            <p className="text-[10px] text-white/40 font-lexend uppercase">Accuracy</p>
          </div>
          <div className="px-4 py-2.5 bg-white/5 rounded-lg border border-white/10 text-center">
            <p className="font-lexend font-black text-xl">{correct}/{total}</p>
            <p className="text-[10px] text-white/40 font-lexend uppercase">Correct</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(['all', 'upcoming', 'finished'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-wide transition-colors border',
              filter === f
                ? 'bg-primary-container/15 border-primary-container/50 text-primary-container'
                : 'border-white/10 text-white/40 hover:text-white/70'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-white/30 font-lexend text-sm text-center py-8">No predictions here.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p: any) => <PredictionRow key={p.id} prediction={p} userId={userId} />)}
        </div>
      )}

      {isOwn && (
        <p className="text-[10px] text-white/30 font-lexend text-center pt-2">
          Upcoming predictions can be edited or deleted before kick-off.
        </p>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser, loading: authLoading } = useAuthStore()
  const navigate = useNavigate()

  const { data: profile, isLoading: profileLoading, error } = useProfile(userId!)
  const { data: friends } = useFriends(userId!)
  const { data: photos } = useUserPhotos(userId!)
  const { data: badges, isLoading: badgesLoading } = useUserBadges(userId!)
  const { mutate: sendRequest, isPending: sendingRequest } = useSendFriendRequest()

  const isOwn = currentUser?.id === userId
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [editOpen, setEditOpen] = useState(false)

  if (authLoading || profileLoading)
    return (
      <PageWrapper>
        <div className="space-y-4">
          <div className="glass-card h-48 rounded-xl animate-pulse" />
          <div className="glass-card h-32 rounded-xl animate-pulse opacity-60" />
        </div>
      </PageWrapper>
    )

  if (error)
    return (
      <PageWrapper>
        <p className="text-red-400 font-lexend text-sm">Failed to load profile: {(error as Error).message}</p>
      </PageWrapper>
    )

  if (!profile)
    return (
      <PageWrapper>
        <p className="text-white/40">User not found.</p>
      </PageWrapper>
    )

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'person' },
    { id: 'badges', label: 'Badges', icon: 'military_tech' },
    { id: 'predictions', label: 'Predictions', icon: 'track_changes' },
    ...(photos && photos.length > 0 ? [{ id: 'photos' as Tab, label: 'Photos', icon: 'photo_library' }] : []),
  ]

  return (
    <PageWrapper>
      {editOpen && isOwn && (
        <EditProfileModal
          username={profile.username}
          avatarUrl={profile.avatar_url}
          userId={profile.id}
          onClose={() => setEditOpen(false)}
        />
      )}

      {/* ── Hero ── */}
      <div
        className={cn(
          'glass-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden mb-6',
          'before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10',
          TIER_COLORS[profile.tier]
        )}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative shrink-0">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border-2 border-primary-container active-glow">
            <Avatar src={profile.avatar_url} username={profile.username} size="lg" className="w-full h-full" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary font-lexend font-semibold px-3 py-1 rounded-sm text-xs uppercase">
            {profile.tier}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <h1 className="font-lexend font-black text-3xl md:text-4xl uppercase text-white">
              {profile.username.toUpperCase()}
            </h1>
            {isOwn && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-white/40 hover:text-primary-container hover:border-primary-container/40 hover:bg-primary-container/10 transition-colors shrink-0"
                aria-label="Edit profile"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <div className="px-4 py-2.5 bg-white/5 rounded-lg border border-white/10 text-center">
              <p className="text-[10px] font-lexend font-semibold text-white/40 uppercase">Global Rank</p>
              <p className="font-lexend font-black text-xl text-primary-container">#{profile.global_rank ?? '—'}</p>
            </div>
            <div className="px-4 py-2.5 bg-white/5 rounded-lg border border-white/10 text-center">
              <p className="text-[10px] font-lexend font-semibold text-white/40 uppercase">Total XP</p>
              <p className="font-lexend font-black text-xl">{profile.xp.toLocaleString()}</p>
            </div>
            <div className="px-4 py-2.5 bg-white/5 rounded-lg border border-white/10 text-center">
              <p className="text-[10px] font-lexend font-semibold text-white/40 uppercase">Badges</p>
              <p className="font-lexend font-black text-xl">
                {badges ? badges.filter((b) => b.is_unlocked).length : '—'}
              </p>
            </div>
          </div>

          {!isOwn && currentUser && (
            <div className="mt-4 flex gap-3 justify-center md:justify-start">
              <NeonButton size="sm" disabled={sendingRequest} onClick={() => sendRequest({ userId: currentUser.id, friendId: userId! })}>
                <span className="material-symbols-outlined text-base">person_add</span>
                Add Friend
              </NeonButton>
              <NeonButton variant="outline" size="sm" onClick={() => navigate(`/messages/${userId}`)}>
                <span className="material-symbols-outlined text-base">chat</span>
                Message
              </NeonButton>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-0.5 mb-6 border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 font-lexend font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-primary-container border-primary-container'
                : 'text-white/40 border-transparent hover:text-white/70'
            )}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            {friends && friends.length > 0 ? (
              <FriendList friends={friends} />
            ) : (
              <GlassCard className="p-8 flex flex-col items-center gap-3 text-center">
                <span className="material-symbols-outlined text-5xl text-white/15">group</span>
                <p className="font-lexend font-bold uppercase text-white/30 text-sm">No friends yet</p>
                {isOwn && <NeonButton size="sm" onClick={() => navigate('/discover')}>Find Players</NeonButton>}
              </GlassCard>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-4">
            {badges && badges.filter((b) => b.is_unlocked).length > 0 && (
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-lexend font-bold uppercase text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container text-base">military_tech</span>
                    Badges
                  </h3>
                  <button
                    onClick={() => setActiveTab('badges')}
                    className="text-primary-container font-lexend font-semibold uppercase text-[10px] flex items-center gap-1 hover:text-green-300 transition-colors"
                  >
                    See all <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
                <BadgeGrid badges={badges.filter((b) => b.is_unlocked).slice(0, 3)} compact />
              </GlassCard>
            )}

            <a
              href="/fan-zone"
              className="flex items-center gap-3 p-4 rounded-xl border border-primary-container/20 bg-primary-container/5 hover:bg-primary-container/10 transition-colors"
            >
              <span className="material-symbols-outlined text-primary-container text-2xl">live_tv</span>
              <div>
                <p className="font-lexend font-black uppercase text-xs text-primary-container">Fan Zone</p>
                <p className="text-[10px] text-white/40 font-lexend mt-0.5">Social feed · Watch parties · Badges</p>
              </div>
              <span className="material-symbols-outlined text-white/20 text-base ml-auto">arrow_forward</span>
            </a>

            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary-container text-base">shield</span>
                <h3 className="font-lexend font-bold uppercase text-sm">Tribe</h3>
              </div>
              {profile.tribe_id ? (
                <button
                  onClick={() => navigate(`/tribes/${profile.tribe_id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/40 text-sm">shield</span>
                  </div>
                  <span className="font-lexend font-bold uppercase text-xs text-white/70">View Tribe</span>
                  <span className="material-symbols-outlined text-white/20 text-sm ml-auto">arrow_forward</span>
                </button>
              ) : (
                <div className="text-center py-2">
                  <p className="text-white/30 font-lexend text-xs mb-3">No tribe yet</p>
                  {isOwn && (
                    <NeonButton size="sm" variant="outline" onClick={() => navigate('/tribes')}>
                      Browse Tribes
                    </NeonButton>
                  )}
                </div>
              )}
            </GlassCard>
          </aside>
        </div>
      )}

      {/* ── Badges ── */}
      {activeTab === 'badges' && (
        <div>
          {badgesLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card aspect-[3/4] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : badges && badges.length > 0 ? (
            <>
              <p className="text-xs text-white/40 font-lexend mb-5">
                {badges.filter((b) => b.is_unlocked).length} of {badges.length} unlocked
              </p>
              <BadgeGrid badges={badges} />
            </>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-white/10">military_tech</span>
              <p className="font-lexend text-white/30 mt-3 uppercase text-sm">No badges yet</p>
            </div>
          )}
        </div>
      )}

      {/* ── Predictions ── */}
      {activeTab === 'predictions' && <PredictionsSection userId={userId!} isOwn={isOwn} />}

      {/* ── Photos ── */}
      {activeTab === 'photos' && photos && photos.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src={photo.image_url}
                alt={photo.caption ?? ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}