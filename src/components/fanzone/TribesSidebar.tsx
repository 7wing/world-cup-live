// src/components/fanzone/TribesSidebar.tsx
// Phase 6: no mock data. Fetches top 4 tribes from Supabase via fetchTribes.

import { useQuery }    from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { NeonButton }  from '@/components/ui/NeonButton'
import { fetchTribes } from '@/api/fanzone'
import type { Tribe }  from '@/types'

function TribeRow({ tribe, rank }: { tribe: Tribe; rank: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-lexend font-black text-white/25 w-3.5">
        {rank}
      </span>
      {/* badge_url if present, otherwise shield icon */}
      {tribe.badge_url ? (
        <img src={tribe.badge_url} alt={tribe.name} className="w-5 h-5 rounded-full object-cover" />
      ) : (
        <span className="text-lg">🛡️</span>
      )}
      <span className="text-xs font-lexend font-semibold text-white/60 flex-1 truncate">
        {tribe.name}
      </span>
      <span className="text-[13px] font-lexend font-black text-primary-container">
        {tribe.total_points.toLocaleString()}
      </span>
    </div>
  )
}

export function TribesSidebar() {
  const navigate = useNavigate()

  const { data: tribes, isLoading } = useQuery({
    queryKey: ['tribes'],
    queryFn:  fetchTribes,
    staleTime: 60_000,
  })

  const top4 = tribes?.slice(0, 4) ?? []

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span>🛡️</span>
          <span className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
            Tribes
          </span>
        </div>
        <span className="font-lexend font-black text-[10px] uppercase tracking-widest text-primary-container">
          Top 4
        </span>
      </div>

      {/* Rows */}
      <div className="p-4 space-y-2.5">
        {isLoading && (
          <>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-5 bg-white/5 rounded animate-pulse" />
            ))}
          </>
        )}

        {!isLoading && top4.map((tribe, i) => (
          <TribeRow key={tribe.id} tribe={tribe} rank={i + 1} />
        ))}

        {!isLoading && top4.length === 0 && (
          <p className="text-[10px] font-lexend text-white/20 text-center py-2">
            No tribes yet
          </p>
        )}

        <div className="flex gap-2 pt-1.5">
          <NeonButton
            variant="outline"
            className="flex-1 justify-center text-[10px] py-1.5"
            onClick={() => navigate('/fan-zone/tribes')}
          >
            View All →
          </NeonButton>
          <NeonButton
            className="flex-1 justify-center text-[10px] py-1.5"
            onClick={() => navigate('/fan-zone/tribes')}
          >
            Join Tribe
          </NeonButton>
        </div>
      </div>
    </div>
  )
}