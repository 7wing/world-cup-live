import type { TournamentYear } from '@/utils/tournament'

interface YearToggleProps {
  year: TournamentYear
  onChange: (year: TournamentYear) => void
}

export function YearToggle({ year, onChange }: YearToggleProps) {
  return (
    <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 self-end sm:self-auto shrink-0">
      {([2026, 2022] as TournamentYear[]).map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => onChange(y)}
          className={`px-2.5 py-0.5 text-[9px] font-lexend font-bold uppercase tracking-wider rounded-md transition-all ${
            year === y
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  )
}
