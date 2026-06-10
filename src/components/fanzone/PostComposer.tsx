// src/components/fanzone/PostComposer.tsx

import { useState, useRef } from 'react'
import { NeonButton } from '@/components/ui/NeonButton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface PostComposerProps {
  onPost: (
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    cleanupMedia?: () => void,
  ) => void
  autoFocus?: boolean
}

export function PostComposer({ onPost, autoFocus = false }: PostComposerProps) {
  const { user } = useAuthStore()
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  // Track storage paths so we can clean up on post failure
  const mediaBucket = useRef<'post-images' | 'post-videos' | null>(null)
  const mediaPath = useRef<string | null>(null)

  const handleFileSelect = async (file: File, type: 'image' | 'video') => {
    if (!user) return
    setUploadError(null)
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const bucket = type === 'image' ? 'post-images' : 'post-videos'

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      setMediaUrl(data.publicUrl)
      setMediaType(type)
      mediaBucket.current = bucket
      mediaPath.current = path
    } catch (err) {
      setUploadError('Upload failed. Please try again.')
      console.error('[PostComposer] upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const clearMedia = () => {
    setMediaUrl(null)
    setMediaType(null)
    setUploadError(null)
    if (imageRef.current) imageRef.current.value = ''
    if (videoRef.current) videoRef.current.value = ''
  }

  const handlePost = () => {
    if (!content.trim() && !mediaUrl) return

    // Cleanup function passed to parent so it can delete the file if post creation fails
    const cleanup = async () => {
      const bucket = mediaBucket.current
      const path = mediaPath.current
      if (!bucket || !path) return

      try {
        await supabase.storage.from(bucket).remove([path])
        console.debug('[PostComposer] cleaned up orphaned media:', path)
      } catch (err) {
        console.error('[PostComposer] failed to clean up media:', err)
      } finally {
        mediaBucket.current = null
        mediaPath.current = null
      }
    }

    onPost(
      content.trim(),
      mediaUrl ?? undefined,
      mediaType ?? undefined,
      cleanup,
    )
    setContent('')
    clearMedia()
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-container/10 border border-outline-variant flex items-center justify-center text-base flex-shrink-0">
          🌟
        </div>

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

          {/* Media preview */}
          {mediaUrl && (
            <div className="relative mb-3 rounded-lg overflow-hidden">
              {mediaType === 'image' ? (
                <img src={mediaUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
              ) : (
                <video src={mediaUrl} controls className="w-full max-h-48 rounded-lg" />
              )}
              <button
                onClick={clearMedia}
                className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="Remove media"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}

          {/* Upload error */}
          {uploadError && (
            <p className="text-red-400 text-[11px] font-lexend mb-2">{uploadError}</p>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container animate-pulse rounded-full w-1/2" />
              </div>
              <span className="text-[10px] font-lexend text-white/40">Uploading...</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex gap-3">
              {/* Hidden file inputs */}
              <input
                ref={imageRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file, 'image')
                }}
              />
              <input
                ref={videoRef}
                type="file"
                accept="video/mp4,video/webm,video/mov"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file, 'video')
                }}
              />

              {/* Image button */}
              <button
                type="button"
                disabled={uploading || !!mediaUrl}
                onClick={() => imageRef.current?.click()}
                className="flex items-center gap-1 text-white/30 hover:text-white/60 disabled:opacity-20 transition-colors"
                title="Add photo"
              >
                <span className="material-symbols-outlined text-[18px]">image</span>
                <span className="text-[10px] font-lexend hidden sm:inline">Photo</span>
              </button>

              {/* Video button */}
              <button
                type="button"
                disabled={uploading || !!mediaUrl}
                onClick={() => videoRef.current?.click()}
                className="flex items-center gap-1 text-white/30 hover:text-white/60 disabled:opacity-20 transition-colors"
                title="Add video"
              >
                <span className="material-symbols-outlined text-[18px]">videocam</span>
                <span className="text-[10px] font-lexend hidden sm:inline">Video</span>
              </button>
            </div>

            <NeonButton
              onClick={handlePost}
              disabled={(!content.trim() && !mediaUrl) || uploading}
              className="px-4 py-1.5 text-[10px]"
            >
              {uploading ? 'Uploading...' : 'Post'}
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  )
}