-- Make trigger functions run as owner so they can UPDATE posts
-- even when the authenticated user lacks UPDATE permission.

CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_post_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE posts SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

-- Backfill correct counts from actual rows
UPDATE posts SET
  likes = COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id), 0),
  comment_count = COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id), 0);
