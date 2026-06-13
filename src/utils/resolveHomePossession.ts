import overrides from '@/data/possessionOverrides.json'

const possessionMap = overrides as Record<string, number>

/**
 * Return the home possession for a match.
 * Uses a static override map for 2022 matches where DB still holds the default 50.
 * Falls back to the match object value for live/upcoming matches.
 */
export function resolveHomePossession(matchId: string, dbValue: number): number {
  // If DB already has a real value (not the placeholder 50), trust it.
  if (dbValue !== 50) return dbValue
  // Otherwise check the static override map.
  return possessionMap[matchId] ?? dbValue
}
