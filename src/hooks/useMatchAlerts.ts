// src/hooks/useMatchAlerts.ts
// Per-match alert subscription hook.
// Writes to match_alerts table when a user opts in/out of alerts for a specific match.
// Used by MatchDetailPage — the SettingsModal handles only global localStorage prefs.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  loadMatchAlerts,
  syncMatchAlertToSupabase,
  type AlertKey,
} from '@/lib/matchAlerts'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

// --------------------------------------------------------------------------
// useMatchAlertSubscription
// Returns whether the current user is subscribed to alerts for this match,
// and a toggle function.
// --------------------------------------------------------------------------

export function useMatchAlertSubscription(matchId: string) {
  const { user }  = useAuthStore()
  const qc        = useQueryClient()
  const { push }  = useNotificationStore()

  const queryKey = ['match_alerts', user?.id, matchId]

  // Check if a row already exists for this user + match
  const { data: isSubscribed = false, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<boolean> => {
      if (!user) return false
      const { data } = await supabase
        .from('match_alerts')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('match_id', matchId)
        .maybeSingle()
      return data !== null
    },
    enabled: !!user && !!matchId,
  })

  // Subscribe — upserts a match_alerts row using current global prefs
  const { mutate: subscribe, isPending: subscribing } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not signed in')
      const alerts = loadMatchAlerts()
      await syncMatchAlertToSupabase(user.id, matchId, alerts)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      push('Match alerts enabled', 'success')
    },
    onError: () => push('Failed to enable alerts', 'error'),
  })

  // Unsubscribe — deletes the match_alerts row
  const { mutate: unsubscribe, isPending: unsubscribing } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not signed in')
      const { error } = await supabase
        .from('match_alerts')
        .delete()
        .eq('user_id', user.id)
        .eq('match_id', matchId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey })
      push('Match alerts disabled', 'success')
    },
    onError: () => push('Failed to disable alerts', 'error'),
  })

  function toggle() {
    if (isSubscribed) unsubscribe()
    else subscribe()
  }

  return {
    isSubscribed,
    isLoading,
    isPending: subscribing || unsubscribing,
    toggle,
  }
}