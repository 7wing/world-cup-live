import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from 'react-i18next'

// ─── component ───────────────────────────────────────────────────────────────

export function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { push }  = useNotificationStore()
  const user = useAuthStore((s) => s.user)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading,  setLoading]  = useState(false)

  // If the user is already logged in, redirect them away from the signup page
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/matches'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Server-side upsert handles collisions naturally — no pre-flight check needed
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      })

      if (error) {
        push(error.message, 'error')
        setLoading(false)
        return
      }

      // If email confirmation is disabled the user is already confirmed.
      // Skip the holding page and send them straight into the app.
      const isConfirmed = Boolean(data?.user?.email_confirmed_at)

      if (isConfirmed) {
        push('Account created! Welcome.', 'success')
        navigate('/matches', { replace: true })
      } else {
        // If Supabase email confirmation is enabled the user lands here unconfirmed.
        // Send them to a holding page so they know to check their inbox rather than
        // dropping them into /matches in a half-authenticated state.
        push('Account created! Check your email to confirm.', 'success')
        navigate('/check-email', { replace: true, state: { email } })
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
          <h2 className="font-lexend font-bold text-xl sm:text-2xl text-center mb-7">
            {t('nav.signup')}
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* ── Fan ID (username) ── */}
            <div>
              <label className="font-lexend text-[10px] uppercase text-outline font-semibold block mb-2">
                {t('common.fanId')}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input w-full"
                placeholder="CR7_GOAT_2026"
                autoComplete="off"
              />
            </div>

            {/* ── Email ── */}
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

            {/* ── Password ── */}
            <div>
              <PasswordInput
                label={t('common.password')}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <NeonButton
              type="submit"
              className="w-full justify-center mt-2"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('nav.signup')}
            </NeonButton>
          </form>

          <p className="text-center text-white/50 text-xs sm:text-sm mt-5">
            {t('nav.login')}{' '}
            <Link to="/login" className="font-lexend font-bold text-primary-container hover:text-green-300">
              {t('nav.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}