// src/lib/server/seedPlayers.ts
// Pulls real World Cup 2026 squads from football-data.org and seeds the
// players table with position-aware fantasy costs.
//
// Usage:
//   npx tsx src/lib/server/seedPlayers.ts
//
// Required .env vars:
//   FOOTBALL_DATA_API_KEY   — your X-Auth-Token from football-data.org
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js'
import { config }       from 'dotenv'

config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
)

// ── Cost model ────────────────────────────────────────────────────────────────
// Squads are ranked by FIFA ranking; top teams get higher-cost players.
// Within each team, starters cost more than bench players.
// Adjust these tiers however you like.

const TEAM_TIER: Record<string, number> = {
  // Tier 1 — elite (14-15cr forwards, 12-13cr mids)
  France: 1, Brazil: 1, England: 1, Argentina: 1, Spain: 1,
  Portugal: 1, Germany: 1, Belgium: 1,
  // Tier 2 — strong (11-12cr forwards, 9-11cr mids)
  Netherlands: 2, Uruguay: 2, Croatia: 2, Denmark: 2,
  Mexico: 2, Senegal: 2, Morocco: 2, Japan: 2,
  'United States': 2, Colombia: 2, Ecuador: 2,
  // Tier 3 — rest (8-10cr)
}

function calcCost(position: string, teamTier: number, squadOrder: number): number {
  // squadOrder 0-10 = likely starters, 11-22 = bench
  const isStarter = squadOrder <= 10

  const base: Record<string, number[]> = {
    //            [tier1, tier2, tier3]
    Goalkeeper:  [9, 7, 6],
    Defender:    [isStarter ? 9 : 7, isStarter ? 7 : 6, isStarter ? 6 : 5],
    Midfielder:  [isStarter ? 12 : 9, isStarter ? 10 : 8, isStarter ? 8 : 7],
    Forward:     [isStarter ? 14 : 10, isStarter ? 11 : 9, isStarter ? 9 : 8],
  }

  const tierIdx = Math.min(teamTier - 1, 2)
  return (base[position] ?? [8, 7, 6])[tierIdx]
}

function mapPosition(pos: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (pos === 'Goalkeeper') return 'GK'
  if (pos === 'Defender')   return 'DEF'
  if (pos === 'Midfielder') return 'MID'
  return 'FWD'
}

// ── API helpers ───────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function fdFetch(url: string) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) { console.error('❌  FOOTBALL_DATA_API_KEY not set'); process.exit(1) }

  const res = await fetch(url, { headers: { 'X-Auth-Token': apiKey } })

  if (res.status === 429) {
    const wait = parseInt(res.headers.get('X-RequestCounter-Reset') ?? '60')
    console.warn(`⏳  Rate limited — waiting ${wait}s...`)
    await sleep(wait * 1000)
    return fdFetch(url)
  }

  if (!res.ok) {
    console.error(`❌  API ${res.status}: ${await res.text()}`)
    return null
  }

  const remaining = res.headers.get('X-Requests-Available-Minute')
  if (remaining && parseInt(remaining) <= 2) {
    console.warn('⏳  Near rate limit — pausing 60s...')
    await sleep(60_000)
  }

  return res.json()
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('⚽  Seeding players from football-data.org WC 2026 squads\n')

  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌  Missing Supabase env vars'); process.exit(1)
  }

  // Fetch all WC 2026 teams
  const teamsData = await fdFetch('https://api.football-data.org/v4/competitions/WC/teams?season=2026')
  if (!teamsData?.teams?.length) {
    console.error('❌  No teams returned — WC 2026 squads may not be published yet on football-data.org')
    console.log('\n💡  If squads are not available yet, run this script again closer to the tournament.')
    process.exit(1)
  }

  console.log(`   Found ${teamsData.teams.length} teams\n`)

  let totalPlayers = 0

  for (const team of teamsData.teams) {
    console.log(`\n🏳️  ${team.name} (${team.squad?.length ?? 0} players)`)

    if (!team.squad?.length) {
      console.log('   ⚠️  No squad data yet — skipping')
      continue
    }

    const tier = TEAM_TIER[team.name] ?? 3

    const rows = team.squad.map((player: any, idx: number) => ({
      name:     player.name,
      team:     team.name,
      position: mapPosition(player.position ?? 'Forward'),
      cost:     calcCost(player.position ?? 'Forward', tier, idx),
    }))

    const { error } = await supabase
      .from('players')
      .upsert(rows, { onConflict: 'name,team' })  // prevent dupes on re-run

    if (error) {
      console.error(`   ❌  Insert failed for ${team.name}: ${error.message}`)
    } else {
      console.log(`   ✅  ${rows.length} players inserted`)
      totalPlayers += rows.length
    }

    // Be kind to the rate limiter between teams
    await sleep(500)
  }

  console.log(`\n🏁  Done. ${totalPlayers} players seeded into the players table.`)
}

seed().catch(err => { console.error('Fatal:', err); process.exit(1) })