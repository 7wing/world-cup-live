// import { GlassCard } from '@/components/ui/GlassCard'

// ── Types ─────────────────────────────────────────────────────────────────────
interface BracketTeam {
  flag:    string
  name:    string
  score:   number | null
  winner?: boolean
}

interface BracketMatch {
  home:   BracketTeam
  away:   BracketTeam
  venue?: string
}

// ── Static bracket data — replace with real API hook when available ────────────
const LEFT_QF: BracketMatch[] = [
  {
    home: { flag: '🇧🇷', name: 'Brazil',    score: 2, winner: true },
    away: { flag: '🇪🇸', name: 'Spain',     score: 0 },
    venue: 'Azteca',
  },
  {
    home: { flag: '🇦🇷', name: 'Argentina', score: 3, winner: true },
    away: { flag: '🇫🇷', name: 'France',    score: 2 },
    venue: 'MetLife',
  },
]

const LEFT_SF: BracketMatch = {
  home: { flag: '🇧🇷', name: 'Brazil',    score: 2, winner: true },
  away: { flag: '🇦🇷', name: 'Argentina', score: 0 },
  venue: 'Mercedes-Benz',
}

const RIGHT_QF: BracketMatch[] = [
  {
    home: { flag: '🇳🇱', name: 'Netherlands', score: 3, winner: true },
    away: { flag: '🇺🇾', name: 'Uruguay',     score: 0 },
    venue: 'Arrowhead',
  },
  {
    home: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',     score: 2, winner: true },
    away: { flag: '🇲🇦', name: 'Morocco',     score: 1 },
    venue: 'SoFi',
  },
]

const RIGHT_SF: BracketMatch = {
  home: { flag: '🇳🇱', name: 'Netherlands', score: null },
  away: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',     score: null },
  venue: 'AT&T',
}

const FINAL: BracketMatch = {
  home: { flag: '🇧🇷', name: 'Brazil', score: null },
  away: { flag: '—',   name: 'TBD',   score: null },
  venue: 'MetLife Stadium · Jul 19',
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
  const teams = reversed
    ? [match.away, match.home]
    : [match.home, match.away]

  return (
    <div className={`rounded-xl overflow-hidden border transition-all ${
      isFinal
        ? 'border-amber-400/40 bg-amber-400/5'
        : 'border-white/10 bg-white/3 hover:border-white/20'
    }`}>
      {teams.map((team, i) => (
        <div
          key={i}
          className={`
            flex items-center gap-2 px-3 py-2
            ${i === 0 ? 'border-b border-white/8' : ''}
            ${team.winner ? 'bg-primary-container/10' : ''}
          `}
        >
          <span className="text-sm leading-none flex-shrink-0">{team.flag}</span>
          <span className={`
            font-lexend font-semibold text-[11px] flex-1 truncate
            ${team.winner    ? 'text-white'
              : team.name === 'TBD' ? 'text-white/20 italic font-normal'
              : match.home.score !== null ? 'text-white/35'
              : 'text-white/70'}
          `}>
            {team.name}
          </span>
          {(match.home.score !== null || match.away.score !== null) && (
            <span className={`font-lexend font-black text-sm flex-shrink-0 ${
              team.winner ? 'text-primary-container' : 'text-white/20'
            }`}>
              {team.score ?? '–'}
            </span>
          )}
        </div>
      ))}
      {match.venue && (
        <div className="px-3 py-1 bg-white/2 border-t border-white/5">
          <p className="text-[9px] font-lexend text-white/20 truncate">{match.venue}</p>
        </div>
      )}
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

// ── Main bracket tab ──────────────────────────────────────────────────────────
export function BracketTab() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
          FIFA World Cup 2026 · Knockout Stage
        </p>
        <div className="flex items-center gap-3 text-[9px] font-lexend font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-container/60" />
            <span className="text-white/25">Winner</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400/60" />
            <span className="text-white/25">Final</span>
          </span>
        </div>
      </div>

      {/* Bracket — horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
        <div className="flex gap-2 min-w-[640px] items-stretch">

          {/* ── LEFT SIDE: QF → SF ── */}
          <RoundCol label="Quarterfinal" matches={LEFT_QF} />

          {/* Connector lines left */}
          <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
            {LEFT_QF.map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
            ))}
          </div>

          <div className="flex flex-col flex-1 min-w-[120px] justify-center">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">
              Semifinal
            </p>
            <MatchCard match={LEFT_SF} />
          </div>

          {/* Connector line to center */}
          <div className="flex items-center w-3 flex-shrink-0">
            <div className="w-full border-t border-white/8" />
          </div>

          {/* ── CENTER: Trophy + Final ── */}
          <div className="flex flex-col items-center justify-center min-w-[130px] flex-shrink-0 gap-3">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/60 text-center">
              Final
            </p>

            {/* Trophy */}
            <div className="flex flex-col items-center gap-1 py-3 px-4 bg-amber-400/8 border border-amber-400/25 rounded-xl w-full">
              <span className="material-symbols-outlined text-3xl text-amber-400">
                emoji_events
              </span>
              <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-amber-400/70">
                2026 Champion
              </p>
              <p className="font-lexend font-black text-xs text-white/25 italic mt-0.5">
                TBD
              </p>
            </div>

            {/* Final match */}
            <MatchCard match={FINAL} isFinal />
          </div>

          {/* Connector line from center */}
          <div className="flex items-center w-3 flex-shrink-0">
            <div className="w-full border-t border-white/8" />
          </div>

          {/* ── RIGHT SIDE: SF → QF (reversed) ── */}
          <div className="flex flex-col flex-1 min-w-[120px] justify-center">
            <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 text-center mb-3">
              Semifinal
            </p>
            <MatchCard match={RIGHT_SF} reversed />
          </div>

          {/* Connector lines right */}
          <div className="flex flex-col justify-around w-3 flex-shrink-0 py-4">
            {RIGHT_QF.map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
            ))}
          </div>

          <RoundCol label="Quarterfinal" matches={RIGHT_QF} reversed />

        </div>
      </div>

      {/* Mobile swipe hint */}
      <p className="flex items-center gap-1.5 mt-3 text-[10px] font-lexend text-white/15 sm:hidden">
        <span className="material-symbols-outlined text-sm">swipe</span>
        Swipe to see full bracket
      </p>

      {/* R16 section below — 2 rows of 4 */}
      <div className="mt-8">
        <p className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/25 mb-4">
          Round of 16
        </p>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
          <div className="grid grid-cols-4 gap-2 min-w-[480px]">
            {[
              { home: { flag: '🇧🇷', name: 'Brazil',      score: 4, winner: true }, away: { flag: '🇷🇸', name: 'Serbia',      score: 0 } },
              { home: { flag: '🇪🇸', name: 'Spain',       score: 2, winner: true }, away: { flag: '🇲🇦', name: 'Morocco',     score: 0 } },
              { home: { flag: '🇦🇷', name: 'Argentina',   score: 2, winner: true }, away: { flag: '🇵🇱', name: 'Poland',      score: 1 } },
              { home: { flag: '🇫🇷', name: 'France',      score: 3, winner: true }, away: { flag: '🇩🇰', name: 'Denmark',     score: 1 } },
              { home: { flag: '🇳🇱', name: 'Netherlands', score: 3, winner: true }, away: { flag: '🇺🇾', name: 'Uruguay',     score: 1 } },
              { home: { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',     score: 3, winner: true }, away: { flag: '🇸🇳', name: 'Senegal',     score: 0 } },
              { home: { flag: '🇵🇹', name: 'Portugal',    score: 6, winner: true }, away: { flag: '🇨🇭', name: 'Switzerland', score: 1 } },
              { home: { flag: '🇺🇸', name: 'USA',         score: 1, winner: true }, away: { flag: '🇸🇦', name: 'Saudi Ar.',   score: 0 } },
            ].map((m, i) => (
              <MatchCard key={i} match={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}