import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { fetchUserById } from '@/api/profile'

export function useAuth() {
  const { setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return

      setSession(session)

      if (session?.user) {
        try {
          const profile = await fetchUserById(session.user.id)
          if (!cancelled) setUser(profile)
        } catch {
          if (!cancelled) setUser(null)
        }
      } else {
        setUser(null)
      }

      // Only mark loading done after user row is resolved
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const user    = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const signOut = useAuthStore((s) => s.signOut)
  return { user, session, loading, signOut }
}