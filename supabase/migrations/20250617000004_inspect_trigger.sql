-- Inspect triggers
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_table IN ('post_likes', 'post_comments')
  LOOP
    RAISE NOTICE 'Trigger: % on % → %', t.trigger_name, t.event_manipulation, t.action_statement;
  END LOOP;
END $$;

-- Test trigger directly
INSERT INTO post_likes (post_id, user_id) VALUES ('82c438ce-ad42-446e-a7d3-aaff98ad6932', 'f6f89a4f-a99b-4641-b98e-ef2a5831e6d6');
DELETE FROM post_likes WHERE post_id = '82c438ce-ad42-446e-a7d3-aaff98ad6932' AND user_id = 'f6f89a4f-a99b-4641-b98e-ef2a5831e6d6';
