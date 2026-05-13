import { Avatar } from '@/components/ui/Avatar'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatRelative } from '@/utils/formatDate'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <GlassCard className="overflow-hidden border-white/5">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar src={post.user?.avatar_url} username={post.user?.username} size="sm" />
          <div>
            <h5 className="font-lexend font-semibold text-sm text-white/90">{post.user?.username}</h5>
            <p className="text-[11px] text-white/40">{formatRelative(post.created_at)}</p>
          </div>
        </div>
        {post.is_official && (
          <span className="text-[10px] font-lexend font-bold uppercase bg-primary-container/20 text-primary-container px-2 py-0.5 rounded-sm">Official</span>
        )}
      </div>

      {post.content && (
        <p className="px-4 pb-4 text-white/80">{post.content}</p>
      )}

      {post.media_url && (
        <div className="aspect-video w-full bg-surface-container">
          <img src={post.media_url} alt="post media" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4 flex gap-6 items-center border-t border-white/10">
        <button
          onClick={() => onLike?.(post.id)}
          className="flex items-center gap-2 text-white/40 hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm">favorite</span>
          <span className="text-xs font-lexend font-semibold">{post.likes.toLocaleString()}</span>
        </button>
        <button className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors">
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          <span className="text-xs font-lexend font-semibold">{post.comment_count}</span>
        </button>
        <button className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors ml-auto">
          <span className="material-symbols-outlined text-sm">share</span>
        </button>
      </div>
    </GlassCard>
  )
}