import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { FriendList } from '@/components/profile/FriendList'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { NeonButton } from '@/components/ui/NeonButton'
import { useProfile, useFriends, useUserPhotos } from '@/hooks/useProfile'
import { useAuthStore } from '@/store/authStore'

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuthStore()
  const { data: profile, isLoading } = useProfile(userId!)
  const { data: friends } = useFriends(userId!)
  const { data: photos } = useUserPhotos(userId!)
  const isOwn = currentUser?.id === userId

  if (isLoading) return <PageWrapper><div className="glass-card h-48 rounded-xl animate-pulse" /></PageWrapper>
  if (!profile) return <PageWrapper><p className="text-white/40">User not found.</p></PageWrapper>

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-6">
          <GlassCard className="p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-primary-container active-glow">
                <Avatar src={profile.avatar_url} username={profile.username} size="lg" className="w-full h-full" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary font-lexend font-semibold px-3 py-1 rounded-sm text-xs uppercase">
                {profile.tier}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-lexend font-black text-4xl uppercase text-white mb-2">{profile.username.toUpperCase()}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                  <span className="block text-xs font-lexend text-white/40 uppercase">Global Rank</span>
                  <span className="font-lexend font-black text-2xl text-primary-container">#{profile.global_rank ?? '—'}</span>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                  <span className="block text-xs font-lexend text-white/40 uppercase">Total XP</span>
                  <span className="font-lexend font-black text-2xl">{profile.xp.toLocaleString()}</span>
                </div>
              </div>
              {!isOwn && (
                <div className="mt-4 flex gap-3">
                  <NeonButton size="sm">Add Friend</NeonButton>
                  <NeonButton variant="outline" size="sm">Message</NeonButton>
                </div>
              )}
            </div>
          </GlassCard>

          {photos && photos.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="font-lexend font-bold uppercase mb-4">Photos Posted</h2>
              <div className="grid grid-cols-3 gap-3">
                {photos.slice(0, 9).map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                    <img src={photo.image_url} alt={photo.caption ?? ''} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </section>

        <aside className="lg:col-span-4">
          <FriendList friends={friends ?? []} />
        </aside>
      </div>
    </PageWrapper>
  )
}