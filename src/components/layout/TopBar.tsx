import { Link, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Avatar } from '@/components/ui/Avatar'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { fetchStadiums } from '@/api/stadiums'
import { fetchTribes } from '@/api/fanzone'
import { cn } from '@/utils/cn'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const NAV_LINKS = [
  { to: '/matches',   key: 'nav.matches' as const,  exact: false },
  { to: '/fan-zone',  key: 'nav.fanZone' as const,  exact: true  },
  { to: '/games',     key: 'nav.games'  as const,  exact: false },
  { to: '/stadiums',  key: 'nav.stadiums' as const, exact: false },
]

export const TopBar = React.memo(function TopBar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const setSettingsOpen = useSettingsStore((s) => s.setOpen)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const avatarFallback = user?.username
    ? user.username.charAt(0).toUpperCase()
    : '👤'

  const profileTo = user ? `/profile/${user.id}` : '/login'

  const handlePrefetch = (to: string) => {
    if (to === '/games' || to.startsWith('/games')) {
      qc.prefetchQuery({ queryKey: ['tribes'], queryFn: fetchTribes, staleTime: 60_000 })
    }
    if (to === '/stadiums' || to.startsWith('/stadiums')) {
      qc.prefetchQuery({ queryKey: ['stadiums'], queryFn: fetchStadiums, staleTime: 60_000 })
    }
  }

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname.startsWith(to)

  return (
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
          aria-label={t('nav.home')}
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
          {NAV_LINKS.map(({ to, key, exact }) => {
            const active = isActive(to, exact)
            return (
              <Link
                key={to}
                to={to}
                onMouseEnter={() => handlePrefetch(to)}
                onFocus={() => handlePrefetch(to)}
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
                {t(key)}
              </Link>
            )
          })}
        </nav>

        {/* Desktop right side — settings + profile */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Discover */}
          <Link
            to="/discover"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-white/40 hover:text-primary-container hover:bg-primary-container/10 transition-colors"
            aria-label={t('nav.discover')}
          >
            <span className="material-symbols-outlined text-[18px]">person_search</span>
          </Link>

          {/* Messages */}
          <Link
            to="/messages"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-white/40 hover:text-primary-container hover:bg-primary-container/10 transition-colors"
            aria-label={t('common.messages')}
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
          </Link>

          {/* Language */}
          <LanguageToggle />

          {/* Settings */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
            aria-label={t('nav.settings')}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>

          {/* Profile */}
          <Link
            to={profileTo}
            className="flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            style={{ border: '1px solid rgba(255,255,255,0.10)' }}
            aria-label={user ? t('nav.profile') : t('nav.login')}
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

        {/* Mobile profile */}
        <Link
          to={profileTo}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
          style={{ border: '1px solid rgba(255,255,255,0.10)' }}
          aria-label={user ? t('nav.profile') : t('nav.login')}
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
    </header>
  )
})