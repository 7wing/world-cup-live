import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { useAuthStore } from '@/store/authStore'
import { useSubmitReview } from '@/hooks/useStadium'

interface ReviewFormProps {
  stadiumId: string
  onClose: () => void
}

const CATEGORIES = [
  { key: 'atmosphere_score', label: 'Atmosphere', icon: 'campaign' },
  { key: 'food_score', label: 'Food & Beverage', icon: 'restaurant' },
  { key: 'hotel_score', label: 'Hotels Nearby', icon: 'apartment' },
  { key: 'safety_score', label: 'Safety', icon: 'security' },
] as const

export function ReviewForm({ stadiumId, onClose }: ReviewFormProps) {
  const { user } = useAuthStore()
  const { mutate, isPending } = useSubmitReview(stadiumId)
  const [scores, setScores] = useState({ atmosphere_score: 4, food_score: 4, hotel_score: 4, safety_score: 4 })
  const [body, setBody] = useState('')

  const handleSubmit = () => {
    if (!user) return
    mutate({ user_id: user.id, stadium_id: stadiumId, ...scores, body })
    onClose()
  }

  return (
    <GlassCard className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-lexend font-bold text-xl uppercase text-primary-container">Rate the Venue</h2>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map(({ key, label, icon }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-sm">{icon}</span>
                <span className="font-lexend text-xs uppercase text-white/60 font-semibold">{label}</span>
              </div>
              <span className="text-primary-container font-lexend font-bold">{scores[key]}/5</span>
            </div>
            <input
              type="range" min={1} max={5} step={1}
              value={scores[key]}
              onChange={(e) => setScores((p) => ({ ...p, [key]: Number(e.target.value) }))}
              className="w-full accent-primary-container h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}

        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary-container/50 resize-none h-24"
          placeholder="Share your experience..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <NeonButton className="w-full justify-center" onClick={handleSubmit} disabled={isPending}>
        Submit Review
      </NeonButton>
    </GlassCard>
  )
}