import { create } from 'zustand'
import type { Match } from '@/types'

interface MatchState {
  liveMatches: Match[]
  selectedMatch: Match | null
  setLiveMatches: (matches: Match[]) => void
  updateMatch: (id: string, data: Partial<Match>) => void
  setSelectedMatch: (match: Match | null) => void
}

export const useMatchStore = create<MatchState>((set) => ({
  liveMatches: [],
  selectedMatch: null,
  setLiveMatches: (liveMatches) => set({ liveMatches }),
  updateMatch: (id, data) =>
    set((state) => ({
      liveMatches: state.liveMatches.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    })),
  setSelectedMatch: (selectedMatch) => set({ selectedMatch }),
}))