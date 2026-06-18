// src/pages/fanzone/FanZonePage.tsx

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LiveDot } from '@/components/ui/LiveDot'
import { FAB } from '@/components/layout/FAB'
import { PostCard } from '@/components/fanzone/PostCard'
import { PostComposer } from '@/components/fanzone/PostComposer'
import { FeedFilter } from '@/components/fanzone/FeedFilter'
import { TrendingHashtags } from '@/components/fanzone/TrendingHashtags'
import { DiscoverWidget } from '@/components/fanzone/DiscoverWidget'
import { usePosts, useCreatePost, useToggleLike, type FeedFilterType } from '@/hooks/usePosts'
import { useAuthStore } from '@/store/authStore'
import { getEffectiveUser } from '@/lib/guestUser'

export function FanZonePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const effective = getEffectiveUser(user)
  const [filter, setFilter] = useState<FeedFilterType>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showComposer, setShowComposer] = useState(false)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts({
    filter,
    search: searchQuery || undefined,
  })
  const { mutate: createPost } = useCreatePost()
  const { mutate: toggleLike } = useToggleLike()

  // Flatten pages into a single post list (already sorted by created_at DESC server-side)
  const posts = data?.pages.flatMap((p) => p.posts) ?? []
  const displayed = posts

  const handleLike = (postId: string) => {
    if (!effective) return
    const post = posts.find((p) => p.id === postId)
    // Pass CURRENT liked state — togglePostLike() and the mutation's optimistic
    // update will handle the flip correctly.
    toggleLike({ postId, userId: effective.id, liked: post?.liked ?? false })
  }

  // Signature now matches PostComposer: (content, mediaUrl?, mediaType?, cleanup?)
  const handlePost = (
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    cleanupMedia?: () => Promise<void>,
  ) => {
    if (!effective) return
    createPost(
      {
        user_id: effective.id,
        content,
        media_url: mediaUrl ?? null,
        media_type: mediaType ?? null,
        match_id: null,
      },
      {
        onError: async () => {
          // Delete any uploaded media if the post failed to save
          await cleanupMedia?.()
        },
      },
    )
    setShowComposer(false)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-24">
      <div className="flex items-center gap-2.5 mb-1.5">
        <LiveDot />
        <span className="text-[11px] font-lexend font-black text-primary-container uppercase tracking-widest">
          {t('common.live')}
        </span>
      </div>
      <h1 className="font-lexend font-black text-5xl uppercase italic leading-none mb-7">
        {t('nav.fanZone')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl font-lexend text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <FeedFilter active={filter} onChange={setFilter} />
            <span className="text-[10px] font-lexend text-white/25 uppercase tracking-widest">
              {displayed.length} posts
            </span>
          </div>

          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card h-32 rounded-xl animate-pulse" />
              ))}
            </>
          )}

          {!isLoading &&
            displayed.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}

          {!isLoading && displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="material-symbols-outlined text-5xl text-white/20">forum</span>
              <p className="font-lexend font-bold uppercase text-white/40 text-sm">
                No posts yet — be the first!
              </p>
            </div>
          )}

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center py-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-2 rounded-full border border-white/10 text-[11px] font-lexend font-bold text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-30"
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load more posts'}
              </button>
            </div>
          )}
        </div>

        <aside className="hidden lg:flex flex-col gap-4 sticky top-[68px]">
          <TrendingHashtags />
          <DiscoverWidget />
        </aside>

        {/* Mobile: sidebars stacked below feed */}
        <div className="lg:hidden mt-2 flex flex-col gap-4">
          <TrendingHashtags />
          <DiscoverWidget />
        </div>
      </div>

      <FAB icon="edit" onClick={() => setShowComposer(true)} label="Create post" />

      {showComposer && (
        <div
          onClick={() => setShowComposer(false)}
          className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-[10px] flex items-end justify-center p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] animate-[fadeUp_0.2s_ease_forwards]"
          >
            <PostComposer onPost={handlePost} autoFocus />
          </div>
        </div>
      )}
    </div>
  )
}