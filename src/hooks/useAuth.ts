import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { fetchUserById } from '@/api/profile'

export function useAuth() {
  const { setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setLoading(false)

      if (cancelled) return

      if (session?.user) {
        try {
          const profile = await fetchUserById(session.user.id)
          if (!cancelled) setUser(profile)
        } catch {
          if (!cancelled) setUser(null)
        }
      } else if (!cancelled) {
        setUser(null)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setSession(session)
      setLoading(false)
      if (!session?.user) {
        setUser(null)
        return
      }
      fetchUserById(session.user.id)
        .then((profile) => { if (!cancelled) setUser(profile) })
        .catch(() => { if (!cancelled) setUser(null) })
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const signOut = useAuthStore((s) => s.signOut)
  return { user, session, loading, signOut }
}