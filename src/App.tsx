import { Outlet } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
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

  return (
    <div className="dark min-h-screen bg-background">
      <TopBar />
      <NotificationToast />
      <Outlet />
      <BottomNav />
    </div>
  )
}