import { createClient } from '@supabase/supabase-js'

process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
process.env.VITE_SUPABASE_ANON_KEY = 'test-key'

const modules = [
  '@/pages/Login',
  '@/pages/Signup',
  '@/pages/ForgotPassword',
  '@/pages/CheckEmail',
  '@/pages/ResetPassword',
  '@/pages/matches/MatchDetailPage',
  '@/pages/fanzone/FanZonePage',
  '@/pages/games/GamesPage',
  '@/pages/stadiums/StadiumDetailPage',
  '@/pages/profile/ProfilePage',
  '@/pages/profile/DiscoverPage',
  '@/pages/profile/MessagesPage',
  '@/pages/fanzone/TribeDetailPage',
]

async function test() {
  for (const mod of modules) {
    try {
      const m = await import(mod)
      console.log(`✅ ${mod} — exports: ${Object.keys(m).join(', ')}`)
    } catch (err: any) {
      console.error(`❌ ${mod} — ERROR: ${err.message}`)
      console.error(err.stack)
    }
  }
}

test()
