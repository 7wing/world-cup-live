/** Mock/offline mode — uses mockData.ts + localStorage instead of Supabase */
export function isMockDataEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false'
}
