import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          tier: string
          xp: number
          global_rank: number | null
          tribe_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      matches: {
        Row: {
          id: string
          home_team_id: string
          away_team_id: string
          stadium_id: string
          stage: string
          home_score: number
          away_score: number
          minute: number
          status: 'upcoming' | 'live' | 'finished'
          home_possession: number
          kickoff_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      stadiums: {
        Row: {
          id: string
          name: string
          city: string
          country: string
          capacity: number
          hero_image_url: string | null
          avg_atmosphere: number
          avg_food: number
          avg_hotel: number
          avg_safety: number
          avg_rating: number
          total_reviews: number
          transport_status: string
          security_score: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stadiums']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stadiums']['Insert']>
      }
      posts: {
        Row: {
          id: string
          user_id: string
          match_id: string | null
          content: string | null
          media_url: string | null
          media_type: string | null
          likes: number
          comment_count: number
          is_official: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'likes' | 'comment_count'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      tribes: {
        Row: {
          id: string
          name: string
          badge_url: string | null
          team_id: string | null
          total_points: number
          member_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tribes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tribes']['Insert']>
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          match_id: string
          predicted_home: number
          predicted_away: number
          points_earned: number
          is_correct: boolean | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id' | 'created_at' | 'points_earned' | 'is_correct'>
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>
      }
      stadium_reviews: {
        Row: {
          id: string
          user_id: string
          stadium_id: string
          atmosphere_score: number
          food_score: number
          hotel_score: number
          safety_score: number
          body: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stadium_reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stadium_reviews']['Insert']>
      }
      fan_photos: {
        Row: {
          id: string
          user_id: string
          stadium_id: string | null
          match_id: string | null
          image_url: string
          caption: string | null
          likes: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fan_photos']['Row'], 'id' | 'created_at' | 'likes'>
        Update: Partial<Database['public']['Tables']['fan_photos']['Insert']>
      }
      passport_badges: {
        Row: {
          id: string
          user_id: string
          badge_key: string
          label: string
          description: string | null
          icon: string | null
          is_unlocked: boolean
          earned_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['passport_badges']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['passport_badges']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          match_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['friendships']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['friendships']['Insert']>
      }
    }
  }
}