import type { User } from '@/types'

export const GUEST_USER: User = {
  id: 'guest-local',
  username: 'You',
  avatar_url: '⚽',
  tier: 'fan',
  xp: 0,
  global_rank: null,
  tribe_id: null,
}

export function getEffectiveUser(user: User | null): User | null {
  return user ?? GUEST_USER
}
