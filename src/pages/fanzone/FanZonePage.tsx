import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PostComposer } from '@/components/fanzone/PostComposer'
import { PostCard } from '@/components/fanzone/PostCard'
import { FAB } from '@/components/layout/FAB'
import { usePosts, useToggleLike } from '@/hooks/usePosts'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'

const HASHTAGS = ['#GoldenBoot26', '#WC2026', '#JogaBonito', '#FinalSamba', '#VAROut']

export function FanZonePage() {
  const { data: posts, isLoading } = usePosts()
  const { mutate: toggleLike } = useToggleLike()
  const { user } = useAuthStore()
  const [showComposer, setShowComposer] = useState(false)

  const handleLike = (postId: string) => {
    if (!user) return
    // optimistically assume not liked; a proper implementation tracks liked state
    toggleLike({ postId, userId: user.id, liked: true })
  }

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <PostComposer />

          <div className="flex flex-wrap gap-2">
            {HASHTAGS.map((tag) => (
              <span key={tag} className="px-4 py-2 glass-card rounded-full text-xs font-lexend font-semibold text-primary-container border border-primary-container/30 cursor-pointer hover:bg-primary-container/10">
                {tag}
              </span>
            ))}
          </div>

          {isLoading && [1,2,3].map((i) => <div key={i} className="glass-card h-48 rounded-xl animate-pulse" />)}

          {posts?.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6">
            <h3 className="font-lexend font-bold uppercase mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">group</span>
              Tribes
            </h3>
            <Link to="/fan-zone/tribes" className="text-primary-container font-lexend text-sm font-semibold uppercase hover:underline">
              View all tribes →
            </Link>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="font-lexend font-bold uppercase mb-4">Games</h3>
            <Link to="/fan-zone/games" className="text-primary-container font-lexend text-sm font-semibold uppercase hover:underline">
              Trivia · Duels · Oracle →
            </Link>
          </GlassCard>
        </aside>
      </div>

      <FAB icon="add" onClick={() => setShowComposer(true)} label="New post" />

      {showComposer && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setShowComposer(false)}>
          <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <PostComposer />
          </div>
        </div>
      )}
    </PageWrapper>
  )
}