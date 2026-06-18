import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'world-cup-live-auth-token',
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          tier: 'fan' | 'elite' | 'pro' | 'mvp'
          xp: number
          global_rank: number | null
          tribe_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      teams: {
        Row: {
          id: string
          name: string
          code: string | null
          flag_url: string | null
          group_letter: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      matches: {
        Row: {
          id: string
          home_team_id: string | null
          away_team_id: string | null
          stadium_id: string | null
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
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      match_events: {
        Row: {
          id: string
          match_id: string
          team_id: string | null
          event_type:
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
          player_name: string | null
          player_in: string | null
          minute: number | null
          extra_time: boolean
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['match_events']['Insert']>
      }
      match_stats: {
        Row: {
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
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_stats']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['match_stats']['Insert']>
      }
      lineups: {
        Row: {
          id: string
          match_id: string
          team_id: string
          player_name: string
          player_number: number | null
          position: 'GK' | 'DEF' | 'MID' | 'FWD' | null
          position_x: number | null
          position_y: number | null
          is_starter: boolean
          is_captain: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lineups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lineups']['Insert']>
      }
      stadiums: {
        Row: {
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
          content: string
          media_url: string | null
          media_type: string | null
          likes: number
          comment_count: number
          is_official: boolean
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['posts']['Row'],
          'id' | 'created_at' | 'likes' | 'comment_count'
        >
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      post_likes: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: Database['public']['Tables']['post_likes']['Row']
        Update: Partial<Database['public']['Tables']['post_likes']['Insert']>
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
      tribe_members: {
        Row: {
          user_id: string
          tribe_id: string
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['tribe_members']['Row'], 'joined_at'>
        Update: Partial<Database['public']['Tables']['tribe_members']['Insert']>
      }
      watch_parties: {
        Row: {
          id:           string
          name:         string
          flag:         string
          match_id:     string | null
          created_by:   string | null
          viewer_count: number
          last_message: string | null
          last_msg_at:  string | null
          created_at:   string
        }
        Insert: Omit<
          Database['public']['Tables']['watch_parties']['Row'],
          'id' | 'created_at' | 'viewer_count' | 'last_message' | 'last_msg_at'
        >
        Update: Partial<Database['public']['Tables']['watch_parties']['Insert']>
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
        Insert: Omit<
          Database['public']['Tables']['predictions']['Row'],
          'id' | 'created_at' | 'points_earned' | 'is_correct'
        >
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
          overall_rating: number
          body: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['stadium_reviews']['Row'],
          'id' | 'created_at' | 'overall_rating'
        >
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
      trivia_questions: {
        Row: {
          id: string
          question: string
          options: string[]
          answer: number
          points: number
          tag: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          source: 'gemini' | 'manual'
          match_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trivia_questions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['trivia_questions']['Insert']>
      }
      oracle_predictions: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['oracle_predictions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['oracle_predictions']['Insert']>
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>
      }
      match_alerts: {
        Row: {
          user_id: string
          match_id: string | null
          team_id: string | null
          goals: boolean
          red_cards: boolean
          lineups: boolean
          kickoff: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_alerts']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['match_alerts']['Insert']>
      }
      duel_sessions: {
        Row: {
          id: string
          challenger_id: string
          opponent_id: string
          match_id: string | null
          challenger_score: number
          opponent_score: number
          status: 'pending' | 'active' | 'finished'
          played_at: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['duel_sessions']['Row'],
          'id' | 'created_at' | 'challenger_score' | 'opponent_score'
        >
        Update: Partial<Database['public']['Tables']['duel_sessions']['Insert']>
      }
      fantasy_squads: {
        Row: {
          id:           string
          user_id:      string
          matchday_id:  string
          locked_in:    boolean
          total_points: number
          saved_at:     string
          created_at:   string
        }
        Insert: Omit<Database['public']['Tables']['fantasy_squads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fantasy_squads']['Insert']>
      }
      fantasy_players: {
        Row: {
          id:           string
          squad_id:     string
          user_id:      string
          name:         string
          team:         string
          position:     'GK' | 'DEF' | 'MID' | 'FWD'
          cost:         number
          goals:        number
          assists:      number
          clean_sheet:  boolean
          yellow_cards: number
          red_cards:    number
          points:       number
          created_at:   string
        }
        Insert: Omit<Database['public']['Tables']['fantasy_players']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fantasy_players']['Insert']>
      }
      players: {
        Row: {
          id:         string
          name:       string
          team:       string
          position:   'GK' | 'DEF' | 'MID' | 'FWD'
          cost:       number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      post_comments: {
        Row: {
          id:         string
          post_id:    string | null
          user_id:    string | null
          content:    string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_comments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['post_comments']['Insert']>
      }
      party_messages: {
        Row: {
          id:         string
          party_id:   string | null
          user_id:    string | null
          content:    string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['party_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['party_messages']['Insert']>
      }
      events: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'virtual' | 'physical'
          location: string | null
          link: string | null
          match_id: string | null
          created_by: string
          max_attendees: number
          starts_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_attendees: {
        Row: {
          event_id: string
          user_id: string
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['event_attendees']['Row'], 'joined_at'>
        Update: Partial<Database['public']['Tables']['event_attendees']['Insert']>
      }
    }
  }
}