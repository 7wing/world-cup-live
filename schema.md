## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `username` | `text` |  Unique |
| `avatar_url` | `text` |  Nullable |
| `tier` | `text` |  |
| `xp` | `int4` |  |
| `global_rank` | `int4` |  Nullable |
| `tribe_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `teams`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `name` | `text` |  |
| `code` | `text` |  Nullable |
| `flag_url` | `text` |  Nullable |
| `group_letter` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `stadiums`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `name` | `text` |  |
| `city` | `text` |  |
| `country` | `text` |  |
| `flag` | `text` |  Nullable |
| `capacity` | `int4` |  Nullable |
| `hero_image_url` | `text` |  Nullable |
| `avg_atmosphere` | `numeric` |  Nullable |
| `avg_food` | `numeric` |  Nullable |
| `avg_hotel` | `numeric` |  Nullable |
| `avg_safety` | `numeric` |  Nullable |
| `avg_rating` | `numeric` |  Nullable |
| `total_reviews` | `int4` |  Nullable |
| `transport_status` | `text` |  Nullable |
| `security_score` | `numeric` |  Nullable |
| `year_opened` | `int4` |  Nullable |
| `surface` | `text` |  Nullable |
| `roof_type` | `text` |  Nullable |
| `note` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `matches`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `home_team_id` | `text` |  Nullable |
| `away_team_id` | `text` |  Nullable |
| `stadium_id` | `uuid` |  Nullable |
| `stage` | `text` |  |
| `home_score` | `int4` |  Nullable |
| `away_score` | `int4` |  Nullable |
| `minute` | `int4` |  |
| `status` | `text` |  |
| `home_possession` | `numeric` |  |
| `kickoff_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `home_score_pens` | `int4` |  Nullable |
| `away_score_pens` | `int4` |  Nullable |
| `decided_by_pens` | `bool` |  |
| `group_letter` | `text` |  Nullable |

## Table `tribes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `badge_url` | `text` |  Nullable |
| `team_id` | `text` |  Nullable |
| `total_points` | `int4` |  |
| `member_count` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `tribe_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `tribe_id` | `uuid` | Primary |
| `joined_at` | `timestamptz` |  |

## Table `posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `match_id` | `text` |  Nullable |
| `content` | `text` |  |
| `media_url` | `text` |  Nullable |
| `media_type` | `text` |  Nullable |
| `likes` | `int4` |  |
| `comment_count` | `int4` |  |
| `is_official` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `post_likes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `post_id` | `uuid` | Primary |
| `user_id` | `uuid` | Primary |

## Table `chat_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `match_id` | `text` |  |
| `user_id` | `uuid` |  |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `predictions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `match_id` | `text` |  |
| `predicted_home` | `int4` |  |
| `predicted_away` | `int4` |  |
| `points_earned` | `int4` |  |
| `is_correct` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `stadium_reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `stadium_id` | `uuid` |  |
| `atmosphere_score` | `int4` |  |
| `food_score` | `int4` |  |
| `hotel_score` | `int4` |  |
| `safety_score` | `int4` |  |
| `body` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `overall_rating` | `numeric` |  Nullable |

## Table `fan_photos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `stadium_id` | `uuid` |  Nullable |
| `match_id` | `text` |  Nullable |
| `image_url` | `text` |  |
| `caption` | `text` |  Nullable |
| `likes` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `passport_badges`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `badge_key` | `text` |  |
| `label` | `text` |  |
| `description` | `text` |  Nullable |
| `icon` | `text` |  Nullable |
| `is_unlocked` | `bool` |  |
| `earned_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `friendships`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `friend_id` | `uuid` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `trivia_questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question` | `text` |  |
| `options` | `jsonb` |  |
| `answer` | `int4` |  |
| `points` | `int4` |  |
| `tag` | `text` |  Nullable |
| `difficulty` | `text` |  Nullable |
| `source` | `text` |  Nullable |
| `match_id` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `oracle_predictions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `match_id` | `text` |  |
| `home_win` | `numeric` |  |
| `draw` | `numeric` |  |
| `away_win` | `numeric` |  |
| `predicted_home` | `int4` |  Nullable |
| `predicted_away` | `int4` |  Nullable |
| `confidence` | `numeric` |  Nullable |
| `generated_by` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `duel_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `challenger_id` | `uuid` |  |
| `opponent_id` | `uuid` |  |
| `match_id` | `text` |  Nullable |
| `challenger_score` | `int4` |  |
| `opponent_score` | `int4` |  |
| `status` | `text` |  |
| `played_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `match_alerts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `match_id` | `text` | Primary |
| `team_id` | `text` |  Nullable |
| `goals` | `bool` |  |
| `red_cards` | `bool` |  |
| `lineups` | `bool` |  |
| `kickoff` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `push_subscriptions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `endpoint` | `text` |  |
| `p256dh` | `text` |  |
| `auth` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `fantasy_squads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `matchday_id` | `text` |  |
| `locked_in` | `bool` |  |
| `total_points` | `int4` |  |
| `saved_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |

## Table `fantasy_players`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `squad_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `name` | `text` |  |
| `team` | `text` |  |
| `position` | `text` |  |
| `cost` | `int4` |  |
| `goals` | `int4` |  |
| `assists` | `int4` |  |
| `clean_sheet` | `bool` |  |
| `yellow_cards` | `int4` |  |
| `red_cards` | `int4` |  |
| `points` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `watch_parties`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `flag` | `text` |  |
| `match_id` | `text` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `viewer_count` | `int4` |  |
| `last_message` | `text` |  Nullable |
| `last_msg_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `post_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `post_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `players`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `team` | `text` |  |
| `position` | `text` |  |
| `cost` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `party_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `party_id` | `uuid` |  Nullable |
| `user_id` | `uuid` |  Nullable |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `oracle_votes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question` | `text` |  |
| `option_idx` | `int4` |  |
| `user_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

