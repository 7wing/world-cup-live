// supabase/functions/sync-matches/index.ts
// Supabase Edge Function — syncs live 2026 FIFA World Cup match data from
// football-data.org (primary) with ESPN (fallback) into the matches table.
//
// Deploy: supabase functions deploy sync-matches
// Secrets needed (Supabase dashboard → Edge Functions → Secrets):
//   FOOTBALL_DATA_API_KEY   – from football-data.org
//   SUPABASE_URL            – injected automatically
//   SUPABASE_SERVICE_ROLE_KEY – injected automatically

import { serve } from 'std/http/server'
import { createClient } from '@supabase/supabase-js'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface Team {
  id: string
  name: string
}

interface MatchRow {
  id: string
  home_team_id: string | null
  away_team_id: string | null
  home_score: number | null
  away_score: number | null
  home_score_pens: number | null
  away_score_pens: number | null
  decided_by_pens: boolean
  status: 'upcoming' | 'live' | 'finished'
  minute: number
  home_possession: number
  stage: string
  group_letter: string | null
  kickoff_at: string
}

interface MatchEventRow {
  match_id: string
  team_id: string | null
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'corner' | 'shot' | 'penalty' | 'kick_off' | 'half_time' | 'full_time'
  player_name: string | null
  player_in: string | null
  minute: number | null
  extra_time: boolean
  description: string | null
}

interface MatchStatsRow {
  match_id: string
  home_shots: number | null
  away_shots: number | null
  home_shots_on_target: number | null
  away_shots_on_target: number | null
  home_corners: number | null
  away_corners: number | null
  home_fouls: number | null
  away_fouls: number | null
  home_yellow_cards: number | null
  away_yellow_cards: number | null
  home_red_cards: number | null
  away_red_cards: number | null
  home_passes: number | null
  away_passes: number | null
  home_pass_accuracy: number | null
  away_pass_accuracy: number | null
  home_possession: number | null
}

interface LineupRow {
  match_id: string
  team_id: string
  player_name: string
  player_number: number | null
  position: 'GK' | 'DEF' | 'MID' | 'FWD' | null
  position_x: number | null
  position_y: number | null
  is_starter: boolean
  is_captain: boolean
}

// football-data.org types
interface FDFixture {
  id: number
  utcDate: string
  status: 'TIMED' | 'IN_PLAY' | 'FINISHED' | 'PAUSED' | 'SUSPENDED' | 'CANCELLED' | 'POSTPONED'
  matchday: number | null
  stage: string
  group: string | null
  homeTeam: { id: number; name: string; shortName: string; tla: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
    extraTime: { home: number | null; away: number | null }
    penalties: { home: number | null; away: number | null }
  }
  minute?: number
  elapsed?: number
}

interface FDFixturesResponse {
  competitions: string
  count: number
  filters: object
  competition: { id: number; name: string; code: string; type: string }
  matches: FDFixture[]
}

// ESPN types
interface ESPNEvent {
  id: string
  date: string
  name: string
  competitions: Array<{
    competitors: Array<{
      id: string
      homeAway: string
      team: { id: string; name: string; shortDisplayName: string; abbreviation: string }
      score: string
      linescores: Array<{ value: number }>
    }>
    status: { clock: number; displayClock: string; period: number; type: { id: string; name: string; state: string } }
  }>
}

interface ESPNScoreboard {
  events: ESPNEvent[]
}

interface ESPNStatItem {
  name: string
  displayValue: string
  value: number
}

interface ESPNPlayer {
  athlete: { id: string; displayName: string; jersey: string; position: { abbreviation: string } }
  statistics: ESPNStatItem[]
  position: { abbreviation: string }
  captain: boolean
  starter: boolean
}

interface ESPNSummary {
  boxscore?: {
    teams: Array<{
      team: { id: string; name: string }
      stats: ESPNStatItem[]
      players: ESPNPlayer[]
    }>
  }
  leaders?: Array<{
    leaders: Array<{
      athlete: { displayName: string }
      value: number
    }>
  }>
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function mapFDStatus(status: FDFixture['status']): 'upcoming' | 'live' | 'finished' {
  switch (status) {
    case 'TIMED':
      return 'upcoming'
    case 'IN_PLAY':
    case 'PAUSED':
      return 'live'
    case 'FINISHED':
    case 'SUSPENDED':
    case 'CANCELLED':
    case 'POSTPONED':
      return 'finished'
    default:
      return 'upcoming'
  }
}

function extractGroupLetter(group: string | null): string | null {
  if (!group) return null
  const match = group.match(/GROUP[_\s]?([A-Z])/i)
  return match ? match[1] : null
}

function normalizeTeamName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

// --------------------------------------------------------------------------
// API Clients
// --------------------------------------------------------------------------

const FD_BASE = 'https://api.football-data.org/v4'
const ESPN_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'

async function fetchFD(path: string): Promise<Response> {
  const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY')
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY not set')

  return fetch(`${FD_BASE}${path}`, {
    headers: {
      'X-Auth-Token': apiKey,
    },
  })
}

async function fetchESPN(url: string): Promise<Response> {
  return fetch(url)
}

// --------------------------------------------------------------------------
// Sync from football-data.org
// --------------------------------------------------------------------------

async function syncFromFootballData(
  supabase: any,
  idToNormName: Map<string, string>,
  _normNameToIds: Map<string, string[]>,
  _aliases: Record<string, string[]>,
): Promise<{ synced: number; errors: string[] }> {
  let synced = 0
  const errors: string[] = []

  try {
    // Fetch all 2026 WC matches (single request for all stages)
    const res = await fetchFD('/competitions/WC/matches?season=2026')
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`football-data returned ${res.status}: ${text}`)
    }

    const data: FDFixturesResponse = await res.json()
    const fixtures = data.matches ?? []

    console.log(`[sync] Found ${fixtures.length} fixtures from football-data`)

    for (const fixture of fixtures) {
      // Skip 2022 matches (they have different IDs)
      // football-data 2026 WC matches are from the 2026 competition
      const matchId = `fd-2026-${fixture.id}`

      // Try to find match by ID first, then by date+teams
      let existingMatchId = matchId
      let { data: existing } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle()

      if (!existing) {
        let homeTeamId: string | null = null
        let awayTeamId: string | null = null
        const hNorm = normalizeTeamName(fixture.homeTeam.name)
        const aNorm = normalizeTeamName(fixture.awayTeam.name)
        for (const [id, n] of idToNormName) {
          if (n === hNorm) homeTeamId = id
          if (n === aNorm) awayTeamId = id
        }
        if (homeTeamId && awayTeamId) {
          const { data: byTeams } = await supabase
            .from('matches')
            .select('*')
            .eq('kickoff_at', fixture.utcDate)
            .eq('home_team_id', homeTeamId)
            .eq('away_team_id', awayTeamId)
            .maybeSingle()
          if (byTeams) {
            existing = byTeams
            existingMatchId = byTeams.id
          }
        }
      }

      // Map status
      const status = mapFDStatus(fixture.status)
      const minute = fixture.status === 'IN_PLAY' || fixture.status === 'PAUSED'
        ? (fixture.minute ?? fixture.elapsed ?? 0)
        : (fixture.status === 'FINISHED' ? 90 : 0)

      // Extract group letter
      const groupLetter = extractGroupLetter(fixture.group)

      // Try to get team IDs by name matching against all known IDs
      let homeTeamIdFD: string | null = null
      let awayTeamIdFD: string | null = null
      const hNorm2 = normalizeTeamName(fixture.homeTeam.name)
      const aNorm2 = normalizeTeamName(fixture.awayTeam.name)
      for (const [id, n] of idToNormName) {
        if (n === hNorm2) homeTeamIdFD = id
        if (n === aNorm2) awayTeamIdFD = id
      }

      // Map stage (simplify for common stages)
      let stage = fixture.stage ?? 'UNKNOWN'
      // Normalize stage names
      if (stage === 'GROUP_STAGE') stage = 'Group Stage'
      else if (stage === 'ROUND_OF_16') stage = 'Round of 16'
      else if (stage === 'QUARTER_FINALS') stage = 'Quarter-finals'
      else if (stage === 'SEMI_FINALS') stage = 'Semi-finals'
      else if (stage === 'THIRD_PLACE') stage = 'Third Place'
      else if (stage === 'FINAL') stage = 'Final'

      // Check for penalty shootout
      const hasPens = fixture.score.penalties?.home !== null || fixture.score.penalties?.away !== null
      const decidedByPens = hasPens && status === 'finished'

      const updateData: Partial<MatchRow> = {
        status,
        minute,
        home_score: fixture.score.fullTime.home,
        away_score: fixture.score.fullTime.away,
        home_score_pens: decidedByPens ? (fixture.score.penalties?.home ?? null) : null,
        away_score_pens: decidedByPens ? (fixture.score.penalties?.away ?? null) : null,
        decided_by_pens: decidedByPens,
        stage: groupLetter ? `Group ${groupLetter}` : stage,
        group_letter: groupLetter,
        kickoff_at: fixture.utcDate,
        home_team_id: homeTeamIdFD,
        away_team_id: awayTeamIdFD,
      }

      if (existing) {
        const { error } = await supabase
          .from('matches')
          .update(updateData)
          .eq('id', existingMatchId)
        if (error) {
          errors.push(`Failed to update ${existingMatchId}: ${error.message}`)
        } else {
          synced++
        }
      } else {
        // Insert new match
        const insertData: MatchRow = {
          id: matchId,
          status,
          minute,
          home_score: fixture.score.fullTime.home,
          away_score: fixture.score.fullTime.away,
          home_score_pens: decidedByPens ? (fixture.score.penalties?.home ?? null) : null,
          away_score_pens: decidedByPens ? (fixture.score.penalties?.away ?? null) : null,
          decided_by_pens: decidedByPens,
          stage: groupLetter ? `Group ${groupLetter}` : stage,
          group_letter: groupLetter,
          kickoff_at: fixture.utcDate,
          home_team_id: homeTeamIdFD,
          away_team_id: awayTeamIdFD,
          home_possession: 50,
        }
        const { error } = await supabase
          .from('matches')
          .insert(insertData)
        if (error) {
          errors.push(`Failed to insert ${matchId}: ${error.message}`)
        } else {
          synced++
          console.log(`[sync] Created new match: ${matchId}`)
        }
      }
    }
  } catch (err) {
    console.error('[sync] football-data error:', err)
    errors.push(`football-data error: ${err}`)
  }

  return { synced, errors }
}

// --------------------------------------------------------------------------
// ESPN Fallback
// --------------------------------------------------------------------------

async function syncFromESPN(
  supabase: any,
  idToNormName: Map<string, string>,
  normNameToIds: Map<string, string[]>,
  aliases: Record<string, string[]>,
): Promise<{ synced: number; errors: string[] }> {
  let synced = 0
  const errors: string[] = []

  try {
    // Fetch ESPN scoreboard
    const res = await fetchESPN(ESPN_SCOREBOARD)
    if (!res.ok) {
      throw new Error(`ESPN scoreboard returned ${res.status}`)
    }

    const scoreboard: ESPNScoreboard = await res.json()
    const events = scoreboard.events ?? []

    console.log(`[sync] Found ${events.length} events from ESPN`)

    // Fetch all existing 2026 matches to sync status & score transitions
    const { data: matches } = await supabase
      .from('matches')
      .select('id, home_team_id, away_team_id, status, kickoff_at')
      .not('id', 'like', 'of-2022%')

    if (!matches || matches.length === 0) {
      console.log('[sync] No 2026 matches to sync from ESPN')
      return { synced: 0, errors: [] }
    }

    // Build match date to match ID map
    const matchDateToIds = new Map<string, typeof matches>()
    for (const m of matches) {
      const dateKey = m.kickoff_at.split('T')[0]
      if (!matchDateToIds.has(dateKey)) {
        matchDateToIds.set(dateKey, [])
      }
      matchDateToIds.get(dateKey)!.push(m)
    }

    // Process each ESPN event
    for (const event of events) {
      const eventDate = event.date.split('T')[0]
      const potentialMatches = matchDateToIds.get(eventDate) ?? []

      if (potentialMatches.length === 0) continue

      const competition = event.competitions[0]
      if (!competition) continue

      const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home')
      const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away')

      if (!homeCompetitor || !awayCompetitor) continue

      // Find matching match by comparing team names via id→name map
      const homeNorm = normalizeTeamName(homeCompetitor.team.name)
      const awayNorm = normalizeTeamName(awayCompetitor.team.name)

      // Build alias set for more flexible matching
      const homeAliases = new Set([homeNorm, ...(aliases[homeNorm] || [])])
      const awayAliases = new Set([awayNorm, ...(aliases[awayNorm] || [])])

      let matchedMatch = null
      for (const m of potentialMatches) {
        const dbHomeNorm = idToNormName.get(m.home_team_id) ?? ''
        const dbAwayNorm = idToNormName.get(m.away_team_id) ?? ''

        const homeMatch = homeAliases.has(dbHomeNorm)
        const awayMatch = awayAliases.has(dbAwayNorm)

        if (homeMatch && awayMatch) {
          matchedMatch = m
          break
        }
      }

      if (!matchedMatch) continue

      const matchId = matchedMatch.id

      // Map status
      const statusType = competition.status?.type
      let status: 'upcoming' | 'live' | 'finished' = 'upcoming'
      if (statusType?.state === 'in') status = 'live'
      else if (statusType?.state === 'post') status = 'finished'

      // Parse scores
      const homeScore = homeCompetitor.score ? parseInt(homeCompetitor.score) : null
      const awayScore = awayCompetitor.score ? parseInt(awayCompetitor.score) : null

      // Update match
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          status,
          minute: status === 'live' ? Math.round((competition.status?.clock ?? 0) / 60) : 0,
          home_score: homeScore,
          away_score: awayScore,
        })
        .eq('id', matchId)

      if (matchError) {
        errors.push(`ESPN match update failed for ${matchId}: ${matchError.message}`)
        continue
      }

      synced++

      // Fetch detailed summary for events, stats, lineups
      const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event.id}`
      await syncESPNDetails(supabase, summaryUrl, String(event.id), matchId, idToNormName, normNameToIds, aliases, matchedMatch)
    }
  } catch (err) {
    console.error('[sync] ESPN error:', err)
    errors.push(`ESPN error: ${err}`)
  }

  return { synced, errors }
}

async function syncESPNDetails(
  supabase: any,
  summaryUrl: string,
  eventId: string,
  matchId: string,
  idToNormName: Map<string, string>,
  normNameToIds: Map<string, string[]>,
  aliases: Record<string, string[]>,
  matchedMatch: { id: string; home_team_id: string | null; away_team_id: string | null },
): Promise<void> {
  try {
    const res = await fetchESPN(summaryUrl)
    if (!res.ok) {
      console.error(`[sync] ESPN summary fetch failed: ${res.status}`)
      return
    }

    const summary: ESPNSummary = await res.json()

    if (!summary.boxscore) return

    // Accumulate stats for both teams
    const homeStats: ExtractedStats = {}
    const awayStats: ExtractedStats = {}

    for (const teamBox of summary.boxscore.teams) {
      const boxNorm = normalizeTeamName(teamBox.team.name)
      const boxAliases = new Set([boxNorm, ...(aliases[boxNorm] || [])])
      // Find the DB team ID that matches this boxscore team and is one of the match teams
      let teamId: string | null = null
      for (const [id, n] of idToNormName) {
        if (boxAliases.has(n) && (id === matchedMatch.home_team_id || id === matchedMatch.away_team_id)) {
          teamId = id
          break
        }
      }
      if (!teamId) continue

      const teamStats = extractTeamStats(teamBox.stats)
      if (teamId === matchedMatch.home_team_id) {
        Object.assign(homeStats, teamStats)
      } else if (teamId === matchedMatch.away_team_id) {
        Object.assign(awayStats, teamStats)
      }

      // Parse lineups
      const lineups = parseESPNLineups(teamBox.players, matchId, teamId)
      if (lineups.length > 0) {
        const { error } = await supabase
          .from('lineups')
          .upsert(lineups, { onConflict: 'id' })
        if (error) console.error(`[sync] Lineups upsert error: ${error.message}`)
      }
    }

    // Merge and upsert match stats
    const mergedStats: MatchStatsRow = {
      match_id: matchId,
      home_shots: homeStats.shots ?? null,
      away_shots: awayStats.shots ?? null,
      home_shots_on_target: homeStats.shotsOnTarget ?? null,
      away_shots_on_target: awayStats.shotsOnTarget ?? null,
      home_corners: homeStats.corners ?? null,
      away_corners: awayStats.corners ?? null,
      home_fouls: homeStats.fouls ?? null,
      away_fouls: awayStats.fouls ?? null,
      home_yellow_cards: homeStats.yellowCards ?? null,
      away_yellow_cards: awayStats.yellowCards ?? null,
      home_red_cards: homeStats.redCards ?? null,
      away_red_cards: awayStats.redCards ?? null,
      home_passes: homeStats.totalPasses ?? null,
      away_passes: awayStats.totalPasses ?? null,
      home_pass_accuracy: homeStats.passingAccuracy ?? null,
      away_pass_accuracy: awayStats.passingAccuracy ?? null,
      home_possession: homeStats.possession ?? null,
    }
    const { error: statsError } = await supabase
      .from('match_stats')
      .upsert(mergedStats, { onConflict: 'match_id' })
    if (statsError) console.error(`[sync] Stats upsert error: ${statsError.message}`)

    // Parse match events from ESPN plays API
    const events = await parseESPNEvents(eventId, matchId, idToNormName, aliases)
    if (events.length > 0) {
      const { error } = await supabase
        .from('match_events')
        .insert(events)
      if (error) console.error(`[sync] Events insert error: ${error.message}`)
    }
  } catch (err) {
    console.error(`[sync] ESPN details error for ${matchId}:`, err)
  }
}

interface ExtractedStats {
  shots?: number | null
  shotsOnTarget?: number | null
  corners?: number | null
  fouls?: number | null
  yellowCards?: number | null
  redCards?: number | null
  totalPasses?: number | null
  passingAccuracy?: number | null
  possession?: number | null
}

function extractTeamStats(stats: ESPNStatItem[]): ExtractedStats {
  const getStat = (name: string): number | null => {
    const stat = stats.find(s => s.name === name)
    return stat?.value ?? null
  }

  const getStatPct = (name: string): number | null => {
    const stat = stats.find(s => s.name === name)
    if (!stat) return null
    const val = parseFloat(stat.displayValue?.replace('%', '') ?? '0')
    return isNaN(val) ? null : val
  }

  return {
    shots: getStat('shots'),
    shotsOnTarget: getStat('shotsOnTarget'),
    corners: getStat('corners'),
    fouls: getStat('fouls'),
    yellowCards: getStat('yellowCards'),
    redCards: getStat('redCards'),
    totalPasses: getStat('totalPasses'),
    passingAccuracy: getStatPct('passingAccuracy'),
    possession: getStatPct('poss'),
  }
}

function parseESPNLineups(
  players: ESPNPlayer[] | undefined,
  matchId: string,
  teamId: string,
): LineupRow[] {
  if (!players || !Array.isArray(players)) return []

  return players.map(player => {
    const athlete = player.athlete
    const posAbbrev = athlete.position?.abbreviation ?? player.position?.abbreviation ?? ''
    const position: LineupRow['position'] =
      posAbbrev === 'GK' ? 'GK' :
      posAbbrev === 'DEF' ? 'DEF' :
      posAbbrev === 'MID' ? 'MID' :
      posAbbrev === 'FWD' ? 'FWD' : null

    return {
      match_id: matchId,
      team_id: teamId,
      player_name: athlete.displayName,
      player_number: athlete.jersey ? parseInt(athlete.jersey) : null,
      position,
      position_x: null,
      position_y: null,
      is_starter: player.starter ?? false,
      is_captain: player.captain ?? false,
    }
  })
}

async function fetchESPNPlays(eventId: string): Promise<any[]> {
  try {
    const url = `https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/events/${eventId}/competitions/${eventId}/plays`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.items ?? []
  } catch {
    return []
  }
}

function mapESPNPlayToEvent(
  play: any,
  matchId: string,
  idToNormName: Map<string, string>,
  homeTeamId: string | null,
  awayTeamId: string | null,
  aliases: Record<string, string[]>,
): MatchEventRow | null {
  const type = play.type?.text as string | undefined
  const text = play.text as string | undefined
  if (!type && !text) return null

  let eventType: MatchEventRow['event_type'] | null = null

  // Map play type to our schema
  const lowerType = (type ?? text ?? '').toLowerCase()
  if (lowerType.includes('goal') && !lowerType.includes('own goal')) eventType = 'goal'
  else if (lowerType.includes('own goal')) eventType = 'goal'
  else if (lowerType.includes('yellow card')) eventType = 'yellow_card'
  else if (lowerType.includes('red card')) eventType = 'red_card'
  else if (lowerType.includes('substitution')) eventType = 'substitution'
  else if (lowerType.includes('corner')) eventType = 'corner'
  else if (lowerType.includes('kickoff')) eventType = 'kick_off'
  else if (lowerType.includes('half time')) eventType = 'half_time'
  else if (lowerType.includes('full time') || lowerType.includes('end')) eventType = 'full_time'
  else if (lowerType.includes('penalty')) eventType = 'penalty'

  if (!eventType) return null

  const teamName = play.team?.displayName as string | undefined
  let teamId: string | null = null
  if (teamName) {
    const tNorm = normalizeTeamName(teamName)
    const tAliases = new Set([tNorm, ...(aliases[tNorm] || [])])
    for (const [id, n] of idToNormName) {
      if (tAliases.has(n) && (id === homeTeamId || id === awayTeamId)) {
        teamId = id
        break
      }
    }
  }

  const playerName = play.athletes?.[0]?.displayName ?? play.participants?.[0]?.athlete?.displayName ?? null
  const minute = play.clock?.value ? Math.round(play.clock.value / 60) : null

  return {
    match_id: matchId,
    team_id: teamId,
    event_type: eventType,
    player_name: playerName,
    player_in: null,
    minute,
    extra_time: false,
    description: text ?? null,
  }
}

async function parseESPNEvents(
  eventId: string,
  matchId: string,
  idToNormName: Map<string, string>,
  aliases: Record<string, string[]>,
  homeTeamId?: string | null,
  awayTeamId?: string | null,
): Promise<MatchEventRow[]> {
  const plays = await fetchESPNPlays(eventId)
  const events: MatchEventRow[] = []

  for (const play of plays) {
    const event = mapESPNPlayToEvent(play, matchId, idToNormName, homeTeamId ?? null, awayTeamId ?? null, aliases)
    if (event) events.push(event)
  }

  return events
}

// --------------------------------------------------------------------------
// Main Handler
// --------------------------------------------------------------------------

serve(async (req: Request) => {
  const errors: string[] = []
  let totalSynced = 0
  let source: 'football-data' | 'espn' = 'football-data'

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1. Fetch teams table for name → ID mapping
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name')

    // Build id → normalized name (avoids duplicate-name collisions)
    const idToNormName = new Map<string, string>()
    if (teams) {
      for (const team of teams) {
        idToNormName.set(team.id, normalizeTeamName(team.name))
      }
    }

    // Build normalized name → list of IDs (for reverse lookup)
    const normNameToIds = new Map<string, string[]>()
    for (const [id, n] of idToNormName) {
      if (!normNameToIds.has(n)) normNameToIds.set(n, [])
      normNameToIds.get(n)!.push(id)
    }

    // Common name aliases for cross-source matching
    const TEAM_ALIASES: Record<string, string[]> = {
      capeverde: ['capeverdeislands', 'capeverde'],
      capeverdeislands: ['capeverde', 'capeverdeislands'],
      usa: ['unitedstates', 'usa'],
      unitedstates: ['usa', 'unitedstates'],
      korearepublic: ['southkorea', 'korearepublic'],
      southkorea: ['korearepublic', 'southkorea'],
    }

    console.log(`[sync] Loaded ${idToNormName.size} teams`)

    // 2. Try ESPN first (ESPN has more reliable live minutes / real-time data)
    const espnResult = await syncFromESPN(supabase, idToNormName, normNameToIds, TEAM_ALIASES)
    totalSynced += espnResult.synced
    errors.push(...espnResult.errors)

    // 3. If ESPN synced nothing (no errors or otherwise), always try football-data
    // so we get at least status/score updates when ESPN has stale/no data.
    if (espnResult.synced === 0) {
      console.log('[sync] ESPN synced 0, trying football-data...')
      source = 'football-data'
      const fdResult = await syncFromFootballData(supabase, idToNormName, normNameToIds, TEAM_ALIASES)
      totalSynced += fdResult.synced
      errors.push(...fdResult.errors)
    } else {
      source = 'espn'
    }

    const response = {
      synced: totalSynced,
      errors: errors.length,
      errorDetails: errors.slice(0, 10), // Limit error details in response
      source,
      timestamp: new Date().toISOString(),
    }

    console.log('[sync] Complete:', response)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[sync] Fatal error:', err)
    return new Response(
      JSON.stringify({
        synced: totalSynced,
        errors: errors.length + 1,
        errorDetails: [...errors.slice(0, 9), String(err)],
        source,
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})