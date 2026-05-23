// src/components/matches/mockMatchData.ts
// ─── Single source of truth for all match-screen mock data ───────────────────
// Shape notes:
//  • Match objects use the real Match interface (home_team / away_team objects)
//  • All flag values are emoji strings stored in flag_url — ScoreCard already
//    handles this with the `!flag_url.startsWith('http')` guard.
//  • MOCK_MOMENTUM   → { minute, home, away }  (MomentumChart format)
//  • MOCK_TEAM_STATS → flat array of StatBar rows  (MatchDetailPage maps over it)
//  • MOCK_H2H, MOCK_PLAYER_STATS, MOCK_HOME_XI, MOCK_AWAY_XI are all exported.

import type { Match } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// 1.  ADAPTER TYPES  (keep in sync with your real `Match` type)
// ─────────────────────────────────────────────────────────────────────────────
export interface MockTeamRef {
  id: string
  name: string
  code: string
  /** Emoji flag string or absolute image URL */
  flag_url: string
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  MATCH OBJECTS  (shaped like the real Match interface)
// ─────────────────────────────────────────────────────────────────────────────

/** The 2022 Final — used as the "Full Time" placeholder on the schedule tab */
export const MATCH_2022_FINAL: Match = {
  id: 'wc22-final',
  home_team: { id: 'ARG', name: 'Argentina', code: 'ARG', flag_url: '🇦🇷' },
  away_team: { id: 'FRA', name: 'France',    code: 'FRA', flag_url: '🇫🇷' },
  home_score: 3,
  away_score: 3,
  penalty_shootout: { home: 4, away: 2 },
  stage: 'Final · 2022',
  kickoff_at: '2022-12-18T18:00:00Z',
  venue: 'Lusail Stadium',
  stadium: { id: 'lusail', name: 'Lusail Stadium', city: 'Lusail', country: 'Qatar' },
  status: 'finished',
  minute: 120,
  home_possession: 41,
} as unknown as Match

/** Sample of 2026 group-stage fixtures (all upcoming) */
export const MATCHES_2026: Match[] = [
  {
    id: 'm26-a1',
    home_team: { id: 'USA', name: 'USA', code: 'USA', flag_url: '🇺🇸' },
    away_team: { id: 'PAN', name: 'Panama', code: 'PAN', flag_url: '🇵🇦' },
    home_score: null, away_score: null,
    stage: 'Group Stage · A',
    kickoff_at: '2026-06-11T18:00:00Z',
    venue: 'MetLife Stadium',
    stadium: { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', country: 'USA' },
    status: 'upcoming',
  },
  {
    id: 'm26-b1',
    home_team: { id: 'ARG', name: 'Argentina', code: 'ARG', flag_url: '🇦🇷' },
    away_team: { id: 'CHI', name: 'Chile', code: 'CHI', flag_url: '🇨🇱' },
    home_score: null, away_score: null,
    stage: 'Group Stage · B',
    kickoff_at: '2026-06-13T20:00:00Z',
    venue: 'SoFi Stadium',
    stadium: { id: 'sofi', name: 'SoFi Stadium', city: 'Inglewood, CA', country: 'USA' },
    status: 'upcoming',
  },
  {
    id: 'm26-c1',
    home_team: { id: 'MEX', name: 'Mexico', code: 'MEX', flag_url: '🇲🇽' },
    away_team: { id: 'CAN', name: 'Canada', code: 'CAN', flag_url: '🇨🇦' },
    home_score: null, away_score: null,
    stage: 'Group Stage · C',
    kickoff_at: '2026-06-14T19:00:00Z',
    venue: 'Estadio Azteca',
    stadium: { id: 'azteca', name: 'Estadio Azteca', city: 'Mexico City', country: 'Mexico' },
    status: 'upcoming',
  },
  {
    id: 'm26-f1',
    home_team: { id: 'BRA', name: 'Brazil', code: 'BRA', flag_url: '🇧🇷' },
    away_team: { id: 'ECU', name: 'Ecuador', code: 'ECU', flag_url: '🇪🇨' },
    home_score: null, away_score: null,
    stage: 'Group Stage · F',
    kickoff_at: '2026-06-17T18:00:00Z',
    venue: 'BMO Field',
    stadium: { id: 'bmo', name: 'BMO Field', city: 'Toronto', country: 'Canada' },
    status: 'upcoming',
  },
  {
    id: 'm26-h1',
    home_team: { id: 'GER', name: 'Germany', code: 'GER', flag_url: '🇩🇪' },
    away_team: { id: 'JPN', name: 'Japan', code: 'JPN', flag_url: '🇯🇵' },
    home_score: null, away_score: null,
    stage: 'Group Stage · H',
    kickoff_at: '2026-06-19T20:00:00Z',
    venue: 'MetLife Stadium',
    stadium: { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', country: 'USA' },
    status: 'upcoming',
  },
] as unknown as Match[]

// ─────────────────────────────────────────────────────────────────────────────
// 3.  MATCH DETAIL — MOMENTUM
//     Shape: { minute: number; home: number; away: number }
//     home/away are 0–100 (possession-momentum score that minute)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_MOMENTUM: { minute: number; home: number; away: number }[] = [
  { minute: 0,  home: 50, away: 50 },
  { minute: 10, home: 58, away: 42 },
  { minute: 23, home: 35, away: 65 },
  { minute: 34, home: 72, away: 28 },
  { minute: 45, home: 55, away: 45 },
  { minute: 60, home: 22, away: 78 },
  { minute: 75, home: 60, away: 40 },
  { minute: 88, home: 85, away: 15 },
  { minute: 90, home: 70, away: 30 },
]

// ─────────────────────────────────────────────────────────────────────────────
// 4.  MATCH DETAIL — TEAM STATS (flat array → maps cleanly in MatchDetailPage)
// ─────────────────────────────────────────────────────────────────────────────
export interface StatRow {
  label: string
  home: number
  away: number
  unit: string
  isPercent: boolean
}

export const MOCK_TEAM_STATS: StatRow[] = [
  { label: 'Possession',      home: 54,  away: 46,  unit: '%', isPercent: true  },
  { label: 'Shots',           home: 16,  away: 12,  unit: '',  isPercent: false },
  { label: 'Shots on Target', home: 7,   away: 5,   unit: '',  isPercent: false },
  { label: 'Corners',         home: 6,   away: 4,   unit: '',  isPercent: false },
  { label: 'Fouls',           home: 11,  away: 14,  unit: '',  isPercent: false },
  { label: 'Passes',          home: 512, away: 435, unit: '',  isPercent: false },
  { label: 'Pass Accuracy',   home: 88,  away: 82,  unit: '%', isPercent: true  },
  { label: 'Yellow Cards',    home: 1,   away: 2,   unit: '',  isPercent: false },
]

// ─────────────────────────────────────────────────────────────────────────────
// 5.  MATCH DETAIL — PLAYER STATS
// ─────────────────────────────────────────────────────────────────────────────
export interface PlayerStat {
  name: string
  flag: string
  team: 'home' | 'away'
  speed: number      // km/h top speed
  passes: number     // pass accuracy %
  distance: number   // km covered
  rating: number     // 0–10
}

export const MOCK_PLAYER_STATS: PlayerStat[] = [
  { name: 'Vini Jr.',   flag: '🇧🇷', team: 'home', speed: 36.2, passes: 91, distance: 11.2, rating: 9.1 },
  { name: 'Rodrygo',    flag: '🇧🇷', team: 'home', speed: 35.1, passes: 88, distance: 10.8, rating: 7.8 },
  { name: 'Casemiro',   flag: '🇧🇷', team: 'home', speed: 31.4, passes: 94, distance: 12.1, rating: 8.2 },
  { name: 'Richarlison',flag: '🇧🇷', team: 'home', speed: 33.8, passes: 79, distance: 10.4, rating: 7.5 },
  { name: 'Kimmich',    flag: '🇩🇪', team: 'away', speed: 30.2, passes: 96, distance: 11.8, rating: 8.4 },
  { name: 'Havertz',    flag: '🇩🇪', team: 'away', speed: 32.5, passes: 85, distance: 10.9, rating: 7.6 },
  { name: 'Gnabry',     flag: '🇩🇪', team: 'away', speed: 35.9, passes: 82, distance: 10.3, rating: 7.2 },
  { name: 'Müller',     flag: '🇩🇪', team: 'away', speed: 29.8, passes: 90, distance: 11.5, rating: 7.9 },
]

// ─────────────────────────────────────────────────────────────────────────────
// 6.  MATCH DETAIL — LINEUPS (pitch positions, 0-100 coordinate space)
// ─────────────────────────────────────────────────────────────────────────────
export interface PitchPlayer {
  name: string
  number: number
  pos: string
  x: number   // % left→right
  y: number   // % top→bottom (0 = home goal, 100 = away goal)
}

export const MOCK_HOME_XI: PitchPlayer[] = [
  { name: 'Alisson',    number: 1,  pos: 'GK', x: 50, y: 88 },
  { name: 'Militão',    number: 3,  pos: 'RB', x: 80, y: 72 },
  { name: 'Marquinhos', number: 4,  pos: 'CB', x: 62, y: 75 },
  { name: 'Silva',      number: 14, pos: 'CB', x: 38, y: 75 },
  { name: 'Danilo',     number: 2,  pos: 'LB', x: 20, y: 72 },
  { name: 'Casemiro',   number: 5,  pos: 'DM', x: 50, y: 58 },
  { name: 'Paquetá',    number: 10, pos: 'CM', x: 30, y: 48 },
  { name: 'G. Jesus',   number: 9,  pos: 'CM', x: 70, y: 48 },
  { name: 'Vini Jr.',   number: 20, pos: 'LW', x: 15, y: 28 },
  { name: 'Richarlison',number: 11, pos: 'ST', x: 50, y: 20 },
  { name: 'Rodrygo',    number: 21, pos: 'RW', x: 85, y: 28 },
]

export const MOCK_AWAY_XI: PitchPlayer[] = [
  { name: 'Neuer',      number: 1,  pos: 'GK', x: 50, y: 12 },
  { name: 'Kimmich',    number: 6,  pos: 'RB', x: 80, y: 28 },
  { name: 'Rüdiger',    number: 2,  pos: 'CB', x: 62, y: 25 },
  { name: 'Schlotterbeck',number:15,pos: 'CB', x: 38, y: 25 },
  { name: 'Raum',       number: 3,  pos: 'LB', x: 20, y: 28 },
  { name: 'Gündoğan',   number: 21, pos: 'DM', x: 35, y: 42 },
  { name: 'Kroos',      number: 8,  pos: 'DM', x: 65, y: 42 },
  { name: 'Gnabry',     number: 10, pos: 'RW', x: 80, y: 58 },
  { name: 'Müller',     number: 13, pos: 'AM', x: 50, y: 55 },
  { name: 'Havertz',    number: 7,  pos: 'LW', x: 20, y: 58 },
  { name: 'Füllkrug',   number: 9,  pos: 'ST', x: 50, y: 72 },
]

// ─────────────────────────────────────────────────────────────────────────────
// 7.  MATCH DETAIL — HEAD-TO-HEAD
// ─────────────────────────────────────────────────────────────────────────────
export interface H2HMatch {
  date: string
  home: string
  away: string
  score: string
  result: 'home' | 'away' | 'draw'
  tournament: string
}

export const MOCK_H2H: H2HMatch[] = [
  { date: '2022-12-18', home: 'Argentina', away: 'France',  score: '3–3 (4–2p)', result: 'home', tournament: 'WC Final'  },
  { date: '2022-03-25', home: 'France',    away: 'Argentina',score: '2–0',        result: 'home', tournament: 'Friendly' },
  { date: '2018-06-30', home: 'France',    away: 'Argentina',score: '4–3',        result: 'home', tournament: 'WC R16'   },
  { date: '2009-06-14', home: 'Argentina', away: 'France',  score: '0–2',        result: 'away', tournament: 'Friendly' },
  { date: '2007-07-01', home: 'France',    away: 'Argentina',score: '1–0',        result: 'home', tournament: 'Friendly' },
]

// ─────────────────────────────────────────────────────────────────────────────
// 8.  GROUP STANDINGS  (used by GroupCard in MatchesPage)
// ─────────────────────────────────────────────────────────────────────────────
export interface GroupRow {
  flag: string
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
  qualified?: boolean
}

export const GROUPS_2022: Record<string, GroupRow[]> = {
  A: [
    { flag: '🇳🇱', team: 'Netherlands', played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 1, gd: 4,  pts: 7, qualified: true },
    { flag: '🇸🇳', team: 'Senegal',     played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 4, gd: 1,  pts: 6, qualified: true },
    { flag: '🇪🇨', team: 'Ecuador',     played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 3, gd: 1,  pts: 4 },
    { flag: '🇶🇦', team: 'Qatar',       played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, gd: -6, pts: 0 },
  ],
  B: [
    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team: 'England',  played: 3, won: 2, drawn: 1, lost: 0, gf: 9, ga: 2, gd: 7,  pts: 7, qualified: true },
    { flag: '🇺🇸', team: 'USA',        played: 3, won: 1, drawn: 2, lost: 0, gf: 2, ga: 1, gd: 1,  pts: 5, qualified: true },
    { flag: '🇮🇷', team: 'Iran',       played: 3, won: 1, drawn: 0, lost: 2, gf: 4, ga: 7, gd: -3, pts: 3 },
    { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', team: 'Wales',    played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 6, gd: -5, pts: 1 },
  ],
  C: [
    { flag: '🇦🇷', team: 'Argentina',   played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 2, gd: 3,  pts: 6, qualified: true },
    { flag: '🇵🇱', team: 'Poland',      played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 2, gd: 0,  pts: 4, qualified: true },
    { flag: '🇲🇽', team: 'Mexico',      played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 3, gd: -1, pts: 4 },
    { flag: '🇸🇦', team: 'Saudi Arabia',played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, gd: -2, pts: 3 },
  ],
  D: [
    { flag: '🇫🇷', team: 'France',     played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 2, gd: 4,  pts: 6, qualified: true },
    { flag: '🇦🇺', team: 'Australia',  played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, gd: -1, pts: 4, qualified: true },
    { flag: '🇹🇳', team: 'Tunisia',    played: 3, won: 1, drawn: 1, lost: 1, gf: 1, ga: 1, gd: 0,  pts: 4 },
    { flag: '🇩🇰', team: 'Denmark',    played: 3, won: 0, drawn: 2, lost: 1, gf: 1, ga: 3, gd: -2, pts: 2 },
  ],
  E: [
    { flag: '🇯🇵', team: 'Japan',      played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, gd: 1,  pts: 6, qualified: true },
    { flag: '🇪🇸', team: 'Spain',      played: 3, won: 1, drawn: 1, lost: 1, gf: 9, ga: 3, gd: 6,  pts: 4, qualified: true },
    { flag: '🇩🇪', team: 'Germany',    played: 3, won: 1, drawn: 1, lost: 1, gf: 6, ga: 5, gd: 1,  pts: 4 },
    { flag: '🇨🇷', team: 'Costa Rica', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 11,gd: -8, pts: 3 },
  ],
  F: [
    { flag: '🇲🇦', team: 'Morocco',  played: 3, won: 2, drawn: 1, lost: 0, gf: 4, ga: 1, gd: 3,  pts: 7, qualified: true },
    { flag: '🇭🇷', team: 'Croatia',  played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 1, gd: 3,  pts: 5, qualified: true },
    { flag: '🇧🇪', team: 'Belgium',  played: 3, won: 1, drawn: 1, lost: 1, gf: 1, ga: 2, gd: -1, pts: 4 },
    { flag: '🇨🇦', team: 'Canada',   played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 6, gd: -4, pts: 0 },
  ],
  G: [
    { flag: '🇧🇷', team: 'Brazil',      played: 3, won: 2, drawn: 0, lost: 1, gf: 3, ga: 3, gd: 0, pts: 6, qualified: true },
    { flag: '🇨🇭', team: 'Switzerland', played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, gd: 1, pts: 6, qualified: true },
    { flag: '🇷🇸', team: 'Serbia',      played: 3, won: 1, drawn: 0, lost: 2, gf: 5, ga: 5, gd: 0, pts: 3 },
    { flag: '🇨🇲', team: 'Cameroon',    played: 3, won: 1, drawn: 0, lost: 2, gf: 4, ga: 4, gd: 0, pts: 3 },
  ],
  H: [
    { flag: '🇵🇹', team: 'Portugal',    played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 4, gd: 2,  pts: 6, qualified: true },
    { flag: '🇰🇷', team: 'South Korea', played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, gd: 0,  pts: 4, qualified: true },
    { flag: '🇺🇾', team: 'Uruguay',     played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 2, gd: 0,  pts: 4 },
    { flag: '🇬🇭', team: 'Ghana',       played: 3, won: 1, drawn: 0, lost: 2, gf: 5, ga: 7, gd: -2, pts: 3 },
  ],
}

export const GROUPS_2026: Record<string, GroupRow[]> = {
  A: [
    { flag: '🇺🇸', team: 'USA',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇦', team: 'Panama',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇦🇱', team: 'Albania', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇺🇦', team: 'Ukraine', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  B: [
    { flag: '🇦🇷', team: 'Argentina', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇱', team: 'Chile',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇪', team: 'Peru',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇦🇺', team: 'Australia', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  C: [
    { flag: '🇲🇽', team: 'Mexico',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇦', team: 'Canada',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇭🇳', team: 'Honduras',    played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇳🇿', team: 'New Zealand', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  D: [
    { flag: '🇫🇷', team: 'France',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇱', team: 'Poland',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇮🇱', team: 'Israel',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇧🇮', team: 'Burundi', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  E: [
    { flag: '🇪🇸', team: 'Spain',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇳🇱', team: 'Netherlands', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇧🇪', team: 'Belgium',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇭🇷', team: 'Croatia',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  F: [
    { flag: '🇧🇷', team: 'Brazil',    played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇪🇨', team: 'Ecuador',   played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇻🇪', team: 'Venezuela', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇵🇸', team: 'Palestine', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  G: [
    { flag: '🇵🇹', team: 'Portugal',     played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇩🇰', team: 'Denmark',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇭', team: 'Switzerland',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇷🇸', team: 'Serbia',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  H: [
    { flag: '🇩🇪', team: 'Germany',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇯🇵', team: 'Japan',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇸🇦', team: 'Saudi Arabia', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇧🇭', team: 'Bahrain',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  I: [
    { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team: 'England',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇸🇳', team: 'Senegal',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇸🇮', team: 'Slovenia',      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇿🇦', team: 'South Africa',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  J: [
    { flag: '🇺🇾', team: 'Uruguay',        played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇿', team: 'Czech Republic', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇹🇭', team: 'Thailand',       played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇮🇶', team: 'Iraq',           played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  K: [
    { flag: '🇨🇴', team: 'Colombia', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇲🇦', team: 'Morocco',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇲', team: 'Cameroon', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇳🇬', team: 'Nigeria',  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
  L: [
    { flag: '🇰🇷', team: 'South Korea',    played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇮🇷', team: 'Iran',           played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇴🇲', team: 'Oman',           played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    { flag: '🇨🇮', team: "Côte d'Ivoire",  played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// 9.  SCHEDULE PAGE — sidebar standings (Group G 2026 placeholder)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_SIDEBAR_STANDINGS = [
  { pos: 1, team: 'Brazil',    flag: '🇧🇷', played: 2, gd: 4,  points: 6, qualified: true  },
  { pos: 2, team: 'Germany',   flag: '🇩🇪', played: 2, gd: 2,  points: 3, qualified: false },
  { pos: 3, team: 'Ghana',     flag: '🇬🇭', played: 2, gd: -1, points: 3, qualified: false },
  { pos: 4, team: 'Korea Rep', flag: '🇰🇷', played: 2, gd: -5, points: 0, qualified: false },
]