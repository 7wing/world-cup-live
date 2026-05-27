// src/api/adapters/footballDataAdapter.ts
// Transforms football-data.org API responses into MockMatch shape.
// Use to seed Supabase from a real API in Phase 6.

import type { MockMatch } from '@/utils/mockData'

interface FootballDataTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

interface FootballDataScore {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

interface FootballDataMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  homeTeam: FootballDataTeam
  awayTeam: FootballDataTeam
  score: FootballDataScore
  venue?: string
}

interface FootballDataResponse {
  matches: FootballDataMatch[]
}

function adaptStatus(status: string): MockMatch['status'] {
  if (status === 'FINISHED') return 'finished'
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'live'
  return 'upcoming'
}

export function adaptFootballDataMatch(m: FootballDataMatch): MockMatch {
  const d = new Date(m.utcDate)
  return {
    id: `fd-${m.id}`,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeFlag: '',
    awayFlag: '',
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
    stage: m.stage,
    group: m.group ?? undefined,
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    venue: m.venue ?? '',
    city: '',
    status: adaptStatus(m.status),
  }
}

export function adaptFootballDataList(response: FootballDataResponse): MockMatch[] {
  return response.matches.map(adaptFootballDataMatch)
}