import { cn } from '@/utils/cn'

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function NeonButton({
  className, variant = 'primary', size = 'md', children, ...props
}: NeonButtonProps) {
  return (
    <button
      className={cn(
        'font-lexend font-semibold uppercase tracking-widest rounded-sm transition-all active:scale-95',
        variant === 'primary' && 'bg-primary-container text-on-primary hover:brightness-110 active-glow',
        variant === 'outline' && 'border border-primary-container text-primary-container hover:bg-primary-container/10',
        variant === 'ghost' && 'text-primary-container hover:bg-primary-container/10',
        size === 'sm' && 'px-4 py-2 text-xs',
        size === 'md' && 'px-6 py-3 text-sm',
        size === 'lg' && 'px-8 py-4 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}