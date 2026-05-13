import { cn } from '@/utils/cn'

interface StatBadgeProps {
  value: string | number
  label: string
  highlighted?: boolean
  className?: string
}

export function StatBadge({ value, label, highlighted, className }: StatBadgeProps) {
  return (
    <div className={cn('glass-card p-4 rounded-xl text-center', highlighted && 'border-b-2 border-primary-container', className)}>
      <p className="font-lexend text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
      <p className={cn('font-lexend text-4xl font-black tracking-tighter', highlighted ? 'text-primary-container' : 'text-on-surface')}>{value}</p>
    </div>
  )
}