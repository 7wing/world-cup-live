// src/components/fanzone/PostCard.tsx
// Phase 6: uses real Post type from @/types. No fanzoneData import.

import { formatDistanceToNow } from 'date-fns'
import { Avatar }    from '@/components/ui/Avatar'
import type { Post } from '@/types'

interface PostCardProps {
  post:   Post
  onLike: (id: string) => void
}

function nfmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

export function PostCard({ post, onLike }: PostCardProps) {
  const username  = post.user?.username  ?? 'Fan'
  const avatarUrl = post.user?.avatar_url ?? null

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar src={avatarUrl} username={username} size="sm" />
          <div>
            <p className="text-xs font-lexend font-bold text-white/80">{username}</p>
            <p className="text-[10px] font-lexend text-white/30">
              {relativeTime(post.created_at)}
            </p>
          </div>
        </div>

        {post.is_official && (
          <span className="font-lexend font-black text-[8px] uppercase tracking-widest bg-primary-container/10 text-primary-container px-2 py-0.5 rounded border border-outline-variant">
            Official
          </span>
        )}
      </div>

      {/* Body */}
      <p className="px-4 pb-3.5 text-[13px] font-lexend leading-relaxed text-white/75">
        {post.content}
      </p>

      {/* Optional media */}
      {post.media_url && post.media_type === 'image' && (
        <img
          src={post.media_url}
          alt="Post media"
          className="w-full max-h-72 object-cover"
        />
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/5 flex gap-5 items-center">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs font-lexend font-semibold transition-colors ${
            post.liked ? 'text-primary-container' : 'text-white/30 hover:text-white/50'
          }`}
        >
          {post.liked ? '❤️' : '🤍'} {nfmt(post.likes)}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-lexend font-semibold text-white/30 hover:text-white/50 transition-colors">
          💬 {nfmt(post.comment_count)}
        </button>
        <button className="ml-auto text-[13px] text-white/30 hover:text-white/50 transition-colors">
          ↗
        </button>
      </div>
    </div>
  )
}