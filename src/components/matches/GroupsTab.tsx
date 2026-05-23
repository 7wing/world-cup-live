import { useState } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'
import { GlassCard } from '@/components/ui/GlassCard'

// ── Types ─────────────────────────────────────────────────────────────────────
interface GroupRow {
  code: string
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
  qualified?: boolean
}

type GroupMap = Record<string, GroupRow[]>
type Year = '2022' | '2026'

// ── Helpers ───────────────────────────────────────────────────────────────────
const r = (code: string, team: string): GroupRow => ({
  code, team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0,
})

// ── Flag component ─────────────────────────────────────────────────────────────
function TeamFlag({ code }: { code: string }) {
  if (!code) return <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0" />
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code]
  if (!FlagComponent) {
    return (
      <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0 items-center justify-center">
        <span className="text-[7px] font-mono text-white/30">{code}</span>
      </span>
    )
  }
  return <FlagComponent className="w-5 h-[14px] rounded-[2px] flex-shrink-0 shadow-sm" style={{ display: 'inline-block' }} />
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const GROUPS_2022: GroupMap = {
  A: [
    { code: 'NL', team: 'Netherlands',  played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 1, gd:  4, pts: 7, qualified: true },
    { code: 'SN', team: 'Senegal',      played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 4, gd:  1, pts: 6, qualified: true },
    { code: 'EC', team: 'Ecuador',      played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 3, gd:  1, pts: 4 },
    { code: 'QA', team: 'Qatar',        played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 7, gd: -6, pts: 0 },
  ],
  B: [
    { code: 'GB', team: 'England',      played: 3, won: 2, drawn: 1, lost: 0, gf: 9, ga: 2, gd:  7, pts: 7, qualified: true },
    { code: 'US', team: 'USA',          played: 3, won: 1, drawn: 2, lost: 0, gf: 2, ga: 1, gd:  1, pts: 5, qualified: true },
    { code: 'IR', team: 'Iran',         played: 3, won: 1, drawn: 0, lost: 2, gf: 4, ga: 7, gd: -3, pts: 3 },
    { code: 'GB', team: 'Wales',        played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 6, gd: -5, pts: 1 },
  ],
  C: [
    { code: 'AR', team: 'Argentina',    played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 2, gd:  3, pts: 6, qualified: true },
    { code: 'PL', team: 'Poland',       played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 2, gd:  0, pts: 4, qualified: true },
    { code: 'MX', team: 'Mexico',       played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 3, gd: -1, pts: 4 },
    { code: 'SA', team: 'Saudi Arabia', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, gd: -2, pts: 3 },
  ],
  D: [
    { code: 'FR', team: 'France',       played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 3, gd:  3, pts: 6, qualified: true },
    { code: 'AU', team: 'Australia',    played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, gd: -1, pts: 4, qualified: true },
    { code: 'TN', team: 'Tunisia',      played: 3, won: 1, drawn: 1, lost: 1, gf: 1, ga: 1, gd:  0, pts: 4 },
    { code: 'DK', team: 'Denmark',      played: 3, won: 0, drawn: 2, lost: 1, gf: 1, ga: 3, gd: -2, pts: 2 },
  ],
  E: [
    { code: 'JP', team: 'Japan',        played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, gd:  1, pts: 6, qualified: true },
    { code: 'ES', team: 'Spain',        played: 3, won: 1, drawn: 1, lost: 1, gf: 9, ga: 3, gd:  6, pts: 4, qualified: true },
    { code: 'DE', team: 'Germany',      played: 3, won: 1, drawn: 1, lost: 1, gf: 6, ga: 5, gd:  1, pts: 4 },
    { code: 'CR', team: 'Costa Rica',   played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga:11, gd: -8, pts: 3 },
  ],
  F: [
    { code: 'MA', team: 'Morocco',      played: 3, won: 2, drawn: 1, lost: 0, gf: 4, ga: 1, gd:  3, pts: 7, qualified: true },
    { code: 'HR', team: 'Croatia',      played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 1, gd:  3, pts: 5, qualified: true },
    { code: 'BE', team: 'Belgium',      played: 3, won: 1, drawn: 1, lost: 1, gf: 1, ga: 2, gd: -1, pts: 4 },
    { code: 'CA', team: 'Canada',       played: 3, won: 0, drawn: 0, lost: 3, gf: 2, ga: 7, gd: -5, pts: 0 },
  ],
  G: [
    { code: 'BR', team: 'Brazil',       played: 3, won: 2, drawn: 0, lost: 1, gf: 3, ga: 3, gd:  0, pts: 6, qualified: true },
    { code: 'CH', team: 'Switzerland',  played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, gd:  1, pts: 6, qualified: true },
    { code: 'PT', team: 'Portugal',     played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 4, gd:  2, pts: 6 },
    { code: 'CM', team: 'Cameroon',     played: 3, won: 1, drawn: 0, lost: 2, gf: 4, ga: 7, gd: -3, pts: 3 },
  ],
  H: [
    { code: 'PT', team: 'Portugal',     played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 4, gd:  2, pts: 7, qualified: true },
    { code: 'KR', team: 'South Korea',  played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, gd:  0, pts: 4, qualified: true },
    { code: 'UY', team: 'Uruguay',      played: 3, won: 1, drawn: 1, lost: 1, gf: 2, ga: 3, gd: -1, pts: 4 },
    { code: 'GH', team: 'Ghana',        played: 3, won: 1, drawn: 0, lost: 2, gf: 5, ga: 6, gd: -1, pts: 3 },
  ],
}

// All 48 confirmed teams for 2026 (official FIFA draw, December 2025)
const GROUPS_2026: GroupMap = {
  A: [ r('MX','Mexico'),        r('ZA','South Africa'), r('KR','South Korea'),       r('CZ','Czechia')             ],
  B: [ r('CA','Canada'),        r('CH','Switzerland'),  r('QA','Qatar'),             r('BA','Bosnia & Herz.')      ],
  C: [ r('BR','Brazil'),        r('MA','Morocco'),      r('GB','Scotland'),          r('HT','Haiti')               ],
  D: [ r('US','United States'), r('PY','Paraguay'),     r('AU','Australia'),         r('TR','Turkey')              ],
  E: [ r('DE','Germany'),       r('EC','Ecuador'),      r('CI','Côte d\'Ivoire'),    r('CW','Curaçao')             ],
  F: [ r('NL','Netherlands'),   r('JP','Japan'),        r('TN','Tunisia'),           r('SE','Sweden')              ],
  G: [ r('BE','Belgium'),       r('EG','Egypt'),        r('IR','Iran'),              r('NZ','New Zealand')         ],
  H: [ r('ES','Spain'),         r('CV','Cape Verde'),   r('SA','Saudi Arabia'),      r('UY','Uruguay')             ],
  I: [ r('FR','France'),        r('SN','Senegal'),      r('NO','Norway'),            r('IQ','Iraq')                ],
  J: [ r('AR','Argentina'),     r('DZ','Algeria'),      r('AT','Austria'),           r('JO','Jordan')              ],
  K: [ r('PT','Portugal'),      r('CO','Colombia'),     r('UZ','Uzbekistan'),        r('CD','Congo DR')            ],
  L: [ r('GB','England'),       r('HR','Croatia'),      r('GH','Ghana'),             r('PA','Panama')              ],
}

// ── Group Card ────────────────────────────────────────────────────────────────
function GroupCard({ name, teams }: { name: string; teams: GroupRow[] }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8 bg-white/3">
        <span className="font-lexend font-black text-xs uppercase tracking-widest text-primary-container">
          Group {name}
        </span>
        <div className="flex gap-3 text-[10px] font-lexend font-bold uppercase tracking-widest text-white/20">
          <span className="w-4 text-center">PL</span>
          <span className="w-6 text-center">GD</span>
          <span className="w-4 text-center">PTS</span>
        </div>
      </div>

      {teams.map((team, i) => (
        <div
          key={`${team.team}-${i}`}
          className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 last:border-0 ${
            team.qualified ? 'bg-primary-container/5' : ''
          }`}
        >
          <div className={`w-0.5 h-4 rounded-full flex-shrink-0 ${team.qualified ? 'bg-primary-container' : 'bg-white/8'}`} />
          <span className="text-[10px] font-lexend font-bold text-white/25 w-3 flex-shrink-0">{i + 1}</span>
          <TeamFlag code={team.code} />
          <span className={`font-lexend font-semibold text-xs flex-1 truncate ${team.qualified ? 'text-white' : 'text-white/50'}`}>
            {team.team}
          </span>
          <div className="flex gap-3 text-xs font-lexend flex-shrink-0">
            <span className="text-white/25 w-4 text-center">{team.played}</span>
            <span className={`w-6 text-center font-semibold ${team.gd > 0 ? 'text-primary-container' : team.gd < 0 ? 'text-red-400' : 'text-white/25'}`}>
              {team.gd > 0 ? `+${team.gd}` : team.gd}
            </span>
            <span className="font-black text-sm text-white w-4 text-center">{team.pts}</span>
          </div>
        </div>
      ))}
    </GlassCard>
  )
}

// ── Main GroupsTab ─────────────────────────────────────────────────────────────
export function GroupsTab() {
  const [year, setYear] = useState<Year>('2026')
  const groups = year === '2022' ? GROUPS_2022 : GROUPS_2026

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
          FIFA World Cup {year} · Group Stage
        </p>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 bg-primary-container rounded-full" />
              <span className="text-[9px] font-lexend font-bold uppercase tracking-widest text-white/25">Qualified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-0.5 h-4 bg-white/10 rounded-full" />
              <span className="text-[9px] font-lexend font-bold uppercase tracking-widest text-white/25">Eliminated</span>
            </div>
          </div>

          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10">
            {(['2026', '2022'] as Year[]).map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-3 py-1 text-[10px] font-lexend font-bold uppercase tracking-wider rounded-md transition-all ${
                  year === y ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Groups grid — 4 columns max on both years */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(groups).map(([name, teams]) => (
          <GroupCard key={name} name={name} teams={teams} />
        ))}
      </div>

      {year === '2026' && (
        <p className="mt-5 text-[10px] font-lexend text-white/15 text-center uppercase tracking-widest">
          Official draw confirmed · Dec 2025 · 48 teams across 12 groups
        </p>
      )}
    </div>
  )
}