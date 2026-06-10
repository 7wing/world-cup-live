import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useNotificationStore } from '@/store/notificationStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { push } = useNotificationStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      push(error.message, 'error')
    } else {
      // Profile creation and session state are handled by the useAuth listener
      navigate('/matches')
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
          <h2 className="font-lexend font-bold text-xl sm:text-2xl text-center mb-1">
            Welcome Back
          </h2>
          <p className="text-center text-white/50 text-xs sm:text-sm mb-7">
            Enter your details to access the stadium.
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
                  Password
                </label>
                {/* Now links to the real forgot-password page */}
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
              {loading ? 'Logging in...' : 'Login'}
            </NeonButton>
          </form>

          <p className="text-center text-white/50 text-xs sm:text-sm mt-7">
            New to the stadium?{' '}
            <Link to="/signup" className="font-lexend font-bold text-primary-container hover:text-green-300">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}