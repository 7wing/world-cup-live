// src/pages/fanzone/FanZonePage.tsx
// Phase 6: no mock data. All posts from Supabase via usePosts/useCreatePost/useToggleLike.

import { useState }          from 'react'
import { useNavigate }       from 'react-router-dom'
import { LiveDot }           from '@/components/ui/ui'
import { PostCard }          from '@/components/fanzone/PostCard'
import { PostComposer }      from '@/components/fanzone/PostComposer'
import { FeedFilter }        from '@/components/fanzone/FeedFilter'
import { WatchPartiesSidebar } from '@/components/fanzone/WatchPartiesSidebar'
import { TribesSidebar }     from '@/components/fanzone/TribesSidebar'
import { usePosts, useCreatePost, useToggleLike } from '@/hooks/usePosts'
import { useAuthStore }      from '@/store/authStore'
import { getEffectiveUser }  from '@/lib/guestUser'
import type { Post }         from '@/types'

// Hashtags are static display content — not from DB
const HASHTAGS = ['#GoldenBoot26', '#WC2026', '#JogaBonito', '#FinalSamba', '#VAROut', '#BRAGED']

type FilterOption = 'All' | 'Trending' | 'Following'

function filterPosts(posts: Post[], filter: FilterOption): Post[] {
  if (filter === 'Trending')  return [...posts].sort((a, b) => b.likes - a.likes)
  if (filter === 'Following') return posts.filter(p => !p.is_official)
  return posts
}

export function FanZonePage() {
  const navigate      = useNavigate()
  const { user }      = useAuthStore()
  const effective     = getEffectiveUser(user)
  const [filter, setFilter]           = useState<FilterOption>('All')
  const [showComposer, setShowComposer] = useState(false)

  const { data: posts = [], isLoading } = usePosts()
  const { mutate: createPost }          = useCreatePost()
  const { mutate: toggleLike }          = useToggleLike()

  const handleLike = (postId: string) => {
    if (!effective) return
    const post   = posts.find(p => p.id === postId)
    const liked  = !(post?.liked ?? false)
    toggleLike({ postId, userId: effective.id, liked })
  }

  const handlePost = (content: string) => {
    if (!effective) return
    createPost({
      user_id:    effective.id,
      content,
      media_url:  null,
      media_type: null,
      match_id:   null,
    })
    setShowComposer(false)
  }

  const displayed = filterPosts(posts, filter)

  return (
    <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-24">
      {/* Page heading */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <LiveDot />
        <span className="text-[11px] font-lexend font-black text-primary-container uppercase tracking-widest">
          Live Matchday Hub
        </span>
      </div>
      <h1 className="font-lexend font-black text-5xl uppercase italic leading-none mb-7">
        Fan Zone
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── Feed column ── */}
        <div className="flex flex-col gap-4">
          {/* Hashtag pills */}
          <div className="flex flex-wrap gap-2">
            {HASHTAGS.map(tag => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-lexend font-black text-primary-container border border-outline-variant bg-primary-container/10 cursor-pointer hover:bg-primary-container/20 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex items-center justify-between">
            <FeedFilter active={filter} onChange={setFilter} />
            <span className="text-[10px] font-lexend text-white/25 uppercase tracking-widest">
              {displayed.length} posts
            </span>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card h-32 rounded-xl animate-pulse" />
              ))}
            </>
          )}

          {/* Posts */}
          {!isLoading && displayed.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}

          {/* Empty state */}
          {!isLoading && displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="material-symbols-outlined text-5xl text-white/20">forum</span>
              <p className="font-lexend font-bold uppercase text-white/40 text-sm">
                No posts yet — be the first!
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="flex flex-col gap-4 sticky top-[68px]">
          <WatchPartiesSidebar />
          <TribesSidebar />
        </aside>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowComposer(true)}
        className="fixed bottom-7 right-7 w-[54px] h-[54px] rounded-full bg-primary-container border-none text-2xl flex items-center justify-center font-black text-on-primary z-[100] cursor-pointer transition-transform hover:scale-110 shadow-[0_0_24px_rgba(0,255,65,0.35)] hover:shadow-[0_0_36px_rgba(0,255,65,0.5)]"
      >
        +
      </button>

      {/* Composer modal */}
      {showComposer && (
        <div
          onClick={() => setShowComposer(false)}
          className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-[10px] flex items-end justify-center p-5"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[560px] animate-[fadeUp_0.2s_ease_forwards]"
          >
            <PostComposer onPost={handlePost} autoFocus />
          </div>
        </div>
      )}
    </div>
  )
}