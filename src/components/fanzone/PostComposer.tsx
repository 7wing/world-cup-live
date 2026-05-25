// src/components/fanzone/PostComposer.tsx

import { useState } from 'react'
import { NeonButton } from '@/components/ui/NeonButton'

interface PostComposerProps {
  onPost: (content: string) => void
  autoFocus?: boolean
}

export function PostComposer({ onPost, autoFocus = false }: PostComposerProps) {
  const [content, setContent] = useState('')

  const handlePost = () => {
    if (!content.trim()) return
    onPost(content.trim())
    setContent('')
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary-container/10 border border-outline-variant flex items-center justify-center text-base flex-shrink-0">
          🌟
        </div>

        {/* Input area */}
        <div className="flex-1">
          <textarea
            autoFocus={autoFocus}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your match energy..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handlePost()
            }}
            className="w-full bg-transparent border-none outline-none text-white/80 text-sm font-lexend resize-none h-[68px] leading-relaxed pt-1 placeholder:text-white/20"
          />

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {/* Media buttons */}
            <div className="flex gap-4">
              {['🖼️', '🎬', '📊'].map((ic) => (
                <button
                  key={ic}
                  className="text-[15px] opacity-35 hover:opacity-80 transition-opacity"
                >
                  {ic}
                </button>
              ))}
            </div>

            <NeonButton
              onClick={handlePost}
              disabled={!content.trim()}
              className="px-4 py-1.5 text-[10px]"
            >
              Post
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  )
}