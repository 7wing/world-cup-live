import { useParams, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { FriendList } from '@/components/profile/FriendList'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { NeonButton } from '@/components/ui/NeonButton'
import { useProfile, useFriends, useUserPhotos, useSendFriendRequest } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'

function StatBadge({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center md:items-start">
      <span className="flex items-center gap-1.5 text-[10px] font-lexend font-semibold text-white/40 uppercase mb-1">
        <span className="material-symbols-outlined text-xs">{icon}</span>
        {label}
      </span>
      <span className="font-lexend font-black text-xl text-white">{value}</span>
    </div>
  )
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser, loading: authLoading } = useAuthStore()
  const navigate = useNavigate()
  const { data: profile, isLoading: profileLoading, error } = useProfile(userId!)
  const { data: friends } = useFriends(userId!)
  const { data: photos } = useUserPhotos(userId!)
  const { mutate: sendRequest, isPending: sendingRequest } = useSendFriendRequest()
  const isOwn = currentUser?.id === userId
  const setSettingsOpen = useSettingsStore((s) => s.setOpen)

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
        <p className="text-red-400 font-lexend text-sm">
          Failed to load profile: {(error as Error).message}
        </p>
      </PageWrapper>
    )

  if (!profile)
    return (
      <PageWrapper>
        <p className="text-white/40">User not found.</p>
      </PageWrapper>
    )

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-6">
          <GlassCard className="p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-primary-container active-glow">
                <Avatar
                  src={profile.avatar_url}
                  username={profile.username}
                  size="lg"
                  className="w-full h-full"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary font-lexend font-semibold px-3 py-1 rounded-sm text-xs uppercase">
                {profile.tier}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="font-lexend font-black text-4xl uppercase text-white">
                  {profile.username.toUpperCase()}
                </h1>
                {isOwn && (
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 text-white/50 hover:text-primary-container hover:border-primary-container/40 hover:bg-primary-container/10 transition-colors shrink-0"
                    aria-label="Open settings"
                  >
                    <span className="material-symbols-outlined text-xl">settings</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <StatBadge
                  label="Global Rank"
                  value={`#${profile.global_rank ?? '—'}`}
                  icon="leaderboard"
                />
                <StatBadge
                  label="Total XP"
                  value={profile.xp.toLocaleString()}
                  icon="bolt"
                />
              </div>

              {!isOwn && currentUser && (
                <div className="mt-5 flex gap-3 justify-center md:justify-start">
                  <NeonButton
                    size="sm"
                    disabled={sendingRequest}
                    onClick={() => sendRequest({ userId: currentUser.id, friendId: userId! })}
                  >
                    Add Friend
                  </NeonButton>
                  <NeonButton
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/messages/${userId}`)}
                  >
                    Message
                  </NeonButton>
                </div>
              )}
            </div>
          </GlassCard>

          {photos && photos.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="font-lexend font-bold uppercase mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">photo_library</span>
                Photos Posted
                <span className="ml-auto text-xs text-white/30 font-lexend">{photos.length} posts</span>
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {photos.slice(0, 9).map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
                    <img
                      src={photo.image_url}
                      alt={photo.caption ?? ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="flex gap-3">
            <a
              href="/fan-zone"
              className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-primary-container/20 bg-primary-container/5 hover:bg-primary-container/10 transition-colors"
            >
              <span className="material-symbols-outlined text-primary-container text-2xl">live_tv</span>
              <div>
                <p className="font-lexend font-black uppercase text-xs text-primary-container">Fan Zone</p>
                <p className="text-[10px] text-white/40 font-lexend mt-0.5">Social feed · Watch parties · Badges</p>
              </div>
              <span className="material-symbols-outlined text-white/20 text-base ml-auto">arrow_forward</span>
            </a>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-6">
          {isOwn ? (
            <GlassCard className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container text-2xl">group</span>
                <div>
                  <p className="font-lexend font-bold uppercase text-sm">Your Friends</p>
                  <p className="text-[11px] text-white/40 font-lexend">{friends?.length ?? 0} connections</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${profile.id}/friends`)}
                className="text-primary-container font-lexend font-semibold uppercase text-xs flex items-center gap-1 hover:text-green-300 transition-colors"
              >
                View All
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </GlassCard>
          ) : (
            <FriendList friends={friends ?? []} />
          )}

          {!isOwn && (
            <GlassCard className="p-6">
              <h3 className="font-lexend font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-lg">emoji_events</span>
                Achievements
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Correct Predictions', value: '—', icon: 'check_circle' },
                  { label: 'Badges Earned', value: '—', icon: 'military_tech' },
                  { label: 'Tribes Joined', value: '—', icon: 'shield' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-white/30 text-base">{icon}</span>
                      <span className="font-lexend text-sm text-white/60 uppercase font-semibold">{label}</span>
                    </div>
                    <span className="font-lexend font-black text-lg text-primary-container">{value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </aside>
      </div>
    </PageWrapper>
  )
}