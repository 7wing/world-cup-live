import { GlassCard } from '@/components/ui/GlassCard'

interface VibeMeterProps {
  value: number
}

export function VibeMeter({ value }: VibeMeterProps) {
  return (
    <GlassCard className="p-4 border-primary-container/20">
      <div className="flex justify-between items-end mb-2">
        <span className="font-lexend text-[10px] text-primary-container uppercase tracking-tighter font-semibold">Stadium Vibe Meter</span>
        <span className="font-lexend text-xl font-black text-primary-container">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-primary-container relative"
          style={{ width: `${value}%` }}
        >
          <div className="absolute right-0 top-0 w-2 h-full bg-white blur-[2px] animate-pulse" />
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[9px] font-semibold text-white/40 uppercase tracking-widest">
        <span>Atmospheric</span>
        <span>Electric</span>
      </div>
    </GlassCard>
  )
}