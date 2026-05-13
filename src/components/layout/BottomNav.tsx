import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

const tabs = [
  { to: '/matches', icon: 'sports_soccer', label: 'Matches' },
  { to: '/fan-zone', icon: 'groups', label: 'Fan Zone' },
  { to: '/passport', icon: 'military_tech', label: 'Passport' },
  { to: '/stadiums', icon: 'stadium', label: 'Stadiums' },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-black/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {tabs.map(({ to, icon, label }) => {
        const active = pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex flex-col items-center justify-center transition-all active:scale-110 duration-150',
              active
                ? 'text-primary-container drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]'
                : 'text-white/40 hover:text-green-200'
            )}
          >
            <span className="material-symbols-outlined mb-1">{icon}</span>
            <span className="font-lexend text-[10px] font-bold uppercase">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}