import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMatchStore } from '@/store/matchStore'
import { useChatStore } from '@/store/chatStore'
import type { ChatMessage, Match } from '@/types'

export function useRealtimeMatch(matchId: string) {
  const { updateMatch } = useMatchStore()
  const { addMessage } = useChatStore()

  useEffect(() => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => updateMatch(matchId, payload.new as Match)
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `match_id=eq.${matchId}` },
        (payload) => addMessage(matchId, payload.new as ChatMessage)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId, updateMatch, addMessage])
}