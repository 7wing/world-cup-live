// src/hooks/useEvents.ts
// TanStack Query hooks for events and event_attendees.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  joinEvent,
  leaveEvent,
  fetchEventAttendees,
} from '@/api/events'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import type { Event } from '@/types'

// ─── Fetch all events ─────────────────────────────────────────────────────────

export function useEvents() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['events', user?.id],
    queryFn: () => fetchEvents(user?.id),
  })
}

// ─── Fetch single event ───────────────────────────────────────────────────────

export function useEvent(eventId: string) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['events', eventId, user?.id],
    queryFn: () => fetchEventById(eventId, user?.id),
    enabled: !!eventId,
  })
}

// ─── Create event ─────────────────────────────────────────────────────────────

export function useCreateEvent() {
  const qc = useQueryClient()
  const { push } = useNotificationStore()

  return useMutation({
    mutationFn: (
      event: Omit<Event, 'id' | 'created_at' | 'match' | 'host' | 'attendee_count' | 'is_joined'>,
    ) => createEvent(event),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      push('Event created!', 'success')
    },
    onError: () => push('Failed to create event', 'error'),
  })
}

// ─── Join event ───────────────────────────────────────────────────────────────

export function useJoinEvent() {
  const qc = useQueryClient()
  const { push } = useNotificationStore()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (eventId: string) => {
      if (!user) throw new Error('Not authenticated')
      return joinEvent(eventId, user.id)
    },

    onMutate: async (eventId) => {
      // Snapshot all matching event query caches for rollback
      const queries = qc.getQueriesData<Event[]>({ queryKey: ['events'] })
      const snapshots = new Map(queries.map(([k, v]) => [k, v]))

      // Optimistically mark this event as joined and increment attendee_count
      qc.setQueriesData<Event[]>(
        { queryKey: ['events'] },
        (old) =>
          old?.map((e) =>
            e.id === eventId
              ? { ...e, is_joined: true, attendee_count: (e.attendee_count ?? 0) + 1 }
              : e,
          ),
      )

      // Also update the single-event query
      qc.setQueryData<Event>(['events', eventId, user?.id], (old) =>
        old ? { ...old, is_joined: true, attendee_count: (old.attendee_count ?? 0) + 1 } : old,
      )

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        for (const [key, value] of context.snapshots) {
          qc.setQueryData(key, value)
        }
      }
      push('Failed to join event', 'error')
    },

    onSuccess: () => {
      push('Joined event!', 'success')
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// ─── Leave event ──────────────────────────────────────────────────────────────

export function useLeaveEvent() {
  const qc = useQueryClient()
  const { push } = useNotificationStore()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (eventId: string) => {
      if (!user) throw new Error('Not authenticated')
      return leaveEvent(eventId, user.id)
    },

    onMutate: async (eventId) => {
      const queries = qc.getQueriesData<Event[]>({ queryKey: ['events'] })
      const snapshots = new Map(queries.map(([k, v]) => [k, v]))

      // Optimistically unmark as joined and decrement attendee_count
      qc.setQueriesData<Event[]>(
        { queryKey: ['events'] },
        (old) =>
          old?.map((e) =>
            e.id === eventId
              ? { ...e, is_joined: false, attendee_count: Math.max(0, (e.attendee_count ?? 0) - 1) }
              : e,
          ),
      )

      qc.setQueryData<Event>(['events', eventId, user?.id], (old) =>
        old
          ? { ...old, is_joined: false, attendee_count: Math.max(0, (old.attendee_count ?? 0) - 1) }
          : old,
      )

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        for (const [key, value] of context.snapshots) {
          qc.setQueryData(key, value)
        }
      }
      push('Failed to leave event', 'error')
    },

    onSuccess: () => {
      push('Left event!', 'success')
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// ─── Fetch event attendees ────────────────────────────────────────────────────

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'attendees'],
    queryFn: () => fetchEventAttendees(eventId),
    enabled: !!eventId,
  })
}