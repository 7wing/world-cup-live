// src/components/fanzone/PostCard.tsx

import type { Post } from '../../lib/fanzoneData'

interface PostCardProps {
  post: Post
  onLike: (id: string) => void
}

function nfmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-full bg-surface-container-high flex items-center justify-center text-base flex-shrink-0">
            {post.avatar}
          </div>
          <div>
            <p className="text-xs font-lexend font-bold text-white/80">{post.username}</p>
            <p className="text-[10px] font-lexend text-white/30">{post.time}</p>
          </div>
        </div>
        {post.official && (
          <span className="font-lexend font-black text-[8px] uppercase tracking-widest bg-primary-container/10 text-primary-container px-2 py-0.5 rounded border border-outline-variant">
            Official
          </span>
        )}
      </div>

      {/* Body */}
      <p className="px-4 pb-3.5 text-[13px] font-lexend leading-relaxed text-white/75">
        {post.content}
      </p>

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
          💬 {post.comments}
        </button>
        <button className="ml-auto text-[13px] text-white/30 hover:text-white/50 transition-colors">
          ↗
        </button>
      </div>
    </div>
  )
}