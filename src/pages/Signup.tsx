import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useNotificationStore } from '@/store/notificationStore'
import { cn } from '@/utils/cn'

// ─── helpers ────────────────────────────────────────────────────────────────

const SUFFIXES = [
  'goat', 'ultra', 'mvp', 'fc', 'x', 'pro',
  'real', 'futbol', '10', '9', '7', '1',
  'hd', 'vip', 'og', 'ace', 'top', 'one',
]

/** Picks 4 distinct suffixes at random and builds username suggestions. */
function generateSuggestions(base: string): string[] {
  const clean = base.replace(/\s+/g, '_').toLowerCase()

  // Fisher-Yates shuffle on a copy so the pool is never mutated
  const pool = [...SUFFIXES]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, 4).map((suffix) => `${clean}_${suffix}`)
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken'

// ─── component ───────────────────────────────────────────────────────────────

export function SignupPage() {
  const navigate = useNavigate()
  const { push }  = useNotificationStore()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading,  setLoading]  = useState(false)

  const [usernameStatus,      setUsernameStatus]      = useState<UsernameStatus>('idle')
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])

  // ── check username against the DB ──────────────────────────────────────────
  const checkUsername = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) { setUsernameStatus('idle'); return }

    setUsernameStatus('checking')
    setUsernameSuggestions([])

    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', trimmed)
      .maybeSingle()

    if (error) {
      // If we can't reach the DB just let the server handle it
      setUsernameStatus('idle')
      return
    }

    if (data) {
      setUsernameStatus('taken')
      setUsernameSuggestions(generateSuggestions(trimmed))
    } else {
      setUsernameStatus('available')
    }
  }, [])

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (usernameStatus === 'taken') {
      push('That Fan ID is already taken. Pick another.', 'error')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })

    if (error) {
      push(error.message, 'error')
      setLoading(false)
      return
    }

    // If Supabase email confirmation is enabled the user lands here unconfirmed.
    // Send them to a holding page so they know to check their inbox rather than
    // dropping them into /matches in a half-authenticated state.
    push('Account created! Check your email to confirm.', 'success')
    navigate('/check-email', { replace: true, state: { email } })

    setLoading(false)
  }

  // ── username field status indicator ───────────────────────────────────────
  const statusMeta: Record<UsernameStatus, { text: string; cls: string } | null> = {
    idle:      null,
    checking:  { text: 'Checking availability…',    cls: 'text-white/40' },
    available: { text: '✓ Fan ID is available',     cls: 'text-green-400' },
    taken:     { text: '✗ Fan ID is already taken', cls: 'text-red-400'  },
  }
  const statusHint = statusMeta[usernameStatus]

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
            Join the Stadium
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* ── Fan ID (username) ── */}
            <div>
              <label className="font-lexend text-[10px] uppercase text-outline font-semibold block mb-2">
                Fan ID
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setUsernameStatus('idle')
                  setUsernameSuggestions([])
                }}
                onBlur={() => checkUsername(username)}
                className={cn(
                  'auth-input w-full',
                  usernameStatus === 'taken'     && '!border-red-400 focus:!border-red-400',
                  usernameStatus === 'available' && '!border-green-400 focus:!border-green-400'
                )}
                placeholder="CR7_GOAT_2026"
                autoComplete="off"
              />

              {/* inline status hint */}
              {statusHint && (
                <p className={`text-[11px] mt-1.5 ${statusHint.cls}`}>
                  {statusHint.text}
                </p>
              )}

              {/* suggestions when taken */}
              {usernameStatus === 'taken' && usernameSuggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] text-white/40 mb-1.5 font-lexend uppercase">
                    Try one of these:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setUsername(s)
                          setUsernameStatus('idle')
                          setUsernameSuggestions([])
                          checkUsername(s)
                        }}
                        className="
                          text-[11px] font-lexend font-semibold
                          px-2.5 py-1 rounded-full
                          border border-primary-container/40
                          text-primary-container
                          hover:bg-primary-container/10
                          transition-colors
                        "
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <NeonButton
              type="submit"
              className="w-full justify-center mt-2"
              disabled={loading || usernameStatus === 'taken' || usernameStatus === 'checking'}
            >
              {loading ? 'Creating account…' : 'Create Fan Account'}
            </NeonButton>
          </form>

          <p className="text-center text-white/50 text-xs sm:text-sm mt-5">
            Already a fan?{' '}
            <Link to="/login" className="font-lexend font-bold text-primary-container hover:text-green-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}