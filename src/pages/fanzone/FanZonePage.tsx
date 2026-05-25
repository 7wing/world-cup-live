// src/pages/fanzone/FanZonePage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// No props needed — navigation handled via React Router's useNavigate.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiveDot } from '@/shared/ui'
import { PostCard } from '@/components/fanzone/PostCard'
import { PostComposer } from '@/components/fanzone/PostComposer'
import { FeedFilter } from '@/components/fanzone/FeedFilter'
import { WatchPartiesSidebar } from '@/components/fanzone/WatchPartiesSidebar'
import { TribesSidebar } from '@/components/fanzone/TribesSidebar'
import { MOCK_POSTS, WATCH_PARTIES, HASHTAGS } from '@/lib/fanzoneData'
import type { Post, WatchParty } from '@/lib/fanzoneData'

type FilterOption = 'All' | 'Trending' | 'Following'

export function FanZonePage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [filter, setFilter] = useState<FilterOption>('All')
  const [showComposer, setShowComposer] = useState(false)

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleLike = (id: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    )

  const handlePost = (content: string) => {
    const newPost: Post = {
      id: `p${Date.now()}`,
      username: 'You',
      avatar: '🌟',
      time: 'Just now',
      content,
      likes: 0,
      comments: 0,
      liked: false,
      official: false,
    }
    setPosts((prev) => [newPost, ...prev])
    setShowComposer(false)
  }

  const handleEnterParty = (party: WatchParty) => {
    navigate(`/fan-zone/watch-party/${party.id}`)
  }

  // ── filtered feed ─────────────────────────────────────────────────────────
  const displayed: Post[] =
    filter === 'Trending'
      ? [...posts].sort((a, b) => b.likes - a.likes)
      : filter === 'Following'
        ? posts.filter((p) => !p.official)
        : posts

  // ── render ────────────────────────────────────────────────────────────────
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

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── Feed column ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Hashtag pills */}
          <div className="flex flex-wrap gap-2">
            {HASHTAGS.map((tag) => (
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

          {/* Posts */}
          {displayed.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 sticky top-[68px]">
          <WatchPartiesSidebar parties={WATCH_PARTIES} onEnter={handleEnterParty} />
          <TribesSidebar />
        </aside>
      </div>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowComposer(true)}
        className="fixed bottom-7 right-7 w-[54px] h-[54px] rounded-full bg-primary-container border-none text-2xl flex items-center justify-center font-black text-on-primary z-[100] cursor-pointer transition-transform hover:scale-110 shadow-[0_0_24px_rgba(0,255,65,0.35)] hover:shadow-[0_0_36px_rgba(0,255,65,0.5)]"
      >
        +
      </button>

      {/* ── Composer modal ───────────────────────────────────────────────────── */}
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