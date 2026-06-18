-- Drop ALL triggers on post_likes & post_comments (removes duplicates)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT trigger_name FROM information_schema.triggers
    WHERE event_object_table = 'post_likes' AND trigger_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON post_likes', rec.trigger_name);
  END LOOP;

  FOR rec IN
    SELECT trigger_name FROM information_schema.triggers
    WHERE event_object_table = 'post_comments' AND trigger_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON post_comments', rec.trigger_name);
  END LOOP;
END $$;

-- Recreate functions
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Recreate single triggers
CREATE TRIGGER post_likes_insert
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes();

CREATE TRIGGER post_likes_delete
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes();

CREATE TRIGGER post_comments_insert
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_comment_count();

CREATE TRIGGER post_comments_delete
  AFTER DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_comment_count();

-- Backfill correct counts from actual row counts
UPDATE posts
SET
  likes = COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id), 0),
  comment_count = COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id), 0);
