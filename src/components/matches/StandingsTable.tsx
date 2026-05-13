import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/utils/cn'

interface Standing {
  pos: number
  team: string
  played: number
  gd: number
  points: number
  qualified?: boolean
}

interface StandingsTableProps {
  standings: Standing[]
  title?: string
}

export function StandingsTable({ standings, title = 'Group Standings' }: StandingsTableProps) {
  return (
    <div>
      <h2 className="font-lexend font-bold uppercase tracking-tighter text-on-surface mb-3">{title}</h2>
      <GlassCard className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {['Pos', 'Team', 'PL', 'GD', 'PTS'].map((h) => (
                <th key={h} className="px-4 py-3 font-lexend text-[12px] text-white/40 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {standings.map((s) => (
              <tr key={s.team} className={cn(s.qualified && 'bg-primary-container/5')}>
                <td className={cn('px-4 py-3 font-lexend font-semibold', s.qualified ? 'text-primary-container' : 'text-white/40')}>{s.pos}</td>
                <td className="px-4 py-3 font-lexend font-semibold uppercase">{s.team}</td>
                <td className="px-4 py-3 text-center">{s.played}</td>
                <td className={cn('px-4 py-3 text-center', s.gd > 0 ? 'text-primary-container' : s.gd < 0 ? 'text-error' : '')}>{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                <td className="px-4 py-3 text-center font-lexend font-black text-2xl">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}