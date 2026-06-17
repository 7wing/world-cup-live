import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from 'react-i18next'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { push } = useNotificationStore()
  const user = useAuthStore((s) => s.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // If the user is already logged in, redirect them away from the login page
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/matches'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        push(error.message, 'error')
      } else if (data?.session) {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/matches'
        navigate(from, { replace: true })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      push(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="
        min-h-[100dvh]
        flex flex-col items-center justify-center
        px-4 sm:px-6
        pt-[calc(5rem+env(safe-area-inset-top,0px))]
        lg:pt-24
        pb-[calc(7rem+env(safe-area-inset-bottom,0px))]
        lg:pb-12
      "
    >
      <div className="w-full max-w-sm">
        <div className="glass-card p-6 sm:p-8 rounded-2xl">
          <h2 className="font-lexend font-bold text-xl sm:text-2xl text-center mb-1">
            {t('nav.login')}
          </h2>
          <p className="text-center text-white/50 text-xs sm:text-sm mb-7">
            {t('onboarding.welcome')}
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-lexend text-[10px] uppercase text-outline font-semibold block mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input w-full"
                placeholder="fan@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-lexend text-[10px] uppercase text-outline font-semibold">
                  {t('common.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="font-lexend text-[10px] uppercase text-primary-container hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <PasswordInput
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <NeonButton type="submit" className="w-full justify-center mt-2" disabled={loading}>
              {loading ? t('common.loading') : t('nav.login')}
            </NeonButton>
          </form>

          <p className="text-center text-white/50 text-xs sm:text-sm mt-7">
            New here?{' '}
            <Link to="/signup" className="font-lexend font-bold text-primary-container hover:text-green-300">
              {t('nav.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}