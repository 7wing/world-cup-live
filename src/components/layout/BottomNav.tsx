import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

const tabs = [
  { to: '/matches', icon: 'sports_soccer', label: 'Matches' },
  { to: '/fan-zone', icon: 'groups', label: 'Fan Zone' },
  { to: '/passport', icon: 'military_tech', label: 'Passport' },
  { to: '/stadiums', icon: 'stadium', label: 'Stadiums' },
] as const

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-0.5 px-2 py-2 rounded-full',
        'bg-black/85 backdrop-blur-md',
        'shadow-[0_8px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.07)]',
        'supports-[backdrop-filter]:bg-black/70',
      )}
    >
      {tabs.map(({ to, icon, label }) => {
        const active = pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            title={label}
            className={cn(
              'relative flex items-center justify-center',
              'w-12 h-12 rounded-full transition-colors duration-200 active:scale-95',
              active
                ? 'bg-[#00ff41]/12 text-[#00ff41]'
                : 'text-white/45 hover:text-white/80 hover:bg-white/5',
            )}
          >
            {active && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#00ff41] shadow-[0_0_5px_rgba(0,255,65,0.9)]" />
            )}
            <span
              className={cn(
                'material-symbols-outlined text-[26px] leading-none',
                active && 'drop-shadow-[0_0_6px_rgba(0,255,65,0.5)]',
              )}
            >
              {icon}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
