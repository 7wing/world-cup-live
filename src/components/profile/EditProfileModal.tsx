import { useState, useRef } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/ui/Avatar'
import { NeonButton } from '@/components/ui/NeonButton'
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile'

interface EditProfileModalProps {
  username: string
  avatarUrl: string | null
  userId: string
  onClose: () => void
}

export function EditProfileModal({
  username,
  avatarUrl,
  userId,
  onClose,
}: EditProfileModalProps) {
  const [name, setName] = useState(username)
  const fileRef = useRef<HTMLInputElement>(null)
  const { mutate: updateProfile, isPending: saving }   = useUpdateProfile(userId)
  const { mutate: uploadAvatar,  isPending: uploading } = useUploadAvatar(userId)
  const busy = saving || uploading // isLoading guard — isUploading + isSaving blocked

  function handleSave() {
    const usernameChanged = name.trim() && name !== username
    if (usernameChanged) {
      updateProfile({ username: name.trim() }, { onSuccess: () => onClose() })
    } else {
      onClose()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadAvatar(file)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70"
      onClick={busy ? undefined : onClose}
    >
      <GlassCard className="w-full max-w-sm p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-lexend font-black uppercase text-lg">Edit Profile</h2>
          <button
            onClick={busy ? undefined : onClose}
            disabled={busy}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-primary-container/50 hover:border-primary-container transition-colors group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Avatar src={avatarUrl} username={username} size="lg" className="w-full h-full" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container animate-spin text-2xl">progress_activity</span>
              </div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <p className="text-[10px] text-white/30 font-lexend">Tap to change avatar</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-lexend font-semibold uppercase text-white/40 tracking-wider">Username</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            disabled={saving}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-lexend text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary-container/60 transition-colors disabled:opacity-50"
          />
        </div>

        <NeonButton className="w-full justify-center" disabled={busy} onClick={handleSave}>
          {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save Changes'}
        </NeonButton>
      </GlassCard>
    </div>
  )
}