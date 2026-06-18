# Events Page Implementation Plan

## Goal
Add a dedicated "Events" page where users can host and join watch party events (virtual or physical), visible in the main navigation.

## Architecture Overview
- **Data store**: Supabase (new `events` + `event_attendees` tables)
- **State management**: TanStack Query for server state, Zustand (existing) for local
- **Routing**: React Router, lazy-loaded page
- **Styling**: Tailwind CSS v4, existing design system variables

## Database Schema

### `events` table
| Column        | Type                     | Notes                          |
|---------------|--------------------------|--------------------------------|
| id            | uuid                     | PK, default gen_random_uuid()  |
| name          | text                     | not null                       |
| description   | text                     |                                |
| type          | text                     | 'virtual' or 'physical', not null |
| location      | text                     | physical address               |
| link          | text                     | virtual meeting link           |
| match_id      | uuid                     | FK → matches.id, nullable      |
| created_by    | uuid                     | FK → users.id, not null        |
| max_attendees | int                      | default 50                     |
| starts_at     | timestamptz              | not null                       |
| created_at    | timestamptz              | default now()                  |

### `event_attendees` table
| Column        | Type        | Notes                         |
|---------------|-------------|-------------------------------|
| event_id      | uuid        | FK → events.id, not null      |
| user_id       | uuid        | FK → users.id, not null       |
| joined_at     | timestamptz | default now()                 |
| PK(event_id, user_id) |     |                               |

## Supabase RLS (basic)
- `events`: SELECT public, INSERT authenticated (created_by = auth.uid())
- `event_attendees`: SELECT public, INSERT authenticated (user_id = auth.uid()), DELETE own row

## Chunks

### Chunk 1: Data Layer & Types
**Files:**
- `supabase/migrations/20250617000000_create_events.sql`
- `src/types/index.ts` (append Event + EventAttendee interfaces)
- `src/lib/supabase.ts` (append DB types for events + event_attendees)
- `src/api/events.ts` (fetchEvents, fetchEventById, createEvent, joinEvent, leaveEvent, fetchEventAttendees)
- `src/hooks/useEvents.ts` (useEvents, useEvent, useCreateEvent, useJoinEvent, useLeaveEvent)

**Complexity:** simple (CRUD via Supabase, standard TanStack Query patterns)

### Chunk 2: UI Page & Components
**Files:**
- `src/pages/events/EventsPage.tsx` (main page with list, filters, host modal trigger)
- `src/components/events/EventCard.tsx` (individual event card with join/leave)
- `src/components/events/HostEventModal.tsx` (form to create new event)
- `src/router/index.tsx` (add /events route)

**Complexity:** simple (React form + list, no concurrency)

### Chunk 3: Navigation & Translations
**Files:**
- `src/components/layout/BottomNav.tsx` (add events tab)
- `src/components/layout/TopBar.tsx` (add events link)
- `src/i18n/locales/en.json` (add nav.events, events.* keys)
- `src/i18n/locales/ar.json` (same structure)
- `src/i18n/locales/es.json` (same structure)
- `src/i18n/locales/fr.json` (same structure)
- `src/i18n/locales/pt.json` (same structure)

**Complexity:** simple (text copy, nav updates)

## Acceptance Criteria
1. `/events` route renders a page with list of events
2. Events can be filtered by Virtual / Physical / All
3. Authenticated users can click "Host Event" to open a modal with form (name, description, type, location/link, match select, max attendees, start time)
4. Authenticated users can join/leave events from the list
5. Each event card shows: name, type badge, start time, attendee count / max, match info if linked, host avatar
6. Events nav item appears in both desktop top nav and mobile bottom nav
7. All 5 supported languages have translations for events UI
8. Build passes (`npm run build` exits 0)
