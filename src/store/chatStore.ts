import { create } from 'zustand'
import type { ChatMessage } from '@/types'

interface ChatState {
  messages: Record<string, ChatMessage[]>
  addMessage: (matchId: string, msg: ChatMessage) => void
  setMessages: (matchId: string, msgs: ChatMessage[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  addMessage: (matchId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] ?? []), msg],
      },
    })),
  setMessages: (matchId, msgs) =>
    set((state) => ({
      messages: { ...state.messages, [matchId]: msgs },
    })),
}))