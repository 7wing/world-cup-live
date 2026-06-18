-- Fix missing triggers: posts.likes and posts.comment_count
-- Run with:  supabase db push   (or apply manually in Supabase SQL Editor)

-- ── Like count triggers ─────────────────────────────────────────────────────

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

DROP TRIGGER IF EXISTS post_likes_insert ON post_likes;
DROP TRIGGER IF EXISTS post_likes_delete ON post_likes;

CREATE TRIGGER post_likes_insert
  AFTER INSERT ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_likes();

CREATE TRIGGER post_likes_delete
  AFTER DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_likes();

-- ── Comment count triggers ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_comments_insert ON post_comments;
DROP TRIGGER IF EXISTS post_comments_delete ON post_comments;

CREATE TRIGGER post_comments_insert
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_comment_count();

CREATE TRIGGER post_comments_delete
  AFTER DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_post_comment_count();
