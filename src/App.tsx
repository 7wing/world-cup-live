import React, { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { SettingsModal } from '@/components/profile/SettingsModal'
import { useAuth } from '@/hooks/useAuth'
import { useFlagWarmer } from '@/hooks/useFlagWarmer'
import { useNotificationStore } from '@/store/notificationStore'
import { cn } from '@/utils/cn'

const FONTS_TIMEOUT_MS = 2500

function useFontsReady() {
  useEffect(() => {
    const fontsReady = document.fonts.ready
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, FONTS_TIMEOUT_MS))
    Promise.race([fontsReady, timeout]).then(() => {
      document.documentElement.classList.add('fonts-ready')
    })
  }, [])
}

function NotificationToast() {
  const { notifications } = useNotificationStore()
  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            'glass-card px-4 py-3 rounded-lg text-sm font-lexend font-semibold uppercase tracking-wide',
            n.type === 'success' && 'border-l-2 border-primary-container text-primary-container',
            n.type === 'error' && 'border-l-2 border-error text-error',
            n.type === 'info' && 'border-l-2 border-white/40 text-white/60'
          )}
        >
          {n.message}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  useFontsReady()
  useFlagWarmer()
  useAuth()

  // Apply team colour theme from localStorage
  useEffect(() => {
    const team = localStorage.getItem('preferredTeam')
    if (team) {
      document.documentElement.dataset.team = team
    } else {
      delete document.documentElement.dataset.team
    }
  }, [])

  return (
    <div className="dark min-h-screen bg-background">
      <TopBar />
      <NotificationToast />
      <SettingsModal />
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
      <BottomNav />
    </div>
  )
}

// ── Page Skeleton (shown while lazy-loaded chunks download) ─────────────────

function PageSkeleton() {
  return (
    <PageWrapper>
      <div className="glass-card h-28 rounded-xl animate-pulse mb-5" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <div className="h-64 glass-card rounded-xl animate-pulse" />
          <div className="h-32 glass-card rounded-xl animate-pulse" />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <div className="h-40 glass-card rounded-xl animate-pulse" />
          <div className="h-40 glass-card rounded-xl animate-pulse" />
        </div>
      </div>
    </PageWrapper>
  )
}

// ── Helper: call this from your settings/onboarding save handler ─────────────
// Move to src/utils/theme.ts if you prefer:
//
// export function applyTeamTheme(team: string | null) {
//   if (team) {
//     localStorage.setItem('preferredTeam', team)
//     document.documentElement.dataset.team = team
//   } else {
//     localStorage.removeItem('preferredTeam')
//     delete document.documentElement.dataset.team
//   }
// }