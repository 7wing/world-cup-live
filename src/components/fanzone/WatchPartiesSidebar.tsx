// src/components/fanzone/WatchPartiesSidebar.tsx

import { LiveDot } from '@/shared/ui'
import { NeonButton } from '@/components/ui/NeonButton'
import type { WatchParty } from '../../lib/fanzoneData'

interface WatchPartiesSidebarProps {
  parties: WatchParty[]
  onEnter: (party: WatchParty) => void
}

export function WatchPartiesSidebar({ parties, onEnter }: WatchPartiesSidebarProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
            Watch Parties
          </span>
        </div>
        <span className="font-lexend font-black text-[10px] uppercase tracking-widest text-primary-container">
          {parties.length} Live
        </span>
      </div>

      {/* Party rows */}
      {parties.map((p, i) => (
        <button
          key={p.id}
          onClick={() => onEnter(p)}
          className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-white/[0.03] bg-transparent border-none cursor-pointer ${
            i < parties.length - 1 ? 'border-b border-white/5' : ''
          }`}
        >
          {/* Flag avatar */}
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-lg flex-shrink-0">
            {p.flag}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs font-lexend font-bold text-white/80 truncate">{p.name}</p>
              {p.unread > 0 && (
                <span className="text-[8px] font-lexend font-black bg-primary-container text-on-primary rounded-[10px] px-1.5 py-px flex-shrink-0">
                  {p.unread}
                </span>
              )}
            </div>
            <p className="text-[11px] font-lexend text-white/40 truncate">{p.lastMsg}</p>
            <p className="text-[10px] font-lexend text-white/20 mt-0.5">
              {p.viewers.toLocaleString()} watching · {p.lastTime} ago
            </p>
          </div>

          <span className="text-base text-white/20">›</span>
        </button>
      ))}

      <div className="px-4 py-2.5">
        <NeonButton variant="outline" className="w-full justify-center">
          Create a Party
        </NeonButton>
      </div>
    </div>
  )
}