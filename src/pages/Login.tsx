import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { NeonButton } from '@/components/ui/NeonButton'
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
      navigate('/matches')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-lexend text-5xl font-black italic text-primary-container tracking-tighter neon-text uppercase">
            World Cup Live
          </h1>
          <p className="font-lexend text-xs uppercase tracking-[0.2em] text-primary-container/70 mt-2">The Heart of the Game</p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          <h2 className="font-lexend font-bold text-2xl text-center mb-2">Welcome Back, Fan</h2>
          <p className="text-center text-white/60 text-sm mb-8">Enter your details to access the stadium.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="font-lexend text-[10px] uppercase text-outline font-semibold block mb-2">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary-container outline-none py-2 text-white placeholder:text-white/20 transition-all"
                placeholder="fan@worldcuplive.com"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-lexend text-[10px] uppercase text-outline font-semibold">Password</label>
                <a href="#" className="font-lexend text-[10px] uppercase text-primary-container hover:underline">Forgot?</a>
              </div>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary-container outline-none py-2 text-white placeholder:text-white/20 transition-all"
                placeholder="••••••••"
              />
            </div>
            <NeonButton type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Fan ID'}
            </NeonButton>
          </form>

          <p className="text-center text-white/60 text-sm mt-8">
            New to the stadium?{' '}
            <Link to="/signup" className="font-lexend font-bold text-primary-container hover:text-green-300">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}