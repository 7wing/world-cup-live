import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

const tabs = [
  { to: '/matches',  icon: 'sports_soccer',  label: 'Matches',  exact: false },
  { to: '/fan-zone', icon: 'groups',          label: 'Fan Zone', exact: true  },
  { to: '/games',    icon: 'sports_esports',  label: 'Games',    exact: false },
  { to: '/stadiums', icon: 'stadium',         label: 'Stadiums', exact: false },
] as const

export function BottomNav() {
  const { pathname } = useLocation()

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to)

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-0.5 px-2 py-2 rounded-full',
        'supports-[backdrop-filter]:bg-black/70',
      )}
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      {tabs.map(({ to, icon, label, exact }) => {
        const active = isActive(to, exact)
        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            title={label}
            className="relative flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 active:scale-95"
            style={
              active
                ? {
                    background:
                      'color-mix(in srgb, var(--color-green) 12%, transparent)',
                    color: 'var(--color-green)',
                  }
                : undefined
            }
          >
            {active && (
              <span
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'var(--color-green)',
                  boxShadow:
                    '0 0 5px color-mix(in srgb, var(--color-green) 90%, transparent)',
                }}
              />
            )}
            <span
              className={cn(
                'material-symbols-outlined text-[26px] leading-none',
                !active && 'text-white/45 hover:text-white/80',
              )}
              style={
                active
                  ? {
                      filter:
                        'drop-shadow(0 0 6px color-mix(in srgb, var(--color-green) 50%, transparent))',
                    }
                  : undefined
              }
            >
              {icon}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}