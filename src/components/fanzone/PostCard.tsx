// src/components/fanzone/PostCard.tsx
import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { fetchPostComments } from '@/api/fanzone'
import { useAuthStore } from '@/store/authStore'
import { useCreateComment } from '@/hooks/usePosts'
import type { Post } from '@/types'
import type { PostComment } from '@/api/fanzone'
import { useTranslate } from '@/hooks/useTranslate'
import { TranslateButton } from '@/components/ui/TranslateButton'

interface PostCardProps {
  post: Post
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

// ─── Share ────────────────────────────────────────────────────────────────────

async function handleShare(postId: string, content: string) {
  const url = `${window.location.origin}/fan-zone?post=${postId}`
  const shareData = { title: 'Fan Zone Post', text: content || 'Check this out!', url }

  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      /* fall through */
    }
  }
  await navigator.clipboard.writeText(url)
  // Brief visual feedback handled by caller via copied state
}

// ─── Comments Modal ───────────────────────────────────────────────────────────

interface CommentsModalProps {
  post: Post
  onClose: () => void
}

function CommentsModal({ post, onClose }: CommentsModalProps) {
  const { user } = useAuthStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () => fetchPostComments(post.id),
  })

  const { mutate: submitComment, isPending } = useCreateComment(post.id)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const canSubmit = !!user && !!input.trim() && !isPending

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-[10px] flex items-end justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] glass-card rounded-2xl flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
          <h3 className="font-lexend font-black text-sm uppercase tracking-widest text-white/80">
            Comments
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Original post */}
        <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar src={post.user?.avatar_url ?? null} username={post.user?.username ?? 'Fan'} size="sm" />
            <p className="text-xs font-lexend font-bold text-white/60">{post.user?.username ?? 'Fan'}</p>
          </div>
          {post.content && (
            <p className="text-[13px] font-lexend text-white/60 leading-relaxed">{post.content}</p>
          )}
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <p className="text-[11px] font-lexend text-white/20 text-center py-6">No comments yet — be the first!</p>
          )}

          {!isLoading &&
            comments.map((c: PostComment) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar src={c.user?.avatar_url ?? null} username={c.user?.username ?? 'Fan'} size="sm" />
                <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <p className="text-[10px] font-lexend font-bold text-primary-container">
                      {c.user?.username ?? 'Fan'}
                    </p>
                    <span className="text-[9px] font-lexend text-white/25">{relativeTime(c.created_at)}</span>
                  </div>
                  <p className="text-[13px] font-lexend text-white/75 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/5 flex gap-2 flex-shrink-0">
          {user ? (
            <>
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canSubmit) {
                    const content = input.trim()
                    submitComment(content, { onSuccess: () => setInput('') })
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 bg-white/5 border border-white/10 focus:border-primary-container/50 rounded-full px-4 py-2.5 text-sm font-lexend text-white/80 placeholder:text-white/20 outline-none transition-colors"
              />
              <button
                onClick={() => {
                  if (!canSubmit) return
                  const content = input.trim()
                  submitComment(content, { onSuccess: () => setInput('') })
                }}
                disabled={!canSubmit}
                className="w-9 h-9 bg-primary-container rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity active:scale-95"
              >
                <span className="material-symbols-outlined text-sm text-on-primary">send</span>
              </button>
            </>
          ) : (
            <p className="text-[11px] font-lexend text-white/30 text-center w-full py-1">Sign in to comment</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

export function PostCard({ post, onLike }: PostCardProps) {
  const username = post.user?.username ?? 'Fan'
  const avatarUrl = post.user?.avatar_url ?? null
  const [showComments, setShowComments] = useState(false)
  const [copied, setCopied] = useState(false)

  const { displayText, isTranslated, onTranslated, onReset } = useTranslate(post.content ?? '')

  const onShare = async () => {
    await handleShare(post.id, post.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar src={avatarUrl} username={username} size="sm" />
            <div>
              <p className="text-xs font-lexend font-bold text-white/80">{username}</p>
              <p className="text-[10px] font-lexend text-white/30">{relativeTime(post.created_at)}</p>
            </div>
          </div>
          {post.is_official && (
            <span className="font-lexend font-black text-[8px] uppercase tracking-widest bg-primary-container/10 text-primary-container px-2 py-0.5 rounded border border-outline-variant">
              Official
            </span>
          )}
        </div>

        {/* Body with translation */}
        {post.content && (
          <div className="px-4 pb-3.5">
            <p className="text-[13px] font-lexend leading-relaxed text-white/75">{displayText}</p>
            <TranslateButton
              text={post.content}
              isTranslated={isTranslated}
              onTranslated={onTranslated}
              onReset={onReset}
            />
          </div>
        )}

        {/* Media — image */}
        {post.media_url && post.media_type === 'image' && (
          <img src={post.media_url} alt="Post media" className="w-full max-h-72 object-cover" />
        )}

        {/* Media — video */}
        {post.media_url && post.media_type === 'video' && (
          <video src={post.media_url} controls className="w-full max-h-72" preload="metadata" />
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

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-xs font-lexend font-semibold text-white/30 hover:text-white/50 transition-colors"
          >
            💬 {nfmt(post.comment_count)}
          </button>

          <button
            onClick={onShare}
            className="ml-auto text-[13px] font-lexend font-semibold text-white/30 hover:text-white/50 transition-colors"
            title={copied ? 'Link copied!' : 'Share'}
          >
            {copied ? '✓' : '↗'}
          </button>
        </div>
      </div>

      {showComments && <CommentsModal post={post} onClose={() => setShowComments(false)} />}
    </>
  )
}
