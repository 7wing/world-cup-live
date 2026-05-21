import {
  MATCHES_2026,
  MATCHES_2022,
  STADIUMS_2026,
  GROUPS_2026,
  GROUPS_2022,
  ORACLE_PREDICTIONS_2026,
  type MockMatch,
  type MockPost,
  type MockStadium,
  type GroupRow,
} from '@/utils/mockData'
import type { Match, Post, Stadium, Team, User } from '@/types'

const LIVE_DEMO: Record<
  string,
  Partial<MockMatch> & { home_possession?: number }
> = {
  '26-e1': { status: 'live', homeScore: 1, awayScore: 1, minute: 67, home_possession: 54 },
  '26-b1': { status: 'live', homeScore: 2, awayScore: 0, minute: 54, home_possession: 61 },
}

const stadiumByVenue = new Map(
  STADIUMS_2026.map((s) => [s.name.toLowerCase(), s]),
)

function mockStadiumToStadium(m: MockStadium): Stadium {
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    city: m.city,
    country: m.country,
    flag: m.flag,
    capacity: m.capacity,
    hero_image_url: m.hero_image_url,
    note: m.note,
    avg_atmosphere: m.avg_atmosphere,
    avg_food: m.avg_food,
    avg_hotel: m.avg_hotel,
    avg_safety: m.avg_safety,
    avg_rating: m.avg_rating,
    total_reviews: m.total_reviews,
    transport_status: m.transport_status,
    security_score: m.security_score,
    year_opened: m.year_opened,
    surface: m.surface,
    roof_type: m.roof_type,
  }
}

function resolveStadium(venue: string, city: string): Stadium {
  const found = stadiumByVenue.get(venue.toLowerCase())
  if (found) return mockStadiumToStadium(found)
  const slug = venue.toLowerCase().replace(/\s+/g, '-').slice(0, 32)
  return {
    id: slug,
    slug,
    name: venue,
    city,
    country: '',
    flag: '🏟️',
    capacity: 50000,
    hero_image_url: null,
    note: null,
    avg_atmosphere: 4,
    avg_food: 4,
    avg_hotel: 4,
    avg_safety: 4,
    avg_rating: 4,
    total_reviews: 0,
    transport_status: 'Normal',
    security_score: 90,
    year_opened: null,
    surface: 'Grass',
    roof_type: null,
  }
}

function teamFromMatch(
  name: string,
  flag: string,
  group?: string,
  suffix = '',
): Team {
  const code = name.slice(0, 3).toUpperCase()
  return {
    id: `${code}${suffix}`,
    name,
    code,
    flag_url: flag,
    group_letter: group ?? null,
  }
}

function parseKickoff(date: string, time: string): string {
  const parsed = new Date(`${date.replace(',', '')} ${time}`)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  return new Date().toISOString()
}

export function mockMatchToMatch(raw: MockMatch): Match {
  const m = { ...raw, ...(LIVE_DEMO[raw.id] ?? {}) }
  const homeScore = m.homeScore ?? 0
  const awayScore = m.awayScore ?? 0
  const override = LIVE_DEMO[raw.id]
  const possession =
    override?.home_possession ??
    (m.status === 'live' ? 58 : 50)

  return {
    id: m.id,
    home_team: teamFromMatch(m.homeTeam, m.homeFlag, m.group, '-h'),
    away_team: teamFromMatch(m.awayTeam, m.awayFlag, m.group, '-a'),
    stadium: resolveStadium(m.venue, m.city),
    stage: m.stage,
    home_score: homeScore,
    away_score: awayScore,
    minute: m.minute ?? (m.status === 'live' ? 45 : 0),
    status: m.status,
    home_possession: possession,
    kickoff_at: parseKickoff(m.date, m.time),
  }
}

export function getMockMatches(): Match[] {
  const liveAndUpcoming = MATCHES_2026.map(mockMatchToMatch)
  const recentFinished = MATCHES_2022.slice(-12).map(mockMatchToMatch)
  return [...liveAndUpcoming, ...recentFinished].sort(
    (a, b) => new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime(),
  )
}

export function getMockMatchById(id: string): Match | undefined {
  return getMockMatches().find((m) => m.id === id)
}

export type GroupCardData = {
  name: string
  teams: {
    flag: string
    name: string
    played: number
    gd: number
    pts: number
    qualified: boolean
  }[]
}

export function groupsToCards(groups: Record<string, GroupRow[]>): GroupCardData[] {
  return Object.entries(groups).map(([name, teams]) => ({
    name,
    teams: teams.map((t, i) => ({
      flag: t.flag,
      name: t.team,
      played: t.played,
      gd: t.gd,
      pts: t.pts,
      qualified: t.qualified ?? i < 2,
    })),
  }))
}

export const GROUPS_2026_CARDS = groupsToCards(GROUPS_2026)
export const GROUPS_2022_CARDS = groupsToCards(GROUPS_2022)

export type OracleData = {
  homeWin: number
  draw: number
  awayWin: number
  predictedHome: number
  predictedAway: number
  confidence: number
}

export function getStaticOracle(matchId: string): OracleData | null {
  const p = ORACLE_PREDICTIONS_2026[matchId]
  if (!p) return null
  return { ...p }
}

export function mockTimeToIso(time: string): string {
  const now = Date.now()
  const m = time.match(/(\d+)\s*(h|d)/i)
  if (!m) return new Date(now).toISOString()
  const n = parseInt(m[1], 10)
  const ms = m[2].toLowerCase() === 'h' ? n * 3_600_000 : n * 86_400_000
  return new Date(now - ms).toISOString()
}

export function mockPostToPost(mock: MockPost, userId?: string): Post {
  const uid = userId ?? `user-${mock.username}`
  const user: User = {
    id: uid,
    username: mock.username,
    avatar_url: mock.avatar,
    tier: mock.isOfficial ? 'mvp' : 'fan',
    xp: 0,
    global_rank: null,
    tribe_id: null,
  }
  return {
    id: mock.id,
    user_id: uid,
    user,
    match_id: mock.matchId ?? null,
    content: mock.content,
    media_url: mock.mediaUrl ?? null,
    media_type: mock.mediaUrl ? 'image' : null,
    likes: mock.likes,
    comment_count: mock.comments,
    is_official: mock.isOfficial,
    created_at: mockTimeToIso(mock.time),
    liked: false,
  }
}
