import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useNotificationStore } from '@/store/notificationStore'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { push } = useNotificationStore()
  const [searchParams] = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [ready, setReady]       = useState(false)
  const [done, setDone]         = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  useEffect(() => {
    // ── Check hash fragment first (#error=access_denied&error_code=otp_expired…)
    const hash = new URLSearchParams(window.location.hash.replace('#', ''))
    const hashError = hash.get('error')
    if (hashError) {
      const desc = hash.get('error_description')?.replace(/\+/g, ' ') ?? 'This reset link is invalid or has expired.'
      queueMicrotask(() => setLinkError(desc))
      return
    }

    // ── token_hash in query params (Supabase email format) ────────────────
    const tokenHash = searchParams.get('token_hash')
    const type      = searchParams.get('type')

    if (tokenHash && type === 'recovery') {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => {
          if (error) setLinkError(error.message)
          else setReady(true)
        })
    }
  // navigate is stable from react-router and not used inside this effect
  }, [searchParams])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      push('Passwords do not match.', 'error')
      return
    }
    if (password.length < 6) {
      push('Password must be at least 6 characters.', 'error')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      push(error.message, 'error')
    } else {
      setDone(true)
      push('Password updated! Redirecting…', 'success')
      setTimeout(() => navigate('/matches', { replace: true }), 2000)
    }
    setLoading(false)
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

          {/* ── Expired / invalid link ── */}
          {linkError && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-400/10 flex items-center justify-center mb-2">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="font-lexend font-bold text-xl text-red-400">Link expired</h2>
              <p className="text-white/50 text-sm leading-relaxed">{linkError}</p>
              <NeonButton
                type="button"
                className="w-full justify-center"
                onClick={() => navigate('/forgot-password', { replace: true })}
              >
                Request a new link
              </NeonButton>
            </div>
          )}

          {/* ── Verifying spinner ── */}
          {!linkError && !ready && (
            <div className="text-center space-y-3 py-4">
              <div className="mx-auto w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
              <p className="text-white/50 text-sm">Verifying reset link…</p>
            </div>
          )}

          {/* ── Done ── */}
          {!linkError && ready && done && (
            <div className="text-center space-y-3 py-4">
              <p className="font-lexend font-bold text-xl text-primary-container">✓ Password updated</p>
              <p className="text-white/50 text-sm">Redirecting you to the stadium…</p>
            </div>
          )}

          {/* ── Reset form ── */}
          {!linkError && ready && !done && (
            <>
              <div className="mb-7">
                <h2 className="font-lexend font-bold text-xl sm:text-2xl text-center mb-1">
                  New Password
                </h2>
                <p className="text-center text-white/50 text-xs sm:text-sm">
                  Choose a strong password for your fan account.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <PasswordInput
                  label="New Password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                />

                <PasswordInput
                  label="Confirm Password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />

                <NeonButton type="submit" className="w-full justify-center mt-2" disabled={loading}>
                  {loading ? 'Saving…' : 'Save New Password'}
                </NeonButton>
              </form>

              <p className="text-center text-white/50 text-xs sm:text-sm mt-7">
                <Link to="/login" className="font-lexend font-bold text-primary-container hover:text-green-300">
                  ← Back to Login
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}