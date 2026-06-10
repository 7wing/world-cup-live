import type { PassportBadge } from '@/types'
import { cn } from '@/utils/cn'

interface BadgeGridProps {
  badges: PassportBadge[]
  compact?: boolean
}

// Default badges that every user can earn (locked until unlocked)
const DEFAULT_BADGES = [
  { badge_key: 'first_login',      label: 'First Steps',     description: 'Log in for the first time.',     icon: 'footprint'        },
  { badge_key: 'first_post',       label: 'New Voice',       description: 'Create your first post.',         icon: 'campaign'         },
  { badge_key: 'first_prediction', label: 'Crystal Ball',    description: 'Make your first match prediction.', icon: 'psychology'       },
  { badge_key: 'first_review',     label: 'Critic',          description: 'Submit your first stadium review.', icon: 'rate_review'      },
  { badge_key: 'ten_posts',        label: 'Influencer',      description: 'Create 10 posts.',                 icon: 'trending_up'      },
  { badge_key: 'correct_prediction', label: 'Nostradamus',   description: 'Get a prediction right.',          icon: 'emoji_events'     },
  { badge_key: 'tribe_member',     label: 'Tribal',          description: 'Join a tribe.',                    icon: 'groups'           },
  { badge_key: 'watch_party_host', label: 'Host',            description: 'Create a watch party.',            icon: 'co_present'       },
]

/**
 * Merge fetched badges with defaults so locked badges always show as obtainable.
 */
function mergeWithDefaults(fetched: PassportBadge[]): PassportBadge[] {
  const unlocked = new Map(fetched.map((b) => [b.badge_key, b]))
  return DEFAULT_BADGES.map((def) => {
    const unlockedBadge = unlocked.get(def.badge_key)
    if (unlockedBadge) return unlockedBadge
    // Return a synthesised locked badge row
    return {
      id:            `locked_${def.badge_key}`,
      user_id:       '',
      badge_key:     def.badge_key,
      label:         def.label,
      description:   def.description,
      icon_url:      null,
      is_unlocked:   false,
      earned_at:     null,
    } as PassportBadge
  })
}

const ICON_MAP: Record<string, string> = {
  // Match & competition
  match_opener:      'sports_soccer',
  trophy_hunter:     'military_tech',
  lusail_icon:       'stadium',
  top_predictor:     'trophy',
  derby_winner:      'emoji_events',
  away_days:         'flight_takeoff',
  world_finals:      'public',
  // Attendance & travel
  stadium_hopper:    'map',
  frequent_flyer:    'airplanemode_active',
  home_crowd:        'home',
  away_support:      'directions_run',
  // Prediction milestones
  first_prediction:  'psychology',
  correct_prediction:'emoji_events',
  perfect_week:      'verified',
  oracle:            'auto_awesome',
  streak_5:          'local_fire_department',
  streak_10:         'whatshot',
  // Social & onboarding
  first_login:       'login',
  first_post:        'campaign',
  first_review:      'rate_review',
  ten_posts:         'trending_up',
  tribe_founder:     'shield',
  tribe_member:      'groups',
  fan_photo:         'photo_camera',
  social_butterfly:  'diversity_3',
  watch_party_host:  'co_present',
  // Ranking
  elite_rank:        'star',
  pro_rank:          'workspace_premium',
  mvp_rank:          'crown',
  // Misc
  early_adopter:     'rocket_launch',
  collector:         'inventory_2',
  duel_champion:     'swords',
  trivia_master:     'quiz',
}

export function BadgeGrid({ badges, compact = false }: BadgeGridProps) {
  // Always show all available badges (unlocked + locked defaults)
  const mergedBadges = mergeWithDefaults(badges)

  return (
    <div
      className={cn(
        'grid gap-4',
        compact
          ? 'grid-cols-3'
          : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
      )}
    >
      {mergedBadges.map((badge) => (
        <div
          key={badge.id}
          className={cn(
            'glass-card rounded-xl flex flex-col items-center justify-center text-center space-y-3 transition-all',
            compact ? 'p-3 aspect-square' : 'p-4 aspect-[3/4]',
            badge.is_unlocked
              ? 'border-primary-container/30 bg-primary-container/5 hover:scale-105'
              : 'opacity-40 grayscale'
          )}
        >
          <div
            className={cn(
              'rounded-full flex items-center justify-center border-2',
              compact ? 'w-12 h-12' : 'w-20 h-20',
              badge.is_unlocked
                ? 'border-primary-container shadow-[inset_0_0_15px_rgba(0,255,65,0.2)]'
                : 'border-dashed border-white/20'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined',
                compact ? 'text-3xl' : 'text-5xl',
                badge.is_unlocked ? 'text-primary-container' : 'text-white/20'
              )}
              style={badge.is_unlocked ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {ICON_MAP[badge.badge_key] ?? 'lock'}
            </span>
          </div>

          {!compact && (
            <div>
              <p
                className={cn(
                  'font-lexend font-semibold text-xs uppercase',
                  badge.is_unlocked ? 'text-primary-container' : 'text-white/40'
                )}
              >
                {badge.label}
              </p>
              <p className="text-[10px] text-white/40 uppercase mt-0.5">
                {badge.is_unlocked ? badge.description : 'Locked'}
              </p>
            </div>
          )}

          {compact && (
            <p
              className={cn(
                'font-lexend font-semibold text-[9px] uppercase leading-tight',
                badge.is_unlocked ? 'text-primary-container' : 'text-white/40'
              )}
            >
              {badge.label}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}