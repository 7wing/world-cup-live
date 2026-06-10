import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'

export function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Always call resetPasswordForEmail — we never reveal whether an email is registered
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    // Show generic success message regardless of whether the email exists
    setSent(true)
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

          {sent ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary-container/20 flex items-center justify-center mb-2">
                <svg
                  className="w-7 h-7 text-primary-container"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h2 className="font-lexend font-bold text-xl sm:text-2xl">
                Check your inbox
              </h2>
              <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
                We sent a password reset link to{' '}
                <span className="text-white font-semibold">{email}</span>.
                The link expires in 1 hour.
              </p>
              <p className="text-white/30 text-[11px] leading-relaxed">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary-container underline underline-offset-2"
                >
                  try again
                </button>
                . If your link expired, request a new one — your current password stays active until you finish resetting.
              </p>
            </div>
          ) : (
            /* ── Request form ── */
            <>
              <div className="mb-7">
                <h2 className="font-lexend font-bold text-xl sm:text-2xl text-center mb-1">
                  Reset Password
                </h2>
                <p className="text-center text-white/50 text-xs sm:text-sm">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoFocus
                  />
                </div>

                <NeonButton
                  type="submit"
                  className="w-full justify-center mt-2"
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </NeonButton>
              </form>
            </>
          )}

          <p className="text-center text-white/50 text-xs sm:text-sm mt-7">
            <Link to="/login" className="font-lexend font-bold text-primary-container hover:text-green-300">
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}