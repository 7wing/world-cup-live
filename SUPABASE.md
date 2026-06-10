# Supabase SQL Migrations

> Run these blocks in order in the Supabase SQL Editor (SQL → New Query).
> Each section is independent — if one fails, fix it, then continue from the next.

---

## 1. Enable Row Level Security (RLS) on All Tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadium_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
```

---

## 2. Drop Dangerous Default Policies (if any exist)

Supabase sometimes auto-creates `anon` policies. Remove them so we control access explicitly.

```sql
-- Drop all existing policies first so we start from a clean slate
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, 'public', pol.tablename);
  END LOOP;
END $$;
```

---

## 3. RLS Policies — Public Read, Authenticated Write Own Rows

### Core (read-only public, admin writes via service role)
```sql
CREATE POLICY "teams_read" ON teams FOR SELECT TO public USING (true);
CREATE POLICY "matches_read" ON matches FOR SELECT TO public USING (true);
CREATE POLICY "players_read" ON players FOR SELECT TO public USING (true);
CREATE POLICY "stadiums_read" ON stadiums FOR SELECT TO public USING (true);
CREATE POLICY "trivia_questions_read" ON trivia_questions FOR SELECT TO public USING (true);
CREATE POLICY "oracle_predictions_read" ON oracle_predictions FOR SELECT TO public USING (true);
```

### Users (public profiles read, self-write)
```sql
CREATE POLICY "users_read" ON users FOR SELECT TO public USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_insert_own" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
```

### Social — Posts, Likes, Comments
```sql
CREATE POLICY "posts_read" ON posts FOR SELECT TO public USING (true);
CREATE POLICY "posts_insert_own" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "post_likes_read" ON post_likes FOR SELECT TO public USING (true);
CREATE POLICY "post_likes_insert_own" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_own" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "post_comments_read" ON post_comments FOR SELECT TO public USING (true);
CREATE POLICY "post_comments_insert_own" ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_delete_own" ON post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Chat Messages (public read for match chat, own write)
```sql
CREATE POLICY "chat_messages_read" ON chat_messages FOR SELECT TO public USING (true);
CREATE POLICY "chat_messages_insert_own" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

### Party Messages (same pattern as chat)
```sql
CREATE POLICY "party_messages_read" ON party_messages FOR SELECT TO public USING (true);
CREATE POLICY "party_messages_insert_own" ON party_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

### Predictions (own rows only)
```sql
CREATE POLICY "predictions_read_own" ON predictions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "predictions_insert_own" ON predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own" ON predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

### Oracle Votes (own rows only)
```sql
CREATE POLICY "oracle_votes_insert_own" ON oracle_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "oracle_votes_read_own" ON oracle_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

### Tribes & Members (public read, own insert)
```sql
CREATE POLICY "tribes_read" ON tribes FOR SELECT TO public USING (true);
CREATE POLICY "tribe_members_read" ON tribe_members FOR SELECT TO public USING (true);
CREATE POLICY "tribe_members_insert_own" ON tribe_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tribe_members_delete_own" ON tribe_members FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Friendships (own rows only)
```sql
CREATE POLICY "friendships_read_own" ON friendships FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "friendships_insert_own" ON friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "friendships_update_own" ON friendships FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

### Stadium Reviews (public read, own write)
```sql
CREATE POLICY "stadium_reviews_read" ON stadium_reviews FOR SELECT TO public USING (true);
CREATE POLICY "stadium_reviews_insert_own" ON stadium_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stadium_reviews_update_own" ON stadium_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "stadium_reviews_delete_own" ON stadium_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Fan Photos (public read, own write)
```sql
CREATE POLICY "fan_photos_read" ON fan_photos FOR SELECT TO public USING (true);
CREATE POLICY "fan_photos_insert_own" ON fan_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fan_photos_delete_own" ON fan_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Passport Badges (own rows only)
```sql
CREATE POLICY "passport_badges_read_own" ON passport_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

### Duel Sessions (participants only)
```sql
CREATE POLICY "duel_sessions_read_participant" ON duel_sessions FOR SELECT TO authenticated USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "duel_sessions_insert_challenger" ON duel_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "duel_sessions_update_participant" ON duel_sessions FOR UPDATE TO authenticated USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
```

### Match Alerts (own rows only)
```sql
CREATE POLICY "match_alerts_read_own" ON match_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "match_alerts_insert_own" ON match_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "match_alerts_update_own" ON match_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "match_alerts_delete_own" ON match_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Push Subscriptions (own rows only)
```sql
CREATE POLICY "push_subscriptions_read_own" ON push_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_insert_own" ON push_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_delete_own" ON push_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Fantasy Squads (own rows only)
```sql
CREATE POLICY "fantasy_squads_read_own" ON fantasy_squads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fantasy_squads_insert_own" ON fantasy_squads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fantasy_squads_update_own" ON fantasy_squads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

### Fantasy Players (via squad ownership)
```sql
CREATE POLICY "fantasy_players_read_own" ON fantasy_players FOR SELECT TO authenticated USING (EXISTS (
  SELECT 1 FROM fantasy_squads WHERE fantasy_squads.id = fantasy_players.squad_id AND fantasy_squads.user_id = auth.uid()
));
CREATE POLICY "fantasy_players_insert_own" ON fantasy_players FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM fantasy_squads WHERE fantasy_squads.id = fantasy_players.squad_id AND fantasy_squads.user_id = auth.uid()
  )
);
```

### Watch Parties (public read, creator can update)
```sql
CREATE POLICY "watch_parties_read" ON watch_parties FOR SELECT TO public USING (true);
CREATE POLICY "watch_parties_insert" ON watch_parties FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "watch_parties_update_creator" ON watch_parties FOR UPDATE TO authenticated USING (auth.uid() = created_by);
```

---

## 4. Unique Constraints

```sql
-- Prevent duplicate oracle votes per user per question
ALTER TABLE oracle_votes ADD CONSTRAINT unique_oracle_vote UNIQUE (user_id, question);

-- Prevent duplicate predictions per user per match
ALTER TABLE predictions ADD CONSTRAINT unique_user_match_prediction UNIQUE (user_id, match_id);

-- Prevent duplicate fantasy squads per user per matchday
ALTER TABLE fantasy_squads ADD CONSTRAINT unique_user_matchday_squad UNIQUE (user_id, matchday_id);

-- Prevent duplicate watch party names
ALTER TABLE watch_parties ADD CONSTRAINT unique_watch_party_name UNIQUE (name);
```

---

## 5. DB Triggers for Denormalized Counters

### Posts.likes counter
```sql
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_like_insert ON post_likes;
CREATE TRIGGER post_like_insert
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes();

DROP TRIGGER IF EXISTS post_like_delete ON post_likes;
CREATE TRIGGER post_like_delete
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes();
```

### Posts.comment_count counter
```sql
CREATE OR REPLACE FUNCTION increment_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_comment_insert ON post_comments;
CREATE TRIGGER post_comment_insert
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_comments();

DROP TRIGGER IF EXISTS post_comment_delete ON post_comments;
CREATE TRIGGER post_comment_delete
  AFTER DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_comments();
```

### Tribes.member_count counter
```sql
CREATE OR REPLACE FUNCTION increment_tribe_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tribes SET member_count = member_count + 1 WHERE id = NEW.tribe_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_tribe_members()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tribes SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.tribe_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tribe_member_insert ON tribe_members;
CREATE TRIGGER tribe_member_insert
  AFTER INSERT ON tribe_members
  FOR EACH ROW
  EXECUTE FUNCTION increment_tribe_members();

DROP TRIGGER IF EXISTS tribe_member_delete ON tribe_members;
CREATE TRIGGER tribe_member_delete
  AFTER DELETE ON tribe_members
  FOR EACH ROW
  EXECUTE FUNCTION decrement_tribe_members();
```

### Stadiums avg_* + total_reviews
```sql
CREATE OR REPLACE FUNCTION update_stadium_averages()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE stadiums SET
      avg_atmosphere = COALESCE((
        SELECT AVG(atmosphere_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id
      ), 0),
      avg_food = COALESCE((
        SELECT AVG(food_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id
      ), 0),
      avg_hotel = COALESCE((
        SELECT AVG(hotel_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id
      ), 0),
      avg_safety = COALESCE((
        SELECT AVG(safety_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id
      ), 0),
      avg_rating = COALESCE((
        SELECT AVG((atmosphere_score + food_score + hotel_score + safety_score) / 4.0)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id
      ), 0),
      total_reviews = (SELECT COUNT(*)::int FROM stadium_reviews WHERE stadium_id = NEW.stadium_id)
    WHERE id = NEW.stadium_id;
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE stadiums SET
      avg_atmosphere = COALESCE((SELECT AVG(atmosphere_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id), 0),
      avg_food = COALESCE((SELECT AVG(food_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id), 0),
      avg_hotel = COALESCE((SELECT AVG(hotel_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id), 0),
      avg_safety = COALESCE((SELECT AVG(safety_score)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id), 0),
      avg_rating = COALESCE((SELECT AVG((atmosphere_score + food_score + hotel_score + safety_score) / 4.0)::numeric FROM stadium_reviews WHERE stadium_id = NEW.stadium_id), 0),
      total_reviews = (SELECT COUNT(*)::int FROM stadium_reviews WHERE stadium_id = NEW.stadium_id)
    WHERE id = NEW.stadium_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE stadiums SET
      avg_atmosphere = COALESCE((SELECT AVG(atmosphere_score)::numeric FROM stadium_reviews WHERE stadium_id = OLD.stadium_id), 0),
      avg_food = COALESCE((SELECT AVG(food_score)::numeric FROM stadium_reviews WHERE stadium_id = OLD.stadium_id), 0),
      avg_hotel = COALESCE((SELECT AVG(hotel_score)::numeric FROM stadium_reviews WHERE stadium_id = OLD.stadium_id), 0),
      avg_safety = COALESCE((SELECT AVG(safety_score)::numeric FROM stadium_reviews WHERE stadium_id = OLD.stadium_id), 0),
      avg_rating = COALESCE((SELECT AVG((atmosphere_score + food_score + hotel_score + safety_score) / 4.0)::numeric FROM stadium_reviews WHERE stadium_id = OLD.stadium_id), 0),
      total_reviews = (SELECT COUNT(*)::int FROM stadium_reviews WHERE stadium_id = OLD.stadium_id)
    WHERE id = OLD.stadium_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stadium_review_change ON stadium_reviews;
CREATE TRIGGER stadium_review_change
  AFTER INSERT OR UPDATE OR DELETE ON stadium_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_stadium_averages();
```

### Watch Parties last_message
```sql
CREATE OR REPLACE FUNCTION update_watch_party_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE watch_parties SET
    last_message = NEW.content,
    last_msg_at = NEW.created_at
  WHERE id = NEW.party_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS party_message_insert ON party_messages;
CREATE TRIGGER party_message_insert
  AFTER INSERT ON party_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_watch_party_last_message();
```

---

## 6. Schema Fixes

### Stadium Reviews — Generated overall_rating
```sql
ALTER TABLE stadium_reviews ALTER COLUMN overall_rating DROP DEFAULT;
ALTER TABLE stadium_reviews ALTER COLUMN overall_rating TYPE numeric GENERATED ALWAYS AS (
  (atmosphere_score + food_score + hotel_score + safety_score) / 4.0
) STORED;
```

**Note:** If the column already has data, drop and recreate it:
```sql
ALTER TABLE stadium_reviews DROP COLUMN overall_rating;
ALTER TABLE stadium_reviews ADD COLUMN overall_rating numeric GENERATED ALWAYS AS (
  (atmosphere_score + food_score + hotel_score + safety_score) / 4.0
) STORED;
```

---

## 7. RPC: email_has_account

```sql
CREATE OR REPLACE FUNCTION email_has_account(lookup_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  account_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = lookup_email
  ) INTO account_exists;
  RETURN account_exists;
END;
$$;

-- Grant execute to anon/authenticated
GRANT EXECUTE ON FUNCTION email_has_account(text) TO anon;
GRANT EXECUTE ON FUNCTION email_has_account(text) TO authenticated;
```

---

## 8. New `direct_messages` Table (for Messages page)

```sql
CREATE TABLE direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dm_read_participant" ON direct_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "dm_insert_sender" ON direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "dm_update_sender" ON direct_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);
```

---

## 9. Seed Default Badges for New Users (Optional)

If you want new users to see locked badges on first login, insert a badge seed row or create a function:

```sql
CREATE OR REPLACE FUNCTION seed_default_badges_for_user(new_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO passport_badges (user_id, badge_key, label, description, icon, is_unlocked)
  VALUES
    (new_user_id, 'first_login', 'First Steps', 'Log in for the first time.', 'footprint', false),
    (new_user_id, 'first_post', 'New Voice', 'Create your first post in the Fan Zone.', 'campaign', false),
    (new_user_id, 'first_prediction', 'Crystal Ball', 'Make your first match prediction.', 'psychology', false),
    (new_user_id, 'first_review', 'Critic', 'Submit your first stadium review.', 'rate_review', false),
    (new_user_id, 'ten_posts', 'Influencer', 'Create 10 posts.', 'trending_up', false),
    (new_user_id, 'correct_prediction', 'Nostradamus', 'Get a prediction right.', 'emoji_events', false),
    (new_user_id, 'tribe_member', 'Tribal', 'Join a tribe.', 'groups', false),
    (new_user_id, 'watch_party_host', 'Host', 'Create a watch party.', 'co_present', false)
  ON CONFLICT DO NOTHING;
END;
$$;
```

To auto-seed on sign-up, add a trigger on `auth.users` or call this function from `ensureUserProfile` after profile creation.

---

## How to Apply

1. Open the **Supabase Dashboard** for your project.
2. Go to **SQL Editor** → **New Query**.
3. Copy each section above and run it in order.
4. If any step fails with "relation already exists" or "policy already exists", that's safe to ignore — it means the object was already created.
5. After running, verify in **Table Editor** → (any table) → **Policies** that RLS is enabled and policies are listed.
6. Test the app — authenticated users should be able to read/write their own data, and anonymous users should only read public tables.
