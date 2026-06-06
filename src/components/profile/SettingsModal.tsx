import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import {
  type AlertKey,
  MATCH_ALERT_OPTIONS,
  loadMatchAlerts,
  saveMatchAlerts,
} from '@/lib/matchAlerts'

export function SettingsModal() {
  const navigate = useNavigate()
  const { open, setOpen } = useSettingsStore()
  const { user, signOut } = useAuthStore()
  const [alerts, setAlerts] = useState(loadMatchAlerts)

  useEffect(() => {
    if (open) setAlerts(loadMatchAlerts())
  }, [open])

  function toggle(key: AlertKey) {
    setAlerts((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      saveMatchAlerts(next)
      return next
    })
  }

  async function handleSignOut() {
    await signOut()
    setOpen(false)
    navigate('/login')
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={() => setOpen(false)}
    >
      <GlassCard
        className="w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 id="settings-title" className="font-lexend font-black text-lg uppercase text-white">
            Settings
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close settings"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {user && (
            <p className="text-xs font-lexend text-white/40">
              Signed in as <span className="text-white/70 font-semibold">{user.username}</span>
            </p>
          )}

          <section>
            <h3 className="font-lexend font-bold text-[10px] uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">notifications</span>
              Match alerts
            </h3>
            <p className="text-[10px] font-lexend text-white/20 mb-3 leading-relaxed">
              Global defaults — applied when you subscribe to a match from the match page.
            </p>
            <div className="rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
              {MATCH_ALERT_OPTIONS.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center gap-3 px-4 py-3 bg-white/[0.02]">
                  <span className="material-symbols-outlined text-base text-white/25">{icon}</span>
                  <span className="font-lexend font-semibold text-xs text-white/60 flex-1">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={alerts[key]}
                    onClick={() => toggle(key)}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                      alerts[key]
                        ? 'bg-primary-container/30 border border-primary-container/50'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                        alerts[key] ? 'left-4 bg-primary-container' : 'left-0.5 bg-white/20'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            {user && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate(`/profile/${user.id}`)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors font-lexend font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-lg">person</span>
                View profile
              </button>
            )}
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors font-lexend font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/login')
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-container/15 border border-primary-container/40 text-primary-container font-lexend font-bold text-xs uppercase tracking-wide hover:bg-primary-container/25 transition-colors"
              >
                Sign in
              </button>
            )}
          </section>
        </div>
      </GlassCard>
    </div>
  )
}