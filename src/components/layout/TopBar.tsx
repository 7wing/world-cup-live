import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'
import { useState, useEffect } from 'react'

const navLinks = [
  { to: '/matches', label: 'Matches' },
  { to: '/fan-zone', label: 'Fan Zone' },
  { to: '/stadiums', label: 'Stadiums' },
  { to: '/passport', label: 'Passport' },
]

export function TopBar() {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const setSettingsOpen = useSettingsStore((s) => s.setOpen)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const avatarFallback = user?.username
    ? user.username.charAt(0).toUpperCase()
    : '👤'

  const profileTo = user ? `/profile/${user.id}` : '/login'

  return (
    <>
      <header
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50',
          'w-[calc(100%-2rem)] max-w-4xl',
          'rounded-2xl',
          'transition-all duration-500 ease-out',
          scrolled
            ? 'bg-black/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,255,65,0.15),0_0_0_1px_rgba(255,255,255,0.07)]'
            : 'bg-black/40 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]',
          'flex items-center justify-between px-4 sm:px-5 h-14'
        )}
      >
        <Link
          to="/"
          className="group flex items-center gap-2 shrink-0"
          aria-label="Home"
        >
          <span
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-xl',
              'bg-[#00ff41]/10 border border-[#00ff41]/30',
              'text-[#00ff41] text-base',
              'transition-all duration-300',
              'group-hover:bg-[#00ff41]/20 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(0,255,65,0.5)]'
            )}
          >
            <span className="material-symbols-outlined text-[18px]">sports_soccer</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 h-full">
          {navLinks.map(({ to, label }) => {
            const active = pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative px-4 py-1.5 rounded-xl',
                  'font-lexend uppercase tracking-tight text-xs font-semibold',
                  'transition-all duration-300 ease-out',
                  active
                    ? 'text-[#00ff41] bg-[#00ff41]/10'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                )}
              >
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00ff41] shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
                )}
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop: profile only */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            to={profileTo}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden',
              'ring-1 ring-white/10 hover:ring-[#00ff41]/50',
              'transition-all duration-300 hover:scale-105'
            )}
            aria-label={user ? 'Profile' : 'Login'}
          >
            {user?.avatar_url ? (
              <Avatar src={user.avatar_url} username={user.username} size="sm" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-[#00ff41]/15 text-[#00ff41] font-lexend font-bold text-xs uppercase">
                {avatarFallback}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile: menu only */}
        <button
          type="button"
          className={cn(
            'md:hidden flex items-center justify-center w-10 h-10 rounded-xl',
            'text-white/60 hover:text-white hover:bg-white/5 transition-colors'
          )}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined text-[22px]">
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </header>

      <div
        className={cn(
          'fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-40 md:hidden',
          'w-[calc(100%-2rem)] max-w-sm',
          'rounded-2xl overflow-hidden',
          'bg-black/90 border border-white/8',
          'shadow-[0_16px_40px_rgba(0,0,0,0.5)]',
          'transition-all duration-300 ease-out',
          mobileOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        )}
      >
        <nav className="flex flex-col p-2 gap-0.5">
          {navLinks.map(({ to, label }) => {
            const active = pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl',
                  'font-lexend uppercase tracking-tight text-sm font-semibold transition-colors',
                  active
                    ? 'text-[#00ff41] bg-[#00ff41]/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] shrink-0" />
                )}
                {label}
              </Link>
            )
          })}

          <div className="my-1 border-t border-white/8" />

          <Link
            to={profileTo}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 transition-colors"
          >
            <span className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center shrink-0">
              {user?.avatar_url ? (
                <Avatar src={user.avatar_url} username={user.username} size="sm" />
              ) : (
                <span className="w-full h-full flex items-center justify-center bg-[#00ff41]/15 text-[#00ff41] font-lexend font-bold text-xs">
                  {avatarFallback}
                </span>
              )}
            </span>
            <span className="font-lexend font-semibold text-sm uppercase">
              {user ? 'Profile' : 'Sign in'}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false)
              setSettingsOpen(true)
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-xl w-8 text-center">settings</span>
            <span className="font-lexend font-semibold text-sm uppercase">Settings</span>
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
    </>
  )
}
