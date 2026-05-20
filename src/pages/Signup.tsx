import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'
import { useNotificationStore } from '@/store/notificationStore'

export function SignupPage() {
  const navigate = useNavigate()
  const { push } = useNotificationStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) {
      push(error.message, 'error')
    } else {
      push('Account created! Check your email.', 'success')
      navigate('/matches')
    }
    setLoading(false)
  }

  const fields = [
    { label: 'Fan ID / Username', value: username, set: setUsername, type: 'text',     placeholder: 'CR7_GOAT_2026'     },
    { label: 'Email',             value: email,    set: setEmail,    type: 'email',    placeholder: 'fan@example.com'   },
    { label: 'Password',          value: password, set: setPassword, type: 'password', placeholder: '••••••••'          },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-lexend text-4xl sm:text-5xl font-black italic text-primary-container tracking-tighter neon-text uppercase">
            World Cup Live
          </h1>
          <p className="font-lexend text-[10px] uppercase tracking-[0.2em] text-primary-container/70 mt-2">
            The Heart of the Game
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl">
          <h2 className="font-lexend font-bold text-xl sm:text-2xl text-center mb-7">
            Join the Stadium
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
            {fields.map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="font-lexend text-[10px] uppercase text-outline font-semibold block mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  required
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary-container outline-none py-2 text-white placeholder:text-white/20 transition-all text-sm"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <NeonButton type="submit" className="w-full justify-center mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Fan Account'}
            </NeonButton>
          </form>

          <p className="text-center text-white/50 text-xs sm:text-sm mt-7">
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