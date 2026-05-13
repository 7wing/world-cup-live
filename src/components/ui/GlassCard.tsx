import { cn } from '@/utils/cn'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function GlassCard({ className, glow, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-xl',
        glow && 'active-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}