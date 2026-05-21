import { create } from 'zustand'

interface SettingsState {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
