// src/lib/fanzoneData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central mock data for Fan Zone, Watch Party, and Games features.
// In production swap each const for the matching API hook / Supabase query.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Post {
  id: string
  username: string
  avatar: string
  time: string
  content: string
  likes: number
  comments: number
  liked: boolean
  official: boolean
}

export interface WatchParty {
  id: string
  name: string
  host: string
  flag: string
  viewers: number
  unread: number
  lastMsg: string
  lastTime: string
}

export interface Tribe {
  rank: number
  name: string
  flag: string
  pts: number
}

export interface ChatMessage {
  id: string
  user: string
  avatar: string
  content: string
  time: string
  own: boolean
}

export interface Member {
  id: string
  name: string
  avatar: string
  online: boolean
}

export interface TriviaQuestion {
  id: string
  question: string
  options: string[]
  answer: number
  pts: number
  tag: string
  live: boolean
}

export interface OracleQuestion {
  id: string
  question: string
  options: string[]
  votes: number[]
  total: number
}

export interface LeagueEntry {
  rank: number
  name: string
  avatar: string
  pts: number
  correct: number
  trend: 'up' | 'down' | 'neutral'
  you: boolean
}

export interface DuelOpponent {
  id: string
  name: string
  flag: string
  pts: number
  streak: number
  record: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_POSTS: Post[] = [
  { id: 'p1', username: 'SambaKing_98', avatar: '🇧🇷', time: '2m ago', content: 'Vinicius is absolutely UNPLAYABLE tonight. That run past two defenders in the 34th minute had the whole stadium on its feet. Peak football. ⚽🔥', likes: 841, comments: 43, liked: false, official: false },
  { id: 'p2', username: 'WC_Official', avatar: '🌍', time: '5m ago', content: 'HALF TIME: Brazil 2–0 Germany. Two goals from Rodrygo and a masterclass display from Paquetá. What a first half at MetLife Stadium.', likes: 12400, comments: 892, liked: false, official: true },
  { id: 'p3', username: 'TacticoX', avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', time: '9m ago', content: "Germany desperately need to switch shape. Their back line has been all over the place — Rüdiger can't do it alone. Bring on Havertz, create some overloads.", likes: 320, comments: 71, liked: false, official: false },
  { id: 'p4', username: 'GoalKing', avatar: '⚽', time: '14m ago', content: 'The atmosphere at MetLife right now is out of this world. You can hear the drums from the Brazilian fans three sections away.', likes: 510, comments: 28, liked: false, official: false },
  { id: 'p5', username: 'EuroFanatic', avatar: '🇫🇷', time: '18m ago', content: "Stats don't lie — Brazil have had 14 shots on target in 45 minutes. Germany's defensive structure has completely collapsed.", likes: 204, comments: 19, liked: false, official: false },
]

export const WATCH_PARTIES: WatchParty[] = [
  { id: 'wp1', name: 'Brazil HQ', host: 'Samba Kings', flag: '🇧🇷', viewers: 1204, unread: 3, lastMsg: 'GOAL!! Vinicius again 🔥', lastTime: '2m' },
  { id: 'wp2', name: 'Das Finale Room', host: 'Die Mannschaft', flag: '🇩🇪', viewers: 876, unread: 0, lastMsg: 'Germany need a tactical change rn', lastTime: '5m' },
  { id: 'wp3', name: 'Neutral Ground', host: 'WC2026 Official', flag: '🌍', viewers: 3401, unread: 7, lastMsg: 'What a match this is turning out to be', lastTime: '1m' },
]

export const TRIBES: Tribe[] = [
  { rank: 1, name: 'Samba Kings', flag: '🇧🇷', pts: 12840 },
  { rank: 2, name: 'Die Mannschaft', flag: '🇩🇪', pts: 11205 },
  { rank: 3, name: 'The Lions', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pts: 9800 },
  { rank: 4, name: 'La Roja', flag: '🇪🇸', pts: 8102 },
]

export const HASHTAGS = ['#GoldenBoot26', '#WC2026', '#JogaBonito', '#FinalSamba', '#VAROut', '#BRAGED']

export const CHAT_INIT: ChatMessage[] = [
  { id: 'c1', user: 'SambaKing_98', avatar: '🇧🇷', content: "Welcome to the party! Let's gooo 🔥", time: "32'", own: false },
  { id: 'c2', user: 'GoalKing', avatar: '⚽', content: 'Starting lineup looks incredible tonight', time: "33'", own: false },
  { id: 'c3', user: 'You', avatar: '🌟', content: 'Vinicius looks sharp in the warm-ups', time: "34'", own: true },
  { id: 'c4', user: 'TacticoX', avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', content: "Germany's pressing has been non-existent so far", time: "35'", own: false },
  { id: 'c5', user: 'SambaKing_98', avatar: '🇧🇷', content: 'GOAAALLLL RODRYGO!!! 1-0 🎉🎉🎉', time: "36'", own: false },
  { id: 'c6', user: 'WC_Fan22', avatar: '🏆', content: 'What a strike!! Top corner!!', time: "36'", own: false },
  { id: 'c7', user: 'You', avatar: '🌟', content: 'Absolute worldie 😭', time: "36'", own: true },
  { id: 'c8', user: 'GoalKing', avatar: '⚽', content: 'Brazil are just on another level tonight', time: "43'", own: false },
  { id: 'c9', user: 'SambaKing_98', avatar: '🇧🇷', content: 'GOAL!! Vinicius again 🔥 2-0 HT!!', time: "45+2'", own: false },
]

export const WATCH_MEMBERS: Member[] = [
  { id: 'm1', name: 'SambaKing_98', avatar: '🇧🇷', online: true },
  { id: 'm2', name: 'TacticoX', avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', online: true },
  { id: 'm3', name: 'GoalKing', avatar: '⚽', online: true },
  { id: 'm4', name: 'EuroFanatic', avatar: '🇫🇷', online: false },
  { id: 'm5', name: 'WC_Fan22', avatar: '🏆', online: true },
  { id: 'm6', name: 'FootballNerd', avatar: '🇩🇪', online: false },
]

export const QUICK_REACTS = ['🔥', '⚽', '😱', '❤️', '🎉', '👏', '😭', '🤣']

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  { id: 'q1', question: "Which midfielder completed 15 consecutive passes in Brazil's final third tonight?", options: ['Casemiro', 'Paquetá', 'Kimmich', 'Gündogan'], answer: 1, pts: 40, tag: 'Live Match', live: true },
  { id: 'q2', question: 'Which country has never been eliminated in the group stage of a World Cup they hosted?', options: ['South Africa', 'South Korea', 'Germany', 'Japan'], answer: 2, pts: 30, tag: 'History', live: false },
  { id: 'q3', question: 'Who is the only player to win the Golden Boot at two different World Cups?', options: ['Ronaldo', 'Gerd Müller', 'Gary Lineker', 'Davor Šuker'], answer: 0, pts: 35, tag: 'Records', live: false },
  { id: 'q4', question: 'How many times has Brazil won the FIFA World Cup?', options: ['3', '4', '5', '6'], answer: 2, pts: 20, tag: 'Records', live: false },
]

export const ORACLE_QUESTIONS: OracleQuestion[] = [
  { id: 'o1', question: 'Who wins tonight?', options: ['Brazil', 'Germany', 'Draw'], votes: [6240, 2100, 890], total: 9230 },
  { id: 'o2', question: 'First goalscorer?', options: ['Vinicius Jr.', 'Rodrygo', 'Mbappé', 'Haaland'], votes: [3100, 1800, 2200, 1400], total: 8500 },
  { id: 'o3', question: 'Total goals in the match?', options: ['0–1', '2–3', '4+'], votes: [420, 5100, 2800], total: 8320 },
]

export const MINI_LEAGUE: LeagueEntry[] = [
  { rank: 1, name: 'SambaMaster', avatar: '🇧🇷', pts: 2210, correct: 15, trend: 'up', you: false },
  { rank: 2, name: 'You', avatar: '🌟', pts: 1840, correct: 12, trend: 'up', you: true },
  { rank: 3, name: 'TacticoX', avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pts: 1590, correct: 11, trend: 'down', you: false },
  { rank: 4, name: 'GoalKing', avatar: '⚽', pts: 1310, correct: 9, trend: 'neutral', you: false },
  { rank: 5, name: 'EuroFanatic', avatar: '🇫🇷', pts: 980, correct: 7, trend: 'neutral', you: false },
  { rank: 6, name: 'FootballNerd', avatar: '🇩🇪', pts: 540, correct: 4, trend: 'down', you: false },
]

export const DUEL_OPPONENTS: DuelOpponent[] = [
  { id: 'd1', name: 'FootballNerd99', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pts: 1840, streak: 4, record: '7W 3L' },
  { id: 'd2', name: 'SambaMaster', flag: '🇧🇷', pts: 2210, streak: 7, record: '14W 2L' },
  { id: 'd3', name: 'TacticoX', flag: '🇦🇷', pts: 1590, streak: 2, record: '5W 5L' },
]

export const GAME_TABS = [
  { id: 'oracle', label: 'Oracle', icon: '🔮' },
  { id: 'trivia', label: 'Trivia', icon: '🧠' },
  { id: 'league', label: 'Mini League', icon: '🏆' },
  { id: 'duel', label: 'Fan Duel', icon: '⚔️' },
  { id: 'bracket', label: 'Bracket', icon: '🗂️' },
] as const

export type GameTabId = typeof GAME_TABS[number]['id']