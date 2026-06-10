// scripts/seedMatches.ts
// Pulls 2022 data from local JSON file (no network request needed)
// Pulls 2026 data from football-data.org (requires FOOTBALL_DATA_API_KEY)
//
// Usage:
//   npx tsx scripts/seedMatches.ts
//
// Required .env vars:
//   FOOTBALL_DATA_API_KEY   — your X-Auth-Token from football-data.org
//   VITE_SUPABASE_URL       — your Supabase project URL
//   VITE_SUPABASE_ANON_KEY  — your Supabase anon key

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

config()

// ── Supabase client ──────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

// ── Shared helpers ───────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const seenTeams = new Set<string>()

async function upsertTeamById(id: string, name: string, code: string, flagUrl: string) {
  if (seenTeams.has(id)) return
  seenTeams.add(id)

  const { error } = await supabase.from('teams').upsert({
    id,
    name,
    code,
    flag_url: flagUrl,
    group_letter: null,
  }, { onConflict: 'id' })

  if (error) {
    console.error(`  ⚠️  Team upsert failed for ${name}: ${error.message}`)
  }
}

// ── ─────────────────────────────────────────────────────────────────────────
// 2022 — Local OpenFootball JSON File
// Flat structure: { matches: [ { round, date, time, team1, team2, score, group, ground } ] }
// ── ─────────────────────────────────────────────────────────────────────────

interface OFScore {
  ft: [number, number]
  ht?: [number, number]
  et?: [number, number]
  p?: [number, number]   // penalty shootout scores
}

interface OFMatch {
  round: string          // e.g. "Matchday 1", "Round of 16", "Final"
  date: string           // "2022-11-20"
  time?: string          // "19:00"
  team1: string          // plain name e.g. "Argentina"
  team2: string
  score?: OFScore
  group?: string         // "Group A"
  ground?: string        // "Lusail Iconic Stadium, Lusail"
}

interface OFData {
  name?: string
  matches: OFMatch[]     // flat array — NOT rounds[]
}

// Map full country names to 3-letter codes
const NAME_TO_CODE: Record<string, string> = {
  'Qatar':        'QAT', 'Ecuador':      'ECU', 'Senegal':      'SEN',
  'Netherlands':  'NED', 'England':      'ENG', 'Iran':         'IRN',
  'USA':          'USA', 'Wales':        'WAL', 'Argentina':    'ARG',
  'Saudi Arabia': 'SAU', 'Denmark':      'DEN', 'Tunisia':      'TUN',
  'Mexico':       'MEX', 'Poland':       'POL', 'France':       'FRA',
  'Australia':    'AUS', 'Morocco':      'MAR', 'Croatia':      'CRO',
  'Germany':      'GER', 'Japan':        'JPN', 'Spain':        'ESP',
  'Costa Rica':   'CRC', 'Belgium':      'BEL', 'Canada':       'CAN',
  'Switzerland':  'SUI', 'Cameroon':     'CMR', 'Uruguay':      'URU',
  'South Korea':  'KOR', 'Portugal':     'POR', 'Ghana':        'GHA',
  'Brazil':       'BRA', 'Serbia':       'SRB',
}

const FLAG_MAP: Record<string, string> = {
  QAT: 'qa', ECU: 'ec', SEN: 'sn', NED: 'nl', ENG: 'gb-eng', IRN: 'ir',
  USA: 'us', WAL: 'gb-wls', ARG: 'ar', SAU: 'sa', DEN: 'dk', TUN: 'tn',
  MEX: 'mx', POL: 'pl', FRA: 'fr', AUS: 'au', MAR: 'ma', CRO: 'hr',
  GER: 'de', JPN: 'jp', ESP: 'es', CRC: 'cr', BEL: 'be', CAN: 'ca',
  SUI: 'ch', CMR: 'cm', URU: 'uy', KOR: 'kr', POR: 'pt', GHA: 'gh',
  BRA: 'br', SRB: 'rs',
}

function getFlagUrl(code: string): string {
  const iso = FLAG_MAP[code.toUpperCase()]
  return iso ? `https://flagcdn.com/w80/${iso}.png` : ''
}

function getCode(name: string): string {
  return NAME_TO_CODE[name] ?? name.slice(0, 3).toUpperCase()
}

function teamId2022(code: string): string {
  return `of-2022-${code.toUpperCase()}`
}

function adaptStage2022(roundName: string): string {
  const n = roundName.toLowerCase()
  if (n.includes('matchday') || n.includes('group')) return 'group'
  if (n.includes('round of 16'))    return 'round-of-16'
  if (n.includes('quarter'))        return 'quarter-final'
  if (n.includes('semi'))           return 'semi-final'
  if (n.includes('third') || n.includes('third place') || n.includes('match for third')) return 'third-place'
  if (n.includes('final'))          return 'final'
  return 'group'
}

async function seed2022FromOpenFootball() {
  const filePath = path.join(process.cwd(), 'scripts/data/worldcup2022.json')

  console.log('\n📖  Reading 2022 World Cup fixtures from local file...')

  let data: OFData
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌  Local file missing at: ${filePath}\nPlease save the 2022 JSON there first.`)
      return
    }
    const rawData = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(rawData)

    // Handle both flat { matches: [] } and wrapped [ { matches: [] } ] structures
    data = (Array.isArray(parsed) ? parsed[0] : parsed) as OFData
  } catch (err) {
    console.error(`❌  Failed to read or parse local 2022 JSON: ${err}`)
    return
  }

  if (!data.matches || data.matches.length === 0) {
    console.warn('⚠️  Local JSON data contains no matches. Skipping 2022.')
    return
  }

  console.log(`   Found ${data.matches.length} matches. Upserting...`)

  let total = 0

  for (let i = 0; i < data.matches.length; i++) {
    const match = data.matches[i]

    const homeCode = getCode(match.team1)
    const awayCode = getCode(match.team2)
    const homeId   = teamId2022(homeCode)
    const awayId   = teamId2022(awayCode)

    await upsertTeamById(homeId, match.team1, homeCode, getFlagUrl(homeCode))
    await upsertTeamById(awayId, match.team2, awayCode, getFlagUrl(awayCode))

    const kickoff = match.time
      ? new Date(`${match.date}T${match.time}:00Z`).toISOString()
      : new Date(`${match.date}T12:00:00Z`).toISOString()

    // FIX: use null for unplayed scores, not 0.
    // Use et score if available (includes extra time), otherwise ft, otherwise null.
    const homeScore: number | null = match.score?.et?.[0] ?? match.score?.ft?.[0] ?? null
    const awayScore: number | null = match.score?.et?.[1] ?? match.score?.ft?.[1] ?? null

    // FIX: seed penalty shootout data from score.p field
    const homeScorePens: number | null = match.score?.p?.[0] ?? null
    const awayScorePens: number | null = match.score?.p?.[1] ?? null
    const decidedByPens = homeScorePens !== null && awayScorePens !== null

    const status    = homeScore !== null ? 'finished' : 'upcoming'
    const stage     = adaptStage2022(match.round)

    // FIX: extract group letter from "Group A" → "A"
    const groupLetter = match.group
      ? match.group.replace(/^Group\s*/i, '').trim() || null
      : null

    const { error } = await supabase.from('matches').upsert({
      id:              `of-2022-${i + 1}`,
      home_team_id:    homeId,
      away_team_id:    awayId,
      stadium_id:      null,
      stage,
      group_letter:    groupLetter,
      // FIX: null for unplayed matches, not 0
      home_score:      homeScore,
      away_score:      awayScore,
      home_score_pens: homeScorePens,
      away_score_pens: awayScorePens,
      decided_by_pens: decidedByPens,
      minute:          status === 'finished' ? 90 : 0,
      status,
      home_possession: 50,
      kickoff_at:      kickoff,
    }, { onConflict: 'id' })

    if (error) {
      console.error(`  ⚠️  Match upsert failed (${match.team1} vs ${match.team2}): ${error.message}`)
    } else {
      const scoreStr = homeScore !== null
        ? ` ${homeScore}-${awayScore}${decidedByPens ? ` (pens ${homeScorePens}-${awayScorePens})` : ''}`
        : ''
      console.log(`  ✅  [${stage}] ${match.team1} vs ${match.team2}${scoreStr} (${status})`)
      total++
    }
  }

  console.log(`\n✅  2022 seeding complete (${total}/${data.matches.length} matches upserted).`)
}

// ── ─────────────────────────────────────────────────────────────────────────
// 2026 — football-data.org
// ── ─────────────────────────────────────────────────────────────────────────

interface FDTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

interface FDScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

interface FDMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  homeTeam: FDTeam
  awayTeam: FDTeam
  score: FDScore
}

interface FDResponse {
  matches: FDMatch[]
  resultSet?: { count: number }
}

async function fdFetch(url: string): Promise<FDResponse | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY
  if (!apiKey) {
    console.error('❌  FOOTBALL_DATA_API_KEY is not set in .env')
    process.exit(1)
  }

  const res = await fetch(url, {
    headers: { 'X-Auth-Token': apiKey },
  })

  const remaining   = res.headers.get('X-Requests-Available-Minute')
  const waitSeconds = res.headers.get('X-RequestCounter-Reset')

  if (res.status === 429) {
    const wait = waitSeconds ? parseInt(waitSeconds) : 60
    console.warn(`⏳  Rate limited. Waiting ${wait}s before retrying...`)
    await sleep(wait * 1000)
    return fdFetch(url)
  }

  if (!res.ok) {
    console.error(`❌  API error ${res.status} for ${url}: ${await res.text()}`)
    return null
  }

  if (remaining && parseInt(remaining) <= 2) {
    console.warn(`⏳  Only ${remaining} requests left this minute — pausing 60s...`)
    await sleep(60_000)
  }

  return res.json() as Promise<FDResponse>
}

function adaptStatus2026(status: string): 'upcoming' | 'live' | 'finished' {
  if (status === 'FINISHED')                          return 'finished'
  if (status === 'IN_PLAY' || status === 'PAUSED')    return 'live'
  return 'upcoming'
}

function adaptStage2026(stage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE:    'group',
    ROUND_OF_16:    'round_of_16',
    QUARTER_FINALS: 'quarter_final',
    SEMI_FINALS:    'semi_final',
    THIRD_PLACE:    'third_place',
    FINAL:          'final',
  }
  return map[stage] ?? stage.toLowerCase().replace(/_/g, '-')
}

async function upsertFDMatch(m: FDMatch, season: number) {
  if (!m.homeTeam?.id || !m.awayTeam?.id || !m.homeTeam?.name || !m.awayTeam?.name) {
    console.log(`  ⏭️  Skipping TBD match (${adaptStage2026(m.stage)}) — teams not yet determined`)
    return
  }

  await upsertTeamById(String(m.homeTeam.id), m.homeTeam.name, m.homeTeam.tla, m.homeTeam.crest)
  await upsertTeamById(String(m.awayTeam.id), m.awayTeam.name, m.awayTeam.tla, m.awayTeam.crest)

  const matchStatus = adaptStatus2026(m.status)

  // FIX: extract group letter from "GROUP_A" → "A"
  const groupLetter = m.stage === 'GROUP_STAGE' && m.group
    ? m.group.replace(/^GROUP_/i, '').trim() || null
    : null

  // FIX: null for unplayed scores, not 0
  const homeScore: number | null = matchStatus === 'upcoming' ? null : (m.score.fullTime.home ?? null)
  const awayScore: number | null = matchStatus === 'upcoming' ? null : (m.score.fullTime.away ?? null)

  const { error } = await supabase.from('matches').upsert({
    id:              `fd-${season}-${m.id}`,
    home_team_id:    String(m.homeTeam.id),
    away_team_id:    String(m.awayTeam.id),
    stadium_id:      null,
    stage:           adaptStage2026(m.stage),
    group_letter:    groupLetter,
    home_score:      homeScore,
    away_score:      awayScore,
    // Penalty data not available from football-data.org basic tier;
    // update manually or via a webhook when knockout rounds are decided.
    home_score_pens: null,
    away_score_pens: null,
    decided_by_pens: false,
    minute:          0,
    status:          matchStatus,
    home_possession: 50,
    kickoff_at:      m.utcDate,
  }, { onConflict: 'id' })

  if (error) {
    console.error(`  ⚠️  Match upsert failed (${m.homeTeam.name} vs ${m.awayTeam.name}): ${error.message}`)
  } else {
    const score = homeScore !== null ? ` ${homeScore}-${awayScore}` : ''
    console.log(`  ✅  [${adaptStage2026(m.stage)}] ${m.homeTeam.name} vs ${m.awayTeam.name}${score} [${matchStatus}]`)
  }
}

async function seed2026FromFootballData() {
  const url = `https://api.football-data.org/v4/competitions/WC/matches?season=2026`

  console.log('\n📡  Fetching 2026 World Cup fixtures from football-data.org...')
  const data = await fdFetch(url)

  if (!data) {
    console.warn('⚠️  No data returned for 2026. Skipping.')
    return
  }

  if (!data.matches || data.matches.length === 0) {
    console.warn('⚠️  2026 returned 0 matches.')
    return
  }

  console.log(`   Found ${data.matches.length} matches. Upserting...`)

  for (const match of data.matches) {
    await upsertFDMatch(match, 2026)
  }

  console.log(`\n✅  2026 seeding complete (${data.matches.length} matches processed).`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌍  World Cup Live — Seeding matches\n')

  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
  }

  if (!process.env.FOOTBALL_DATA_API_KEY) {
    console.error('❌  Missing FOOTBALL_DATA_API_KEY in .env')
    process.exit(1)
  }

  // 2022 — local OpenFootball JSON
  await seed2022FromOpenFootball()

  console.log('\n⏳  Pausing 10s before 2026...')
  await sleep(10_000)

  // 2026 — football-data.org
  await seed2026FromFootballData()

  console.log('\n🏁  All done. Check your Supabase matches table.')
  console.log('    Next: set VITE_USE_MOCK_DATA=false in .env and restart dev server.')
}

seed().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})