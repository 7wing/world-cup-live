// src/hooks/useTribes.ts
// Phase 4: Per-tribe join loading state + DB-triggered member_count updates

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { joinTribe } from '@/api/fanzone'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

export function useJoinTribe() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const { push } = useNotificationStore()

  const joinMutation = useMutation({
    mutationFn: (tribeId: string) => {
      if (!user) throw new Error('Not authenticated')
      return joinTribe(user.id, tribeId)
    },
    onSuccess: () => {
      // Invalidate tribes query so UI gets fresh member_count from DB trigger
      qc.invalidateQueries({ queryKey: ['tribes'] })
      push('Joined tribe!', 'success')
    },
    onError: () => push('Could not join tribe', 'error'),
  })

  // Helper: check if a specific tribe is currently being joined
  const isJoining = (tribeId: string) =>
    joinMutation.isPending && joinMutation.variables === tribeId

  return { joinMutation, isJoining }
}