import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ensureUserProfile } from '@/api/profile'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const { setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    const handleSession = async (session: Session | null) => {
      if (cancelled) return
      setSession(session)

      if (session?.user) {
        try {
          const profile = await ensureUserProfile(session.user)
          if (!cancelled) setUser(profile)
        } catch (err) {
          console.error('[useAuth] profile setup failed:', err)
          if (!cancelled) setUser(null)
        }
      } else {
        setUser(null)
      }

      if (!cancelled) setLoading(false)
    }

    // Restore existing session on mount (page refresh)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[useAuth] getSession error:', error.message)
      }
      handleSession(session)
    }).catch((err) => {
      console.error('[useAuth] getSession failed:', err)
      if (!cancelled) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [setLoading, setSession, setUser])

  const user    = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)
  const signOut = useAuthStore((s) => s.signOut)
  return { user, session, loading, signOut }
}