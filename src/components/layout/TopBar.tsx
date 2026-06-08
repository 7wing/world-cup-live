import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'
import { useState, useEffect } from 'react'

const navLinks = [
  { to: '/matches',   label: 'Matches',  exact: false },
  { to: '/fan-zone',  label: 'Fan Zone', exact: true  },
  { to: '/games',     label: 'Games',    exact: false },
  { to: '/stadiums',  label: 'Stadiums', exact: false },
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

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to)

  return (
    <>
      <header
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50',
          'w-[calc(100%-2rem)] max-w-4xl',
          'rounded-2xl',
          'transition-all duration-500 ease-out',
          'flex items-center justify-between px-4 sm:px-5 h-14',
        )}
        style={{
          background: scrolled ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.40)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: scrolled
            ? '0 8px 32px color-mix(in srgb, var(--color-green) 15%, transparent), 0 0 0 1px rgba(255,255,255,0.07)'
            : '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2 shrink-0"
          aria-label="Home"
        >
          <span
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'color-mix(in srgb, var(--color-green) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-green) 30%, transparent)',
              color: 'var(--color-green)',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">sports_soccer</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 h-full">
          {navLinks.map(({ to, label, exact }) => {
            const active = isActive(to, exact)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'relative px-4 py-1.5 rounded-xl',
                  'font-lexend uppercase tracking-tight text-xs font-semibold',
                  'transition-all duration-300 ease-out',
                  active ? 'text-[--color-green]' : 'text-white/50 hover:text-white/90',
                )}
                style={
                  active
                    ? { background: 'color-mix(in srgb, var(--color-green) 10%, transparent)' }
                    : undefined
                }
              >
                {active && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{
                      background: 'var(--color-green)',
                      boxShadow: '0 0 6px color-mix(in srgb, var(--color-green) 80%, transparent)',
                    }}
                  />
                )}
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop right side — settings + profile */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Settings */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>

          {/* Profile */}
          <Link
            to={profileTo}
            className="flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            aria-label={user ? 'Profile' : 'Login'}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor =
                'color-mix(in srgb, var(--color-green) 50%, transparent)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)')
            }
          >
            {user?.avatar_url ? (
              <Avatar src={user.avatar_url} username={user.username} size="sm" />
            ) : (
              <span
                className="w-full h-full flex items-center justify-center font-lexend font-bold text-xs uppercase"
                style={{
                  background: 'color-mix(in srgb, var(--color-green) 15%, transparent)',
                  color: 'var(--color-green)',
                }}
              >
                {avatarFallback}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined text-[22px]">
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </header>

      {/* Mobile dropdown */}
      <div
        className={cn(
          'fixed top-[4.5rem] left-1/2 -translate-x-1/2 z-40 md:hidden',
          'w-[calc(100%-2rem)] max-w-sm',
          'rounded-2xl overflow-hidden',
          'shadow-[0_16px_40px_rgba(0,0,0,0.5)]',
          'transition-all duration-300 ease-out',
          mobileOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none',
        )}
        style={{
          background: 'rgba(0,0,0,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <nav className="flex flex-col p-2 gap-0.5">
          {navLinks.map(({ to, label, exact }) => {
            const active = isActive(to, exact)
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl',
                  'font-lexend uppercase tracking-tight text-sm font-semibold transition-colors',
                  active ? 'text-[--color-green]' : 'text-white/50 hover:text-white hover:bg-white/5',
                )}
                style={
                  active
                    ? { background: 'color-mix(in srgb, var(--color-green) 10%, transparent)' }
                    : undefined
                }
              >
                {active && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--color-green)' }}
                  />
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
            <span
              className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            >
              {user?.avatar_url ? (
                <Avatar src={user.avatar_url} username={user.username} size="sm" />
              ) : (
                <span
                  className="w-full h-full flex items-center justify-center font-lexend font-bold text-xs"
                  style={{
                    background: 'color-mix(in srgb, var(--color-green) 15%, transparent)',
                    color: 'var(--color-green)',
                  }}
                >
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

      {/* Mobile backdrop */}
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