import type { User } from '@/types'

/** Dev/demo profile when VITE_USE_MOCK_PROFILE=true or Supabase row is missing */
export const MOCK_PROFILE: User = {
  id: 'mock-user-001',
  username: 'demo_fan',
  avatar_url: null,
  tier: 'elite',
  xp: 12450,
  global_rank: 42,
  tribe_id: null,
}

export function isMockProfileEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK_PROFILE === 'true'
}
