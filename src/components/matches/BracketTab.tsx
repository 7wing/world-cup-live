import { useState } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'
import trophy22 from '@/assets/trophy/trophy22.png'
import trophy26 from '@/assets/trophy/trophy26.png'

// ── Types ─────────────────────────────────────────────────────────────────────
interface BracketTeam {
  code: string
  name: string
  score: number | null
  winner?: boolean
}

interface BracketMatch {
  home: BracketTeam
  away: BracketTeam
  venue?: string
  /** UTC ISO-8601 kickoff.  When provided the card derives the local date label
   *  automatically so every viewer sees the correct date for their timezone.
   *  For historical (2022) matches a plain `dateLabel` string is used instead. */
  kickoffUtc?: string
  /** Fallback static label (used for 2022 finished matches where timezone
   *  conversion no longer matters and the dates are well-known). */
  dateLabel?: string
}

interface YearData {
  title: string
  champion: string
  trophy: string
  leftQF: BracketMatch[]
  leftSF: BracketMatch
  rightQF: BracketMatch[]
  rightSF: BracketMatch
  final: BracketMatch
  roundOf16: BracketMatch[]
}

// ── Timezone helper ───────────────────────────────────────────────────────────
/** Short timezone abbreviation, e.g. "EST", "JST", "GMT+3" */
function tzAbbr(): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find(p => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}

/** Returns "Mon DD" in the viewer's local timezone, e.g. "Jun 14" or "Jul 2" */
function localDateLabel(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Picks the right display label: local date from UTC if available, else static label */
function matchDateDisplay(match: BracketMatch): string | undefined {
  if (match.kickoffUtc) return localDateLabel(match.kickoffUtc)
  return match.dateLabel
}

// ── Flag component ─────────────────────────────────────────────────────────────
function TeamFlag({ code }: { code: string }) {
  if (!code) {
    return (
      <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0" />
    )
  }

  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code]

  if (!FlagComponent) {
    return (
      <span className="inline-flex w-5 h-[14px] rounded-[2px] bg-white/10 flex-shrink-0 items-center justify-center">
        <span className="text-[7px] font-mono text-white/30">{code}</span>
      </span>
    )
  }

  return (
    <FlagComponent
      className="w-5 h-[14px] rounded-[2px] flex-shrink-0 shadow-sm"
      style={{ display: 'inline-block' }}
    />
  )
}

// ── Bracket Data ──────────────────────────────────────────────────────────────
// 2022 matches: dates kept as static `dateLabel` strings (historical, timezone
//   conversion no longer actionable).
// 2026 matches: `kickoffUtc` is provided wherever the schedule is confirmed so
//   the viewer's browser renders the correct local date automatically.
//   Final: Jul 19 2026, 18:00 ET = 22:00 UTC.
const BRACKET_DATA: Record<'2022' | '2026', YearData> = {
  '2022': {
    title: 'FIFA World Cup 2022 · Knockout Stage',
    champion: 'Argentina',
    trophy: trophy22,
    leftQF: [
      {
        home: { code: 'HR', name: 'Croatia',     score: 1, winner: true },
        away: { code: 'BR', name: 'Brazil',      score: 1 },
        venue: 'Education City Stadium',
        dateLabel: 'Dec 9',
      },
      {
        home: { code: 'NL', name: 'Netherlands', score: 2 },
        away: { code: 'AR', name: 'Argentina',   score: 2, winner: true },
        venue: 'Lusail Stadium',
        dateLabel: 'Dec 10',
      },
    ],
    leftSF: {
      home: { code: 'HR', name: 'Croatia',   score: 0 },
      away: { code: 'AR', name: 'Argentina', score: 3, winner: true },
      venue: 'Lusail Stadium',
      dateLabel: 'Dec 13',
    },
    rightQF: [
      {
        home: { code: 'MA', name: 'Morocco',  score: 1, winner: true },
        away: { code: 'PT', name: 'Portugal', score: 0 },
        venue: 'Al Thumama Stadium',
        dateLabel: 'Dec 10',
      },
      {
        home: { code: 'GB', name: 'England', score: 1 },
        away: { code: 'FR', name: 'France',  score: 2, winner: true },
        venue: 'Al Bayt Stadium',
        dateLabel: 'Dec 10',
      },
    ],
    rightSF: {
      home: { code: 'MA', name: 'Morocco', score: 0 },
      away: { code: 'FR', name: 'France',  score: 2, winner: true },
      venue: 'Al Bayt Stadium',
      dateLabel: 'Dec 14',
    },
    final: {
      home: { code: 'AR', name: 'Argentina', score: 3, winner: true },
      away: { code: 'FR', name: 'France',    score: 3 },
      venue: 'Lusail Stadium',
      // Dec 18 2022, 18:00 ET = 22:00 UTC — use UTC so local date is correct
      kickoffUtc: '2022-12-18T22:00:00.000Z',
    },
    roundOf16: [
      { home: { code: 'NL', name: 'Netherlands', score: 3, winner: true }, away: { code: 'US', name: 'USA',         score: 1 }, venue: 'Khalifa Stadium',      dateLabel: 'Dec 3' },
      { home: { code: 'AR', name: 'Argentina',   score: 2, winner: true }, away: { code: 'AU', name: 'Australia',   score: 1 }, venue: 'Ahmad bin Ali',        dateLabel: 'Dec 3' },
      { home: { code: 'JP', name: 'Japan',       score: 1 },               away: { code: 'HR', name: 'Croatia',     score: 1, winner: true }, venue: 'Al Janoub', dateLabel: 'Dec 5' },
      { home: { code: 'BR', name: 'Brazil',      score: 4, winner: true }, away: { code: 'KR', name: 'South Korea', score: 1 }, venue: 'Stadium 974',          dateLabel: 'Dec 5' },
      { home: { code: 'GB', name: 'England',     score: 3, winner: true }, away: { code: 'SN', name: 'Senegal',     score: 0 }, venue: 'Al Bayt Stadium',      dateLabel: 'Dec 4' },
      { home: { code: 'FR', name: 'France',      score: 3, winner: true }, away: { code: 'PL', name: 'Poland',      score: 1 }, venue: 'Al Thumama Stadium',   dateLabel: 'Dec 4' },
      { home: { code: 'MA', name: 'Morocco',     score: 0, winner: true }, away: { code: 'ES', name: 'Spain',       score: 0 }, venue: 'Education City',       dateLabel: 'Dec 6' },
      { home: { code: 'PT', name: 'Portugal',    score: 6, winner: true }, away: { code: 'CH', name: 'Switzerland', score: 1 }, venue: 'Lusail Stadium',       dateLabel: 'Dec 6' },
    ],
  },

  '2026': {
    title: 'FIFA World Cup 2026 · Knockout Stage',
    champion: 'TBD',
    trophy: trophy26,
    leftQF: [
      { home: { code: '', name: 'TBC', score: null }, away: { code: '', name: 'TBC', score: null }, venue: 'Azteca' },
      { home: { code: '', name: 'TBC', score: null }, away: { code: '', name: 'TBC', score: null }, venue: 'MetLife' },
    ],
    leftSF: {
      home: { code: '', name: 'TBC', score: null },
      away: { code: '', name: 'TBC', score: null },
      venue: 'Mercedes-Benz',
    },
    rightQF: [
      { home: { code: '', name: 'TBC', score: null }, away: { code: '', name: 'TBC', score: null }, venue: 'Arrowhead' },
      { home: { code: '', name: 'TBC', score: null }, away: { code: '', name: 'TBC', score: null }, venue: 'SoFi' },
    ],
    rightSF: {
      home: { code: '', name: 'TBC', score: null },
      away: { code: '', name: 'TBC', score: null },
      venue: 'AT&T',
    },
    final: {
      home: { code: '', name: 'TBD', score: null },
      away: { code: '', name: 'TBD', score: null },
      venue: 'MetLife Stadium',
      // Jul 19 2026, 18:00 ET = 22:00 UTC
      // Viewer's browser will render this as their local date — e.g. Jul 20 for
      // anyone in Europe / Asia / Australia / Pacific.
      kickoffUtc: '2026-07-19T22:00:00.000Z',
    },
    roundOf16: Array.from({ length: 8 }, () => ({
      home: { code: '', name: 'TBC', score: null },
      away: { code: '', name: 'TBC', score: null },
    })),
  },
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({
  match,
  isFinal = false,
  reversed = false,
}: {
  match: BracketMatch
  isFinal?: boolean
  reversed?: boolean
}) {
  const teams = reversed ? [match.away, match.home] : [match.home, match.away]
  const dateDisplay = matchDateDisplay(match)

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all ${
        isFinal
          ? 'border-amber-400/40 bg-amber-400/5'
          : 'border-white/10 bg-white/3 hover:border-white/20'
      }`}
    >
      {teams.map((team, i) => (
        <div
          key={i}
          className={`
            flex items-center gap-2 px-3 py-2
            ${i === 0 ? 'border-b border-white/8' : ''}
            ${team.winner ? 'bg-primary-container/10' : ''}
          `}
        >
          <TeamFlag code={team.code} />
          <span
            className={`
              font-lexend font-semibold text-[11px] flex-1 truncate
              ${team.winner
                ? 'text-white'
                : team.name === 'TBD' || team.name === 'TBC'
                  ? 'text-white/20 italic font-normal'
                  : match.home.score !== null
                    ? 'text-white/35'
                    : 'text-white/70'}
            `}
          >
            {team.name}
          </span>
          {(match.home.score !== null || match.away.score !== null) && (
            <span
              className={`font-lexend font-black text-sm flex-shrink-0 ${
                team.winner ? 'text-primary-container' : 'text-white/20'
              }`}
            >
              {team.score ?? '–'}
            </span>
          )}
        </div>
      ))}

      {/* Footer: venue · local date (derived from UTC kickoff when available) */}
      <div className="px-3 py-1 bg-white/2 border-t border-white/5">
        <p className="text-[9px] font-lexend text-white/20 truncate">
          {[match.venue, dateDisplay].filter(Boolean).join(' · ') || '\u00A0'}
        </p>
      </div>
    </div>
  )
}

// ── Round column ──────────────────────────────────────────────────────────────
function RoundCol({
  label,
  matches,
  reversed = false,
}: {
  label: string
  matches: BracketMatch[]
  reversed?: boolean
}) {
  return (
    <div className="flex flex-col flex-1 min-w-[120px]">
      <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">
        {label}
      </p>
      <div className="flex flex-col flex-1 justify-around gap-3">
        {matches.map((m, i) => (
          <MatchCard key={i} match={m} reversed={reversed} />
        ))}
      </div>
    </div>
  )
}

// ── Main BracketTab ───────────────────────────────────────────────────────────
export function BracketTab() {
  const [selectedYear, setSelectedYear] = useState<'2022' | '2026'>('2026')
  const currentData = BRACKET_DATA[selectedYear]

  return (
    <div>
      {/* Year Toggle & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
            {currentData.title}
          </p>
          {tzAbbr() && (
            <p className="text-[9px] font-lexend text-white/15 mt-0.5">
              Times shown in your local timezone · {tzAbbr()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="hidden md:flex items-center gap-3 text-[9px] font-lexend font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container/60" />
              <span className="text-white/25">Winner</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400/60" />
              <span className="text-white/25">Final</span>
            </span>
          </div>

          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10">
            {(['2026', '2022'] as const).map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1 text-[10px] font-lexend font-bold uppercase tracking-wider rounded-md transition-all ${
                  selectedYear === year
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bracket */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
        <div className="flex gap-2 min-w-[640px] items-stretch">

          <RoundCol label="Quarterfinal" matches={currentData.leftQF} />

          <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
            {currentData.leftQF.map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
            ))}
          </div>

          <div className="flex flex-col flex-1 min-w-[120px] justify-center">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">
              Semifinal
            </p>
            <MatchCard match={currentData.leftSF} />
          </div>

          <div className="flex items-center w-3 flex-shrink-0">
            <div className="w-full border-t border-white/8" />
          </div>

          {/* ── CENTER ── */}
          <div className="flex flex-col items-center justify-center min-w-[130px] flex-shrink-0 gap-3">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/60 text-center">
              Final
            </p>

            <div className="flex flex-col items-center gap-1 py-3 px-4 bg-amber-400/8 border border-amber-400/25 rounded-xl w-full">
              <img
                src={currentData.trophy}
                alt="FIFA World Cup Trophy"
                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              />
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/70">
                {selectedYear} Champion
              </p>
              <p
                className={`font-lexend font-black text-xs mt-0.5 ${
                  currentData.champion === 'TBD'
                    ? 'text-white/25 italic'
                    : 'text-amber-400'
                }`}
              >
                {currentData.champion}
              </p>
            </div>

            <MatchCard match={currentData.final} isFinal />
          </div>

          <div className="flex items-center w-3 flex-shrink-0">
            <div className="w-full border-t border-white/8" />
          </div>

          <div className="flex flex-col flex-1 min-w-[120px] justify-center">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">
              Semifinal
            </p>
            <MatchCard match={currentData.rightSF} reversed />
          </div>

          <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
            {currentData.rightQF.map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
            ))}
          </div>

          <RoundCol label="Quarterfinal" matches={currentData.rightQF} reversed />
        </div>
      </div>

      <p className="flex items-center gap-1.5 mt-3 text-[10px] font-lexend text-white/15 sm:hidden">
        <span className="material-symbols-outlined text-sm">swipe</span>
        Swipe to see full bracket
      </p>

      {/* R16 */}
      <div className="mt-8">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 mb-4">
          Round of 16
        </p>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-[480px]">
            {currentData.roundOf16.map((m, i) => (
              <MatchCard key={i} match={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}