import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { fetchUserById } from '@/api/profile'

export function useAuth() {
  const { user, session, loading, setUser, setSession, setLoading, signOut } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        try {
          const profile = await fetchUserById(session.user.id)
          setUser(profile)
        } catch {
          setUser(null)
        }
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        const profile = await fetchUserById(session.user.id)
        setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return { user, session, loading, signOut }
}