import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

const tabs = [
  { to: '/matches',  icon: 'sports_soccer', label: 'Matches'  },
  { to: '/fan-zone', icon: 'groups',         label: 'Fan Zone' },
  { to: '/passport', icon: 'military_tech',  label: 'Passport' },
  { to: '/stadiums', icon: 'stadium',         label: 'Stadiums' },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className={cn(
        // Floating pill — fixed above the bottom edge, not stuck to it
        'md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50',
        // Pill shape
        'flex items-center gap-1 px-3 py-2 rounded-[28px]',
        // Glass surface — matches TopBar aesthetic
        'bg-black/75 backdrop-blur-2xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.07)]',
      )}
    >
      {tabs.map(({ to, icon, label }) => {
        const active = pathname.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5',
              'px-4 py-2 rounded-[20px] transition-all duration-200 active:scale-95',
              active
                ? 'bg-[#00ff41]/12 text-[#00ff41]'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5',
            )}
          >
            {/* Active glow dot */}
            {active && (
              <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#00ff41] shadow-[0_0_5px_rgba(0,255,65,0.9)]" />
            )}

            <span
              className={cn(
                'material-symbols-outlined text-[22px] leading-none transition-all duration-200',
                active && 'drop-shadow-[0_0_6px_rgba(0,255,65,0.6)]',
              )}
            >
              {icon}
            </span>

            <span className="font-lexend text-[9px] font-bold uppercase tracking-wide leading-none">
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}