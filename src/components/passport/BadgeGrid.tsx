import type { PassportBadge } from '@/types'
import { cn } from '@/utils/cn'

interface BadgeGridProps {
  badges: PassportBadge[]
}

const ICON_MAP: Record<string, string> = {
  match_opener: 'sports_soccer',
  trophy_hunter: 'military_tech',
  lusail_icon: 'stadium',
  top_predictor: 'trophy',
  derby_winner: 'emoji_events',
  away_days: 'flight_takeoff',
  world_finals: 'public',
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={cn(
            'glass-card rounded-xl p-4 aspect-[3/4] flex flex-col items-center justify-center text-center space-y-3 transition-all',
            badge.is_unlocked ? 'border-primary-container/30 bg-primary-container/5 hover:scale-105' : 'opacity-40 grayscale'
          )}
        >
          <div className={cn('w-20 h-20 rounded-full flex items-center justify-center border-2', badge.is_unlocked ? 'border-primary-container shadow-[inset_0_0_15px_rgba(0,255,65,0.2)]' : 'border-dashed border-white/20')}>
            <span className={cn('material-symbols-outlined text-5xl', badge.is_unlocked ? 'text-primary-container' : 'text-white/20')} style={badge.is_unlocked ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {ICON_MAP[badge.badge_key] ?? 'lock'}
            </span>
          </div>
          <div>
            <p className={cn('font-lexend font-semibold text-xs uppercase', badge.is_unlocked ? 'text-primary-container' : 'text-white/40')}>{badge.label}</p>
            <p className="text-[10px] text-white/40 uppercase mt-0.5">{badge.is_unlocked ? badge.description : 'Locked'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}