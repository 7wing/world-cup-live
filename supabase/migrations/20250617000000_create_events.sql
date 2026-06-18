-- Migration: create events and event_attendees tables
-- Run once against the Supabase database.

BEGIN;

-- ── events table ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id            uuid            DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text            NOT NULL,
  description   text,
  type          text            NOT NULL CHECK (type IN ('virtual', 'physical')),
  location      text,
  link          text,
  match_id      text,
  created_by    uuid            NOT NULL REFERENCES users(id),
  max_attendees integer         NOT NULL DEFAULT 50,
  starts_at     timestamptz     NOT NULL,
  created_at    timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_match_id_idx     ON events(match_id);
CREATE INDEX IF NOT EXISTS events_created_by_idx   ON events(created_by);
CREATE INDEX IF NOT EXISTS events_starts_at_idx    ON events(starts_at);

ALTER TABLE events
  ADD CONSTRAINT events_match_id_fkey
  FOREIGN KEY (match_id) REFERENCES matches(id)
  ON DELETE SET NULL;

-- ── event_attendees table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_attendees (
  event_id  uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id   uuid        NOT NULL REFERENCES users(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_attendees_user_id_idx ON event_attendees(user_id);

-- ── get_event_attendee_count function ────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_event_attendee_count(event_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT count(*)::integer FROM event_attendees WHERE event_id = event_uuid;
$$;

COMMIT;