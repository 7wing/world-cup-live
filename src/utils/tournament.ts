import type { Match, Team } from '@/types'

export type TournamentYear = 2022 | 2026

export const KNOCKOUT_STAGES = [
  'round-of-16',
  'quarter-final',
  'semi-final',
  'final',
  'third-place',
] as const

/** Authoritative 2022 group draw (from worldcup2022.json). */
export const WC2022_GROUP_NAMES: Record<string, string[]> = {
  A: ['Ecuador', 'Netherlands', 'Qatar', 'Senegal'],
  B: ['England', 'Iran', 'USA', 'Wales'],
  C: ['Argentina', 'Mexico', 'Poland', 'Saudi Arabia'],
  D: ['Australia', 'Denmark', 'France', 'Tunisia'],
  E: ['Costa Rica', 'Germany', 'Japan', 'Spain'],
  F: ['Belgium', 'Canada', 'Croatia', 'Morocco'],
  G: ['Brazil', 'Cameroon', 'Serbia', 'Switzerland'],
  H: ['Ghana', 'Portugal', 'South Korea', 'Uruguay'],
}

/** DB was seeded before penalty columns were populated — fallback from source JSON. */
export const PENALTY_OVERRIDES: Record<string, { home: number; away: number }> = {
  'of-2022-53': { home: 1, away: 3 }, // Japan vs Croatia
  'of-2022-55': { home: 3, away: 0 }, // Morocco vs Spain
  'of-2022-57': { home: 4, away: 2 }, // Croatia vs Brazil
  'of-2022-58': { home: 3, away: 4 }, // Netherlands vs Argentina
  'of-2022-64': { home: 4, away: 2 }, // Argentina vs France
}

export function getMatchYear(id: string): TournamentYear {
  return id.startsWith('of-2022') ? 2022 : 2026
}

export function filterByYear(matches: Match[], year: TournamentYear): Match[] {
  return matches.filter((m) => getMatchYear(m.id) === year)
}

export function extractGroupLetter(match: Match): string | null {
  if (match.group_letter) return match.group_letter.toUpperCase()
  const m = match.stage.match(/^Group\s+([A-L])$/i)
  return m ? m[1].toUpperCase() : null
}

export function isGroupStageMatch(match: Match, year: TournamentYear): boolean {
  if (getMatchYear(match.id) !== year) return false
  if (year === 2026) return /^Group\s+[A-L]$/i.test(match.stage)
  return match.stage === 'group'
}

export function getPenaltyScores(match: Match): {
  home: number | null
  away: number | null
  decidedByPens: boolean
} {
  if (
    match.decided_by_pens &&
    match.home_score_pens != null &&
    match.away_score_pens != null
  ) {
    return {
      home: match.home_score_pens,
      away: match.away_score_pens,
      decidedByPens: true,
    }
  }

  const override = PENALTY_OVERRIDES[match.id]
  if (override) {
    return { home: override.home, away: override.away, decidedByPens: true }
  }

  return { home: null, away: null, decidedByPens: false }
}

export function getKnockoutWinner(match: Match): 'home' | 'away' | null {
  if (match.status !== 'finished') return null

  const pens = getPenaltyScores(match)
  if (pens.decidedByPens && pens.home != null && pens.away != null) {
    if (pens.home > pens.away) return 'home'
    if (pens.away > pens.home) return 'away'
  }

  const home = match.home_score ?? 0
  const away = match.away_score ?? 0
  if (home > away) return 'home'
  if (away > home) return 'away'
  return null
}

export interface GroupStanding {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
}

function emptyStanding(team: Team): GroupStanding {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
}

function sortStandings(rows: GroupStanding[]): GroupStanding[] {
  return [...rows].sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.name.localeCompare(b.team.name),
  )
}

function applyResult(
  table: Map<string, GroupStanding>,
  teamId: string,
  gf: number,
  ga: number,
) {
  const row = table.get(teamId)
  if (!row) return
  row.played++
  row.gf += gf
  row.ga += ga
  row.gd = row.gf - row.ga
  if (gf > ga) {
    row.won++
    row.pts += 3
  } else if (gf < ga) {
    row.lost++
  } else {
    row.drawn++
    row.pts += 1
  }
}

function computeStandingsForGroup(
  teams: Team[],
  groupMatches: Match[],
): GroupStanding[] {
  const table = new Map<string, GroupStanding>()
  for (const team of teams) table.set(team.id, emptyStanding(team))

  const teamIds = new Set(teams.map((t) => t.id))
  for (const m of groupMatches) {
    if (m.status !== 'finished') continue
    if (!teamIds.has(m.home_team.id) || !teamIds.has(m.away_team.id)) continue
    const home = m.home_score ?? 0
    const away = m.away_score ?? 0
    applyResult(table, m.home_team.id, home, away)
    applyResult(table, m.away_team.id, away, home)
  }

  return sortStandings(teams.map((t) => table.get(t.id)!))
}

export function buildGroupStandings(
  matches: Match[],
  year: TournamentYear,
): Record<string, GroupStanding[]> {
  const groups = buildGroupsFromMatches(matches, year)
  const yearMatches = filterByYear(matches, year)
  const result: Record<string, GroupStanding[]> = {}

  for (const [letter, teams] of Object.entries(groups)) {
    if (year === 2026) {
      result[letter] = sortStandings(teams.map(emptyStanding))
      continue
    }

    const names = new Set(WC2022_GROUP_NAMES[letter] ?? [])
    const teamIds = new Set(
      teams.filter((t) => names.has(t.name)).map((t) => t.id),
    )
    const groupMatches = yearMatches.filter(
      (m) =>
        isGroupStageMatch(m, 2022) &&
        teamIds.has(m.home_team.id) &&
        teamIds.has(m.away_team.id),
    )
    result[letter] = computeStandingsForGroup(teams, groupMatches)
  }

  return result
}

export function buildGroupsFromMatches(
  matches: Match[],
  year: TournamentYear,
): Record<string, Team[]> {
  const yearMatches = filterByYear(matches, year)

  if (year === 2022) {
    const teamsByName = new Map<string, Team>()
    for (const m of yearMatches) {
      teamsByName.set(m.home_team.name, m.home_team)
      teamsByName.set(m.away_team.name, m.away_team)
    }

    const result: Record<string, Team[]> = {}
    for (const [letter, names] of Object.entries(WC2022_GROUP_NAMES)) {
      result[letter] = names
        .map((name) => teamsByName.get(name))
        .filter((t): t is Team => !!t)
    }
    return result
  }

  const groups: Record<string, Map<string, Team>> = {}
  for (const m of yearMatches) {
    if (!isGroupStageMatch(m, 2026)) continue
    const letter = extractGroupLetter(m)
    if (!letter) continue
    if (!groups[letter]) groups[letter] = new Map()
    groups[letter].set(m.home_team.id, m.home_team)
    groups[letter].set(m.away_team.id, m.away_team)
  }

  const result: Record<string, Team[]> = {}
  for (const letter of Object.keys(groups).sort()) {
    result[letter] = [...groups[letter].values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }
  return result
}

export function formatMatchStageLabel(match: Match): string {
  const letter = extractGroupLetter(match)
  if (letter) return `Group ${letter}`

  const labels: Record<string, string> = {
    group: 'Group Stage',
    'round-of-16': 'Round of 16',
    'quarter-final': 'Quarter-final',
    'semi-final': 'Semi-final',
    final: 'Final',
    'third-place': 'Third place',
  }
  return labels[match.stage] ?? match.stage
}
