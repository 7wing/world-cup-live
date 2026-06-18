// src/api/events.ts
// Supabase queries for: events, event_attendees

import { supabase } from '@/lib/supabase'
import type { Event, EventAttendee } from '@/types'

// ── Shared select fragment for fully-hydrated Event object ────────────────────
// Includes: match (home_team, away_team), host (created_by → users)
const EVENT_SELECT = `
  *,
  match:matches!events_match_id_fkey(
    kickoff_at,
    home_team:teams!matches_home_team_id_fkey(name, flag_url),
    away_team:teams!matches_away_team_id_fkey(name, flag_url)
  ),
  host:users!events_created_by_fkey(username, avatar_url)
`

// ── Core event queries ────────────────────────────────────────────────────────

export async function fetchEvents(userId?: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .order('starts_at', { ascending: true })

  if (error) throw error

  const raw = (data ?? []) as Event[]

  if (raw.length === 0) return raw

  // Attach attendee_count via RPC for each event
  const withCounts = await Promise.all(
    raw.map(async (event) => {
      const { data: countData } = await supabase.rpc('get_event_attendee_count', {
        event_uuid: event.id,
      })
      return { ...event, attendee_count: (countData as number) ?? 0 } as Event
    }),
  )

  // If a userId is provided, also compute is_joined
  if (!userId) return withCounts

  const eventIds = withCounts.map((e) => e.id)
  const { data: attendeeRows } = await supabase
    .from('event_attendees')
    .select('event_id')
    .eq('user_id', userId)
    .in('event_id', eventIds)

  const joinedSet = new Set((attendeeRows ?? []).map((r: { event_id: string }) => r.event_id))
  return withCounts.map((e) => ({ ...e, is_joined: joinedSet.has(e.id) }))
}

export async function fetchEventById(eventId: string, userId?: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('id', eventId)
    .single()

  if (error) throw error

  let event = data as Event

  // Attach attendee count via RPC
  const { data: countData } = await supabase.rpc('get_event_attendee_count', {
    event_uuid: eventId,
  })
  event = { ...event, attendee_count: (countData as number) ?? 0 }

  // Attach is_joined if userId provided
  if (userId) {
    const { data: row } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle()

    event = { ...event, is_joined: row !== null }
  }

  return event
}

export async function createEvent(
  event: Omit<Event, 'id' | 'created_at' | 'match' | 'host' | 'attendee_count' | 'is_joined'>,
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select(EVENT_SELECT)
    .single()

  if (error) throw error
  return { ...(data as Event), attendee_count: 0, is_joined: false }
}

// ── Attendees ─────────────────────────────────────────────────────────────────

export async function joinEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('event_attendees')
    .insert({ event_id: eventId, user_id: userId })

  if (error) throw error
}

export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function fetchEventAttendees(eventId: string): Promise<EventAttendee[]> {
  const { data, error } = await supabase
    .from('event_attendees')
    .select('*, user:users(username, avatar_url)')
    .eq('event_id', eventId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return data as EventAttendee[]
}