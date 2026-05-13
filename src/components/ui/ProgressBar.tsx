import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  label?: string
}

export function ProgressBar({ value, max = 100, className, showLabel, label }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs font-lexend font-semibold text-on-surface-variant uppercase">
          <span>{label}</span>
          <span className="text-primary-container">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-primary-container shadow-[0_0_10px_rgba(0,255,65,0.6)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}