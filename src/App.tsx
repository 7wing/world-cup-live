import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { SettingsModal } from '@/components/profile/SettingsModal'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { cn } from '@/utils/cn'

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
      <Outlet />
      <BottomNav />
    </div>
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