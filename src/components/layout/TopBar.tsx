import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'

const navLinks = [
  { to: '/matches', label: 'Matches' },
  { to: '/fan-zone', label: 'Fan Zone' },
  { to: '/stadiums', label: 'Stadiums' },
  { to: '/passport', label: 'Passport' },
]

export function TopBar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_0_15px_rgba(0,255,65,0.2)] flex justify-between items-center px-5 h-16">
      <Link to="/" className="text-2xl font-black text-primary-container italic font-lexend uppercase tracking-tighter neon-text">
        WORLD CUP LIVE
      </Link>

      <nav className="hidden md:flex gap-8 h-full items-center">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'font-lexend uppercase tracking-tighter text-sm transition-colors duration-200 h-full flex items-center',
              pathname.startsWith(to)
                ? 'text-primary-container border-b-2 border-primary-container'
                : 'text-white/60 hover:text-green-300'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button className="text-white/60 hover:text-primary-container transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <Link to={user ? `/profile/${user.id}` : '/login'}>
          <Avatar src={user?.avatar_url} username={user?.username} size="sm" />
        </Link>
      </div>
    </header>
  )
}