// src/components/fanzone/FeedFilter.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Pill-style filter tabs: All | Trending | Following
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'

type FilterOption = 'All' | 'Trending' | 'Following'

interface FeedFilterProps {
  active: FilterOption
  onChange: (filter: FilterOption) => void
}

const OPTION_KEYS: Record<FilterOption, string> = {
  All: 'fanZone.all',
  Trending: 'fanZone.trending',
  Following: 'fanZone.following',
}

export function FeedFilter({ active, onChange }: FeedFilterProps) {
  const { t } = useTranslation()
  const options: FilterOption[] = ['All', 'Trending', 'Following']
  return (
    <div className="flex gap-0.5 bg-white/[0.03] rounded-[20px] p-[3px] border border-white/10">
      {options.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`
            px-3.5 py-[5px] rounded-2xl text-[10px] font-lexend font-black
            uppercase tracking-widest border-none transition-all cursor-pointer
            ${active === f
              ? 'bg-primary-container/10 text-primary-container'
              : 'bg-transparent text-white/30 hover:text-white/50'
            }
          `}
        >
          {t(OPTION_KEYS[f])}
        </button>
      ))}
    </div>
  )
}