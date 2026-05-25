// src/components/fanzone/TribesSidebar.tsx

import { NeonButton } from '@/components/ui/NeonButton'
import { TRIBES } from '../../lib/fanzoneData'

export function TribesSidebar() {
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
        {TRIBES.map((t) => (
          <div key={t.name} className="flex items-center gap-2.5">
            <span className="text-[10px] font-lexend font-black text-white/25 w-3.5">
              {t.rank}
            </span>
            <span className="text-lg">{t.flag}</span>
            <span className="text-xs font-lexend font-semibold text-white/60 flex-1 truncate">
              {t.name}
            </span>
            <span className="text-[13px] font-lexend font-black text-primary-container">
              {t.pts.toLocaleString()}
            </span>
          </div>
        ))}

        <div className="flex gap-2 pt-1.5">
          <NeonButton variant="outline" className="flex-1 justify-center text-[10px] py-1.5">
            View All →
          </NeonButton>
          <NeonButton className="flex-1 justify-center text-[10px] py-1.5">
            Join Tribe
          </NeonButton>
        </div>
      </div>
    </div>
  )
}