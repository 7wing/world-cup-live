// src/types/index.ts

export interface Team {
  id: string
  name: string
  code: string | null
  flag_url: string | null
  group_letter: string | null
}

export interface Stadium {
  id: string
  slug: string
  name: string
  city: string
  country: string
  flag: string | null
  capacity: number | null
  hero_image_url: string | null
  note: string | null
  avg_atmosphere: number
  avg_food: number
  avg_hotel: number
  avg_safety: number
  avg_rating: number
  total_reviews: number
  transport_status: string | null
  security_score: number | null
  year_opened: number | null
  surface: string | null
  roof_type: string | null
}

export interface Match {
  id: string
  home_team: Team
  away_team: Team
  stadium: Stadium | null
  stage: string
  group_letter: string | null
  home_score: number | null
  away_score: number | null
  home_score_pens: number | null
  away_score_pens: number | null
  decided_by_pens: boolean
  minute: number
  status: 'upcoming' | 'live' | 'finished'
  home_possession: number
  kickoff_at: string
}

// ── match_stats table ─────────────────────────────────────────────────────────
export interface MatchStat {
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
  home_pass_accuracy: number | null  // 0-100
  away_pass_accuracy: number | null  // 0-100
  home_possession: number | null     // 0-100
  updated_at: string
}

// ── lineups table ─────────────────────────────────────────────────────────────
export interface Lineup {
  id: string
  match_id: string
  team_id: string
  player_name: string
  player_number: number | null
  position: 'GK' | 'DEF' | 'MID' | 'FWD' | null
  position_x: number | null   // 0-100 pitch coordinate
  position_y: number | null   // 0-100 pitch coordinate
  is_starter: boolean
  is_captain: boolean
  created_at: string
}

// ── match_events table ────────────────────────────────────────────────────────
export type MatchEventType =
  | 'goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'corner'
  | 'shot'
  | 'penalty'
  | 'kick_off'
  | 'half_time'
  | 'full_time'

export interface MatchEvent {
  id: string
  match_id: string
  team_id: string | null
  event_type: MatchEventType
  player_name: string | null
  player_in: string | null      // substitution only
  minute: number | null
  extra_time: boolean
  description: string | null
  created_at: string
}

// ── trivia_questions table ────────────────────────────────────────────────────
export interface TriviaQuestion {
  id: string
  question: string
  options: string[]           // jsonb array of 4 strings
  answer: number              // 0-3 index
  points: number
  tag: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  source: 'gemini' | 'manual'
  match_id: string | null
  created_at: string
}

// ── oracle_predictions table ──────────────────────────────────────────────────
// Raw DB row shape
export interface OraclePredictionRow {
  id: string
  match_id: string
  home_win: number
  draw: number
  away_win: number
  predicted_home: number | null
  predicted_away: number | null
  confidence: number | null
  generated_by: 'gemini' | 'static'
  created_at: string
}

// UI-facing shape used by useOracle, OraclePrediction component, and api/oracle.ts
export interface OracleData {
  homeWin:       number   // 0-100 percentage
  draw:          number   // 0-100 percentage
  awayWin:       number   // 0-100 percentage
  predictedHome: number
  predictedAway: number
  confidence:    number   // 0-100 percentage
}

// ── users & auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string
  username: string
  avatar_url: string | null
  tier: 'fan' | 'elite' | 'pro' | 'mvp'
  xp: number
  global_rank: number | null
  tribe_id: string | null
}

// ── tribes ────────────────────────────────────────────────────────────────────
export interface Tribe {
  id: string
  name: string
  badge_url: string | null
  team_id: string | null
  total_points: number
  member_count: number
}

// ── posts ─────────────────────────────────────────────────────────────────────
export interface Post {
  id: string
  user_id: string
  user?: User
  match_id: string | null
  content: string
  media_url: string | null
  media_type: string | null
  likes: number
  comment_count: number
  is_official: boolean
  created_at: string
  liked?: boolean
}

// ── chat_messages ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  match_id: string
  user_id: string
  user?: Pick<User, 'username' | 'avatar_url'>
  content: string
  created_at: string
}

// ── predictions ───────────────────────────────────────────────────────────────
export interface Prediction {
  id: string
  user_id: string
  match_id: string
  predicted_home: number
  predicted_away: number
  points_earned: number
  is_correct: boolean | null
  created_at: string
}

// ── stadium_reviews ───────────────────────────────────────────────────────────
export interface StadiumReview {
  id: string
  user_id: string
  user?: Pick<User, 'username' | 'avatar_url'>
  stadium_id: string
  atmosphere_score: number
  food_score: number
  hotel_score: number
  safety_score: number
  overall_rating: number
  body: string | null
  created_at: string
}

// ── fan_photos ────────────────────────────────────────────────────────────────
export interface FanPhoto {
  id: string
  user_id: string
  user?: Pick<User, 'username' | 'avatar_url'>
  stadium_id: string | null
  match_id: string | null
  image_url: string
  caption: string | null
  likes: number
  created_at: string
}

// ── passport_badges ───────────────────────────────────────────────────────────
export interface PassportBadge {
  id: string
  user_id: string
  badge_key: string
  label: string
  description: string | null
  icon: string | null
  is_unlocked: boolean
  earned_at: string | null
}

// ── friendships ───────────────────────────────────────────────────────────────
export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  friend?: User
  status: 'pending' | 'accepted'
  created_at: string
}

// ── duel_sessions ─────────────────────────────────────────────────────────────
export interface DuelSession {
  id: string
  challenger_id: string
  opponent_id: string
  challenger?: User
  opponent?: User
  match_id: string | null
  challenger_score: number
  opponent_score: number
  status: 'pending' | 'active' | 'finished'
  played_at: string | null
  created_at: string
}