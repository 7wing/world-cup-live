-- Enable required extensions for cron and HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule sync-matches edge function every 5 minutes.
-- Uses the public anon key (safe to embed) since edge function invocation
-- only needs a valid Supabase token — authorization logic is handled
-- internally by the function using SUPABASE_SERVICE_ROLE_KEY.
SELECT cron.schedule(
  'sync-matches-5min',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://lrsphlbeqdqgsxwkmrlf.supabase.co/functions/v1/sync-matches',
      headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3BobGJlcWRxZ3N4d2ttcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDMxMDIsImV4cCI6MjA5NDU3OTEwMn0.XiSHi9k_uxnB8oNjWfUc_JOzKz2ywz98W7yfgbrpNu0", "Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
