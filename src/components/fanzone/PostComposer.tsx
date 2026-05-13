import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useCreatePost } from '@/hooks/usePosts'

export function PostComposer() {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const { mutate, isPending } = useCreatePost()

  const handlePost = () => {
    if (!content.trim() || !user) return
    mutate({ user_id: user.id, content, media_url: null, media_type: null, match_id: null })
    setContent('')
  }

  return (
    <GlassCard className="p-4">
      <div className="flex gap-4">
        <Avatar src={user?.avatar_url} username={user?.username} />
        <div className="flex-1">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 text-white/90 placeholder:text-white/30 resize-none h-20 text-base"
            placeholder="Share your match energy..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="flex gap-4">
              {['image', 'videocam', 'poll'].map((icon) => (
                <button key={icon} className="text-white/40 hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
            <NeonButton size="sm" onClick={handlePost} disabled={isPending || !content.trim()}>
              Post
            </NeonButton>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}