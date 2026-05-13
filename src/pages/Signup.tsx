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
      email, password,
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

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-lexend text-5xl font-black italic text-primary-container tracking-tighter neon-text uppercase">World Cup Live</h1>
        </div>
        <div className="glass-card p-8 rounded-xl">
          <h2 className="font-lexend font-bold text-2xl text-center mb-8">Join the Stadium</h2>
          <form onSubmit={handleSignup} className="space-y-6">
            {[
              { label: 'Fan ID / Username', value: username, set: setUsername, type: 'text', placeholder: 'CR7_GOAT_2026' },
              { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'fan@example.com' },
              { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: '••••••••' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="font-lexend text-[10px] uppercase text-outline font-semibold block mb-2">{label}</label>
                <input
                  type={type} required value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary-container outline-none py-2 text-white placeholder:text-white/20 transition-all"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <NeonButton type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Fan Account'}
            </NeonButton>
          </form>
          <p className="text-center text-white/60 text-sm mt-8">
            Already a fan?{' '}
            <Link to="/login" className="font-lexend font-bold text-primary-container hover:text-green-300">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}