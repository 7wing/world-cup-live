import { cn } from '@/utils/cn'

interface AvatarProps {
  src?: string | null
  username?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  online?: boolean
}

export function Avatar({ src, username, size = 'md', className, online }: AvatarProps) {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
  const initials = username?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className={cn('relative shrink-0', className)}>
      <div className={cn('rounded-full overflow-hidden border border-white/10 bg-surface-container-high flex items-center justify-center', sizeMap[size])}>
        {src ? (
          <img src={src} alt={username} className="w-full h-full object-cover" />
        ) : (
          <span className="font-lexend font-bold text-primary-container">{initials}</span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary-container rounded-full border-2 border-black animate-pulse" />
      )}
    </div>
  )
}