import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { fetchUserById } from '@/api/profile'

export function useAuth() {
  const { setUser, setSession, setLoading, signOut } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Always unblock profile queries — must run even if StrictMode cancelled this effect,
      // because INITIAL_SESSION does not re-fire on remount.
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

  const { user, session, loading } = useAuthStore.getState()
  return { user, session, loading, signOut }
}
