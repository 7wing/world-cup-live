import * as Flags from 'country-flag-icons/react/3x2'
import { fifaToIso } from '@/utils/fifaToIso'

interface TeamFlagProps {
  code?: string | null
  flagUrl?: string | null
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASS = {
  sm: 'w-6 h-[16px]',
  md: 'w-8 h-8',
} as const

export function TeamFlag({ code, flagUrl, size = 'sm', className = '' }: TeamFlagProps) {
  const dim = SIZE_CLASS[size]

  if (flagUrl?.startsWith('http')) {
    return (
      <img
        src={flagUrl}
        alt=""
        className={`${dim} rounded-[2px] object-cover flex-shrink-0 shadow-sm ${className}`}
      />
    )
  }

  if (flagUrl && !flagUrl.startsWith('http')) {
    return <span className={`text-lg leading-none flex-shrink-0 ${className}`}>{flagUrl}</span>
  }

  const iso = fifaToIso(code)
  if (iso) {
    const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[iso]
    if (FlagComponent) {
      return (
        <FlagComponent
          className={`${dim} rounded-[2px] flex-shrink-0 shadow-sm ${className}`}
          style={{ display: 'inline-block' }}
        />
      )
    }
  }

  return (
    <span
      className={`inline-flex ${dim} rounded-[2px] bg-white/10 flex-shrink-0 items-center justify-center ${className}`}
    >
      {code && (
        <span className="text-[7px] font-mono text-white/30">{code}</span>
      )}
    </span>
  )
}
