import { useQuery } from '@tanstack/react-query'
import { fetchPostLikers } from '@/api/fanzone'
import { Avatar } from '@/components/ui/Avatar'
import type { Post } from '@/types'
import type { User } from '@/types'

interface LikesModalProps {
  post: Post
  onClose: () => void
}

export function LikesModal({ post, onClose }: LikesModalProps) {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['post-likers', post.id],
    queryFn: () => fetchPostLikers(post.id),
  })

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-[10px] flex items-end justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] glass-card rounded-2xl flex flex-col max-h-[70vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
          <h3 className="font-lexend font-black text-sm uppercase tracking-widest text-white/80">
            Liked by
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && !error && users.length === 0 && (
            <p className="text-[11px] font-lexend text-white/20 text-center py-6">
              No likes yet — be the first!
            </p>
          )}

          {!isLoading && error && (
            <p className="text-[11px] font-lexend text-error text-center py-6">
              Could not load likers
            </p>
          )}

          {!isLoading &&
            users.map((u: User) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar
                  src={u.avatar_url}
                  username={u.username}
                  size="sm"
                />
                <div>
                  <p className="text-[13px] font-lexend font-bold text-white/80">
                    {u.username}
                  </p>
                  <p className="text-[10px] font-lexend text-white/30 capitalize">
                    {u.tier}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
