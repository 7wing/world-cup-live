import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAllUsers } from '@/api/profile'
import { useAuthStore } from '@/store/authStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { DiscoverPopup } from './DiscoverPopup'

export function DiscoverWidget(): JSX.Element {
  const { user } = useAuthStore()
  const [showPopup, setShowPopup] = useState(false)

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => fetchAllUsers(user?.id),
    enabled: true,
  })

  return (
    <>
      <GlassCard className="overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <span className="material-symbols-outlined text-base text-primary-container leading-none">
            person_search
          </span>
          <span className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
            Discover
          </span>
        </div>

        {/* Body */}
        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Fans Online stat */}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container text-xl leading-none">
              group
            </span>
            <div className="flex flex-col">
              <span className="font-lexend font-black text-lg text-white leading-none">
                {allUsers.length}
              </span>
              <span className="font-lexend text-[10px] text-white/40 uppercase leading-none">
                Fans Online
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <NeonButton
            size="sm"
            variant="outline"
            onClick={() => setShowPopup(true)}
            className="w-full justify-center"
          >
            Find Players
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </NeonButton>
        </div>
      </GlassCard>

      {showPopup && <DiscoverPopup onClose={() => setShowPopup(false)} />}
    </>
  )
}