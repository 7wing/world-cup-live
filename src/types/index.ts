export interface Team {
  id: string
  name: string
  code: string
  flag_url: string | null
  group_letter: string | null
}

export interface Stadium {
  id: string
  slug: string
  name: string
  city: string
  country: string
  flag: string
  capacity: number
  hero_image_url: string | null
  note: string | null

  // Ratings
  avg_atmosphere: number
  avg_food: number
  avg_hotel: number
  avg_safety: number
  avg_rating: number
  total_reviews: number

  // Operational
  transport_status: string
  security_score: number

  // Venue info (used in StadiumDetailPage info tab)
  year_opened: number | null
  surface: string | null
  roof_type: string | null
}

export interface Match {
  id: string
  home_team: Team
  away_team: Team
  stadium: Stadium
  stage: string
  home_score: number
  away_score: number
  minute: number
  status: 'upcoming' | 'live' | 'finished'
  home_possession: number
  kickoff_at: string
}

export interface User {
  id: string
  username: string
  avatar_url: string | null
  tier: 'fan' | 'elite' | 'pro' | 'mvp'
  xp: number
  global_rank: number | null
  tribe_id: string | null
}

export interface Tribe {
  id: string
  name: string
  badge_url: string | null
  team_id: string | null
  total_points: number
  member_count: number
}

export interface Post {
  id: string
  user_id: string
  user?: User
  match_id: string | null
  content: string | null
  media_url: string | null
  media_type: string | null
  likes: number
  comment_count: number
  is_official: boolean
  created_at: string
  liked?: boolean
}

export interface ChatMessage {
  id: string
  match_id: string
  user_id: string
  user?: Pick<User, 'username' | 'avatar_url'>
  content: string
  created_at: string
}

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

export interface StadiumReview {
  id: string
  user_id: string
  user?: Pick<User, 'username' | 'avatar_url'>
  stadium_id: string
  // Scores stored as 1–5 in DB
  atmosphere_score: number
  food_score: number
  hotel_score: number
  safety_score: number
  // Optional overall rating (computed or user-supplied)
  overall_rating?: number
  body: string | null
  created_at: string
}

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

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  friend?: User
  status: 'pending' | 'accepted'
  created_at: string
}

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
}