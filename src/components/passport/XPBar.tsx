import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import type { User } from '@/types'

const TIER_THRESHOLDS = { fan: 0, elite: 5000, pro: 15000, mvp: 40000 }
const NEXT_TIER: Record<string, string> = { fan: 'elite', elite: 'pro', pro: 'mvp', mvp: 'mvp' }

interface XPBarProps {
  user: User
}

export function XPBar({ user }: XPBarProps) {
  const currentThreshold = TIER_THRESHOLDS[user.tier] ?? 0
  const nextThreshold = TIER_THRESHOLDS[NEXT_TIER[user.tier] as keyof typeof TIER_THRESHOLDS] ?? user.xp
  const progress = Math.min(((user.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)

  return (
    <GlassCard className="p-6 flex flex-col items-center space-y-4 border-primary-container/20">
      <span className="font-lexend text-xs text-white/40 uppercase tracking-widest">Next Rank Up</span>
      <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary-container to-white shadow-[0_0_10px_rgba(0,255,65,0.5)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between w-full text-xs font-lexend font-semibold text-primary-container">
        <span>{user.xp.toLocaleString()} XP</span>
        <span>{nextThreshold.toLocaleString()} XP</span>
      </div>
      <NeonButton className="w-full justify-center">Claim Daily Bonus</NeonButton>
    </GlassCard>
  )
}