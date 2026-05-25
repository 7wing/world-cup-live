// src/components/matches/ScheduleTab.tsx

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Flags from 'country-flag-icons/react/3x2'
import { GlassCard } from '@/components/ui/GlassCard'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Fixture {
  id: string
  kickoff: string
  groupLabel: string
  home: { code: string; name: string }
  away: { code: string; name: string }
  venue: string
  city: string
  homeScore?: number
  awayScore?: number
  status: 'upcoming' | 'finished'
}

// ── Flag ──────────────────────────────────────────────────────────────────────
function TeamFlag({ code }: { code: string }) {
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code]
  if (!FlagComponent)
    return <span className="inline-flex w-6 h-[16px] rounded-[2px] bg-white/10 flex-shrink-0" />
  return <FlagComponent className="w-6 h-[16px] rounded-[2px] flex-shrink-0 shadow-sm" style={{ display: 'inline-block' }} />
}

// ── Timezone helpers ──────────────────────────────────────────────────────────
function localTime(isoUtc: string): string {
  const d = new Date(isoUtc)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function localDateKey(isoUtc: string): string {
  const d = new Date(isoUtc)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateLabel(isoUtc: string): string {
  const d = new Date(isoUtc)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'long' })
}

function tzAbbr(): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find(p => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}

// ── Fixture Data ──────────────────────────────────────────────────────────────
export const FIXTURES: Fixture[] = [
  // ── Jun 11 (ET) ──
  { id: 'g1',  kickoff: '2026-06-11T19:00:00.000Z', groupLabel: 'Group A', home: { code: 'MX', name: 'Mexico' },         away: { code: 'ZA', name: 'South Africa' },   venue: 'Estadio Azteca',               city: 'Mexico City',   status: 'upcoming' },
  { id: 'g2',  kickoff: '2026-06-12T02:00:00.000Z', groupLabel: 'Group A', home: { code: 'KR', name: 'South Korea' },    away: { code: 'CZ', name: 'Czechia' },        venue: 'Estadio Akron',                city: 'Zapopan',       status: 'upcoming' },

  // ── Jun 12 (ET) ──
  { id: 'g3',  kickoff: '2026-06-12T19:00:00.000Z', groupLabel: 'Group B', home: { code: 'CA', name: 'Canada' },         away: { code: 'BA', name: 'Bosnia & Herz.' }, venue: 'BMO Field',                    city: 'Toronto',       status: 'upcoming' },
  { id: 'g4',  kickoff: '2026-06-13T01:00:00.000Z', groupLabel: 'Group D', home: { code: 'US', name: 'USA' },            away: { code: 'PY', name: 'Paraguay' },       venue: 'SoFi Stadium',                 city: 'Los Angeles',   status: 'upcoming' },

  // ── Jun 13 (ET) ──
  { id: 'g5',  kickoff: '2026-06-13T19:00:00.000Z', groupLabel: 'Group B', home: { code: 'QA', name: 'Qatar' },          away: { code: 'CH', name: 'Switzerland' },    venue: "Levi's Stadium",               city: 'San Francisco', status: 'upcoming' },
  { id: 'g6',  kickoff: '2026-06-13T22:00:00.000Z', groupLabel: 'Group C', home: { code: 'BR', name: 'Brazil' },         away: { code: 'MA', name: 'Morocco' },        venue: 'MetLife Stadium',              city: 'New York',      status: 'upcoming' },
  { id: 'g7',  kickoff: '2026-06-14T01:00:00.000Z', groupLabel: 'Group C', home: { code: 'HT', name: 'Haiti' },          away: { code: 'GB', name: 'Scotland' },       venue: 'Gillette Stadium',             city: 'Boston',        status: 'upcoming' },

  // ── Jun 14 (ET) ──
  { id: 'g8',  kickoff: '2026-06-14T04:00:00.000Z', groupLabel: 'Group D', home: { code: 'AU', name: 'Australia' },      away: { code: 'TR', name: 'Turkey' },         venue: 'BC Place',                     city: 'Vancouver',     status: 'upcoming' },
  { id: 'g9',  kickoff: '2026-06-14T17:00:00.000Z', groupLabel: 'Group E', home: { code: 'DE', name: 'Germany' },        away: { code: 'CW', name: 'Curaçao' },        venue: 'NRG Stadium',                  city: 'Houston',       status: 'upcoming' },
  { id: 'g10', kickoff: '2026-06-14T20:00:00.000Z', groupLabel: 'Group F', home: { code: 'NL', name: 'Netherlands' },    away: { code: 'JP', name: 'Japan' },          venue: 'AT&T Stadium',                 city: 'Dallas',        status: 'upcoming' },
  { id: 'g11', kickoff: '2026-06-14T23:00:00.000Z', groupLabel: 'Group E', home: { code: 'CI', name: "Côte d'Ivoire" },  away: { code: 'EC', name: 'Ecuador' },        venue: 'Lincoln Financial Field',      city: 'Philadelphia',  status: 'upcoming' },
  { id: 'g12', kickoff: '2026-06-15T02:00:00.000Z', groupLabel: 'Group F', home: { code: 'SE', name: 'Sweden' },         away: { code: 'TN', name: 'Tunisia' },        venue: 'Estadio BBVA',                 city: 'Monterrey',     status: 'upcoming' },

  // ── Jun 15 (ET) ──
  { id: 'g13', kickoff: '2026-06-15T16:00:00.000Z', groupLabel: 'Group H', home: { code: 'ES', name: 'Spain' },          away: { code: 'CV', name: 'Cape Verde' },     venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',       status: 'upcoming' },
  { id: 'g14', kickoff: '2026-06-15T19:00:00.000Z', groupLabel: 'Group G', home: { code: 'BE', name: 'Belgium' },        away: { code: 'EG', name: 'Egypt' },          venue: 'Lumen Field',                  city: 'Seattle',       status: 'upcoming' },
  { id: 'g15', kickoff: '2026-06-15T22:00:00.000Z', groupLabel: 'Group H', home: { code: 'SA', name: 'Saudi Arabia' },   away: { code: 'UY', name: 'Uruguay' },        venue: 'Hard Rock Stadium',            city: 'Miami',         status: 'upcoming' },
  { id: 'g16', kickoff: '2026-06-16T01:00:00.000Z', groupLabel: 'Group G', home: { code: 'IR', name: 'Iran' },           away: { code: 'NZ', name: 'New Zealand' },    venue: 'SoFi Stadium',                 city: 'Los Angeles',   status: 'upcoming' },

  // ── Jun 16 (ET) ──
  { id: 'g17', kickoff: '2026-06-16T19:00:00.000Z', groupLabel: 'Group I', home: { code: 'FR', name: 'France' },         away: { code: 'SN', name: 'Senegal' },        venue: 'MetLife Stadium',              city: 'New York',      status: 'upcoming' },
  { id: 'g18', kickoff: '2026-06-16T22:00:00.000Z', groupLabel: 'Group I', home: { code: 'IQ', name: 'Iraq' },           away: { code: 'NO', name: 'Norway' },         venue: 'Gillette Stadium',             city: 'Boston',        status: 'upcoming' },
  { id: 'g19', kickoff: '2026-06-17T01:00:00.000Z', groupLabel: 'Group J', home: { code: 'AR', name: 'Argentina' },      away: { code: 'DZ', name: 'Algeria' },        venue: 'Arrowhead Stadium',            city: 'Kansas City',   status: 'upcoming' },

  // ── Jun 17 (ET) ──
  { id: 'g20', kickoff: '2026-06-17T04:00:00.000Z', groupLabel: 'Group J', home: { code: 'AT', name: 'Austria' },        away: { code: 'JO', name: 'Jordan' },         venue: "Levi's Stadium",               city: 'San Francisco', status: 'upcoming' },
  { id: 'g21', kickoff: '2026-06-17T17:00:00.000Z', groupLabel: 'Group K', home: { code: 'PT', name: 'Portugal' },       away: { code: 'CD', name: 'Congo DR' },       venue: 'NRG Stadium',                  city: 'Houston',       status: 'upcoming' },
  { id: 'g22', kickoff: '2026-06-17T20:00:00.000Z', groupLabel: 'Group L', home: { code: 'GB', name: 'England' },        away: { code: 'HR', name: 'Croatia' },        venue: 'AT&T Stadium',                 city: 'Dallas',        status: 'upcoming' },
  { id: 'g23', kickoff: '2026-06-17T23:00:00.000Z', groupLabel: 'Group L', home: { code: 'GH', name: 'Ghana' },          away: { code: 'PA', name: 'Panama' },         venue: 'BMO Field',                    city: 'Toronto',       status: 'upcoming' },
  { id: 'g24', kickoff: '2026-06-18T02:00:00.000Z', groupLabel: 'Group K', home: { code: 'UZ', name: 'Uzbekistan' },     away: { code: 'CO', name: 'Colombia' },       venue: 'Estadio Azteca',               city: 'Mexico City',   status: 'upcoming' },

  // ── Jun 18 (ET) ──
  { id: 'g25', kickoff: '2026-06-18T16:00:00.000Z', groupLabel: 'Group A', home: { code: 'CZ', name: 'Czechia' },        away: { code: 'ZA', name: 'South Africa' },   venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',       status: 'upcoming' },
  { id: 'g26', kickoff: '2026-06-18T19:00:00.000Z', groupLabel: 'Group B', home: { code: 'CH', name: 'Switzerland' },    away: { code: 'BA', name: 'Bosnia & Herz.' }, venue: 'SoFi Stadium',                 city: 'Los Angeles',   status: 'upcoming' },
  { id: 'g27', kickoff: '2026-06-18T22:00:00.000Z', groupLabel: 'Group B', home: { code: 'CA', name: 'Canada' },         away: { code: 'QA', name: 'Qatar' },          venue: 'BC Place',                     city: 'Vancouver',     status: 'upcoming' },
  { id: 'g28', kickoff: '2026-06-19T01:00:00.000Z', groupLabel: 'Group A', home: { code: 'MX', name: 'Mexico' },         away: { code: 'KR', name: 'South Korea' },    venue: 'Estadio Akron',                city: 'Zapopan',       status: 'upcoming' },

  // ── Jun 19 (ET) ──
  { id: 'g29', kickoff: '2026-06-19T19:00:00.000Z', groupLabel: 'Group D', home: { code: 'US', name: 'USA' },            away: { code: 'AU', name: 'Australia' },      venue: 'Lumen Field',                  city: 'Seattle',       status: 'upcoming' },
  { id: 'g30', kickoff: '2026-06-19T22:00:00.000Z', groupLabel: 'Group C', home: { code: 'GB', name: 'Scotland' },       away: { code: 'MA', name: 'Morocco' },        venue: 'Gillette Stadium',             city: 'Boston',        status: 'upcoming' },
  { id: 'g31', kickoff: '2026-06-20T00:30:00.000Z', groupLabel: 'Group C', home: { code: 'BR', name: 'Brazil' },         away: { code: 'HT', name: 'Haiti' },          venue: 'Lincoln Financial Field',      city: 'Philadelphia',  status: 'upcoming' },
  { id: 'g32', kickoff: '2026-06-20T03:00:00.000Z', groupLabel: 'Group D', home: { code: 'TR', name: 'Turkey' },         away: { code: 'PY', name: 'Paraguay' },       venue: "Levi's Stadium",               city: 'San Francisco', status: 'upcoming' },

  // ── Jun 20 (ET) ──
  { id: 'g33', kickoff: '2026-06-20T17:00:00.000Z', groupLabel: 'Group F', home: { code: 'NL', name: 'Netherlands' },    away: { code: 'SE', name: 'Sweden' },         venue: 'NRG Stadium',                  city: 'Houston',       status: 'upcoming' },
  { id: 'g34', kickoff: '2026-06-20T20:00:00.000Z', groupLabel: 'Group E', home: { code: 'DE', name: 'Germany' },        away: { code: 'CI', name: "Côte d'Ivoire" },  venue: 'BMO Field',                    city: 'Toronto',       status: 'upcoming' },
  { id: 'g35', kickoff: '2026-06-21T00:00:00.000Z', groupLabel: 'Group E', home: { code: 'EC', name: 'Ecuador' },        away: { code: 'CW', name: 'Curaçao' },        venue: 'Arrowhead Stadium',            city: 'Kansas City',   status: 'upcoming' },

  // ── Jun 21 (ET) ──
  { id: 'g36', kickoff: '2026-06-21T04:00:00.000Z', groupLabel: 'Group F', home: { code: 'TN', name: 'Tunisia' },        away: { code: 'JP', name: 'Japan' },          venue: 'Estadio BBVA',                 city: 'Monterrey',     status: 'upcoming' },
  { id: 'g37', kickoff: '2026-06-21T16:00:00.000Z', groupLabel: 'Group H', home: { code: 'ES', name: 'Spain' },          away: { code: 'SA', name: 'Saudi Arabia' },   venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',       status: 'upcoming' },
  { id: 'g38', kickoff: '2026-06-21T19:00:00.000Z', groupLabel: 'Group G', home: { code: 'BE', name: 'Belgium' },        away: { code: 'IR', name: 'Iran' },           venue: 'SoFi Stadium',                 city: 'Los Angeles',   status: 'upcoming' },
  { id: 'g39', kickoff: '2026-06-21T22:00:00.000Z', groupLabel: 'Group H', home: { code: 'UY', name: 'Uruguay' },        away: { code: 'CV', name: 'Cape Verde' },     venue: 'Hard Rock Stadium',            city: 'Miami',         status: 'upcoming' },
  { id: 'g40', kickoff: '2026-06-22T01:00:00.000Z', groupLabel: 'Group G', home: { code: 'NZ', name: 'New Zealand' },    away: { code: 'EG', name: 'Egypt' },          venue: 'BC Place',                     city: 'Vancouver',     status: 'upcoming' },

  // ── Jun 22 (ET) ──
  { id: 'g41', kickoff: '2026-06-22T17:00:00.000Z', groupLabel: 'Group J', home: { code: 'AR', name: 'Argentina' },      away: { code: 'AT', name: 'Austria' },        venue: 'AT&T Stadium',                 city: 'Dallas',        status: 'upcoming' },
  { id: 'g42', kickoff: '2026-06-22T21:00:00.000Z', groupLabel: 'Group I', home: { code: 'FR', name: 'France' },         away: { code: 'IQ', name: 'Iraq' },           venue: 'Lincoln Financial Field',      city: 'Philadelphia',  status: 'upcoming' },
  { id: 'g43', kickoff: '2026-06-23T00:00:00.000Z', groupLabel: 'Group I', home: { code: 'NO', name: 'Norway' },         away: { code: 'SN', name: 'Senegal' },        venue: 'MetLife Stadium',              city: 'New York',      status: 'upcoming' },
  { id: 'g44', kickoff: '2026-06-23T03:00:00.000Z', groupLabel: 'Group J', home: { code: 'JO', name: 'Jordan' },         away: { code: 'DZ', name: 'Algeria' },        venue: "Levi's Stadium",               city: 'San Francisco', status: 'upcoming' },

  // ── Jun 23 (ET) ──
  { id: 'g45', kickoff: '2026-06-23T17:00:00.000Z', groupLabel: 'Group K', home: { code: 'PT', name: 'Portugal' },       away: { code: 'UZ', name: 'Uzbekistan' },     venue: 'NRG Stadium',                  city: 'Houston',       status: 'upcoming' },
  { id: 'g46', kickoff: '2026-06-23T20:00:00.000Z', groupLabel: 'Group L', home: { code: 'GB', name: 'England' },        away: { code: 'GH', name: 'Ghana' },          venue: 'Gillette Stadium',             city: 'Boston',        status: 'upcoming' },
  { id: 'g47', kickoff: '2026-06-23T23:00:00.000Z', groupLabel: 'Group L', home: { code: 'PA', name: 'Panama' },         away: { code: 'HR', name: 'Croatia' },        venue: 'BMO Field',                    city: 'Toronto',       status: 'upcoming' },
  { id: 'g48', kickoff: '2026-06-24T02:00:00.000Z', groupLabel: 'Group K', home: { code: 'CO', name: 'Colombia' },       away: { code: 'CD', name: 'Congo DR' },       venue: 'Estadio Akron',                city: 'Zapopan',       status: 'upcoming' },

  // ── Jun 24 · Matchday 3 simultaneous pairs ──
  { id: 'g49', kickoff: '2026-06-24T19:00:00.000Z', groupLabel: 'Group B', home: { code: 'CH', name: 'Switzerland' },    away: { code: 'CA', name: 'Canada' },         venue: 'BC Place',                     city: 'Vancouver',     status: 'upcoming' },
  { id: 'g50', kickoff: '2026-06-24T19:00:00.000Z', groupLabel: 'Group B', home: { code: 'BA', name: 'Bosnia & Herz.' }, away: { code: 'QA', name: 'Qatar' },          venue: 'Lumen Field',                  city: 'Seattle',       status: 'upcoming' },
  { id: 'g51', kickoff: '2026-06-24T22:00:00.000Z', groupLabel: 'Group C', home: { code: 'GB', name: 'Scotland' },       away: { code: 'BR', name: 'Brazil' },         venue: 'Hard Rock Stadium',            city: 'Miami',         status: 'upcoming' },
  { id: 'g52', kickoff: '2026-06-24T22:00:00.000Z', groupLabel: 'Group C', home: { code: 'MA', name: 'Morocco' },        away: { code: 'HT', name: 'Haiti' },          venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',       status: 'upcoming' },
  { id: 'g53', kickoff: '2026-06-25T01:00:00.000Z', groupLabel: 'Group A', home: { code: 'CZ', name: 'Czechia' },        away: { code: 'MX', name: 'Mexico' },         venue: 'Estadio Azteca',               city: 'Mexico City',   status: 'upcoming' },
  { id: 'g54', kickoff: '2026-06-25T01:00:00.000Z', groupLabel: 'Group A', home: { code: 'ZA', name: 'South Africa' },   away: { code: 'KR', name: 'South Korea' },    venue: 'Estadio BBVA',                 city: 'Monterrey',     status: 'upcoming' },

  // ── Jun 25 · Matchday 3 simultaneous pairs ──
  { id: 'g55', kickoff: '2026-06-25T20:00:00.000Z', groupLabel: 'Group E', home: { code: 'CW', name: 'Curaçao' },        away: { code: 'CI', name: "Côte d'Ivoire" },  venue: 'Lincoln Financial Field',      city: 'Philadelphia',  status: 'upcoming' },
  { id: 'g56', kickoff: '2026-06-25T20:00:00.000Z', groupLabel: 'Group E', home: { code: 'EC', name: 'Ecuador' },        away: { code: 'DE', name: 'Germany' },        venue: 'MetLife Stadium',              city: 'New York',      status: 'upcoming' },
  { id: 'g57', kickoff: '2026-06-25T23:00:00.000Z', groupLabel: 'Group F', home: { code: 'JP', name: 'Japan' },          away: { code: 'SE', name: 'Sweden' },         venue: 'AT&T Stadium',                 city: 'Dallas',        status: 'upcoming' },
  { id: 'g58', kickoff: '2026-06-25T23:00:00.000Z', groupLabel: 'Group F', home: { code: 'TN', name: 'Tunisia' },        away: { code: 'NL', name: 'Netherlands' },    venue: 'Arrowhead Stadium',            city: 'Kansas City',   status: 'upcoming' },
  { id: 'g59', kickoff: '2026-06-26T02:00:00.000Z', groupLabel: 'Group D', home: { code: 'TR', name: 'Turkey' },         away: { code: 'US', name: 'USA' },            venue: 'SoFi Stadium',                 city: 'Los Angeles',   status: 'upcoming' },
  { id: 'g60', kickoff: '2026-06-26T02:00:00.000Z', groupLabel: 'Group D', home: { code: 'PY', name: 'Paraguay' },       away: { code: 'AU', name: 'Australia' },      venue: "Levi's Stadium",               city: 'San Francisco', status: 'upcoming' },

  // ── Jun 26 · Matchday 3 simultaneous pairs ──
  { id: 'g61', kickoff: '2026-06-26T19:00:00.000Z', groupLabel: 'Group I', home: { code: 'NO', name: 'Norway' },         away: { code: 'FR', name: 'France' },         venue: 'Gillette Stadium',             city: 'Boston',        status: 'upcoming' },
  { id: 'g62', kickoff: '2026-06-26T19:00:00.000Z', groupLabel: 'Group I', home: { code: 'SN', name: 'Senegal' },        away: { code: 'IQ', name: 'Iraq' },           venue: 'BMO Field',                    city: 'Toronto',       status: 'upcoming' },
  { id: 'g63', kickoff: '2026-06-27T00:00:00.000Z', groupLabel: 'Group H', home: { code: 'CV', name: 'Cape Verde' },     away: { code: 'SA', name: 'Saudi Arabia' },   venue: 'NRG Stadium',                  city: 'Houston',       status: 'upcoming' },
  { id: 'g64', kickoff: '2026-06-27T00:00:00.000Z', groupLabel: 'Group H', home: { code: 'UY', name: 'Uruguay' },        away: { code: 'ES', name: 'Spain' },          venue: 'Estadio Akron',                city: 'Zapopan',       status: 'upcoming' },
  { id: 'g65', kickoff: '2026-06-27T03:00:00.000Z', groupLabel: 'Group G', home: { code: 'EG', name: 'Egypt' },          away: { code: 'IR', name: 'Iran' },           venue: 'Lumen Field',                  city: 'Seattle',       status: 'upcoming' },
  { id: 'g66', kickoff: '2026-06-27T03:00:00.000Z', groupLabel: 'Group G', home: { code: 'NZ', name: 'New Zealand' },    away: { code: 'BE', name: 'Belgium' },        venue: 'BC Place',                     city: 'Vancouver',     status: 'upcoming' },

  // ── Jun 27 · Matchday 3 simultaneous pairs ──
  { id: 'g67', kickoff: '2026-06-27T21:00:00.000Z', groupLabel: 'Group L', home: { code: 'PA', name: 'Panama' },         away: { code: 'GB', name: 'England' },        venue: 'MetLife Stadium',              city: 'New York',      status: 'upcoming' },
  { id: 'g68', kickoff: '2026-06-27T21:00:00.000Z', groupLabel: 'Group L', home: { code: 'HR', name: 'Croatia' },        away: { code: 'GH', name: 'Ghana' },          venue: 'Lincoln Financial Field',      city: 'Philadelphia',  status: 'upcoming' },
  { id: 'g69', kickoff: '2026-06-27T23:30:00.000Z', groupLabel: 'Group K', home: { code: 'CO', name: 'Colombia' },       away: { code: 'PT', name: 'Portugal' },       venue: 'Hard Rock Stadium',            city: 'Miami',         status: 'upcoming' },
  { id: 'g70', kickoff: '2026-06-27T23:30:00.000Z', groupLabel: 'Group K', home: { code: 'CD', name: 'Congo DR' },       away: { code: 'UZ', name: 'Uzbekistan' },     venue: 'Mercedes-Benz Stadium',        city: 'Atlanta',       status: 'upcoming' },
  { id: 'g71', kickoff: '2026-06-28T02:00:00.000Z', groupLabel: 'Group J', home: { code: 'DZ', name: 'Algeria' },        away: { code: 'AT', name: 'Austria' },        venue: 'Arrowhead Stadium',            city: 'Kansas City',   status: 'upcoming' },
  { id: 'g72', kickoff: '2026-06-28T02:00:00.000Z', groupLabel: 'Group J', home: { code: 'JO', name: 'Jordan' },         away: { code: 'AR', name: 'Argentina' },      venue: 'AT&T Stadium',                 city: 'Dallas',        status: 'upcoming' },

  // ── Historical result — 2022 Final ──
  {
    id: 'wc22-final',
    kickoff: '2022-12-18T22:00:00.000Z',
    groupLabel: 'Final · 2022',
    home: { code: 'AR', name: 'Argentina' },
    away: { code: 'FR', name: 'France' },
    venue: 'Lusail Stadium',
    city: 'Lusail',
    homeScore: 3,
    awayScore: 3,
    status: 'finished',
  },
]

// ── Group by local date ───────────────────────────────────────────────────────
function groupByLocalDate(fixtures: Fixture[]): [string, Fixture[]][] {
  const map: Record<string, Fixture[]> = {}
  for (const f of fixtures) {
    const key = localDateKey(f.kickoff)
    if (!map[key]) map[key] = []
    map[key].push(f)
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

// ── Fixture Row ───────────────────────────────────────────────────────────────
function FixtureRow({ fixture }: { fixture: Fixture }) {
  const navigate = useNavigate()
  const isFinished = fixture.status === 'finished'
  const time = localTime(fixture.kickoff)

  return (
    <div
      onClick={() => navigate(`/matches/${fixture.id}`)}
      className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
    >
      {/* Local time / FT */}
      <div className="w-10 flex-shrink-0 text-center">
        {isFinished
          ? <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-primary-container/60">FT</span>
          : <span className="text-[10px] font-lexend font-bold text-white/25">{time}</span>
        }
      </div>

      {/* Home team */}
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <span className={`font-lexend font-semibold text-xs truncate text-right ${
          isFinished && fixture.homeScore! > fixture.awayScore! ? 'text-white' : isFinished ? 'text-white/35' : 'text-white/70'
        }`}>
          {fixture.home.name}
        </span>
        <TeamFlag code={fixture.home.code} />
      </div>

      {/* Score / VS */}
      <div className="flex items-center gap-1.5 flex-shrink-0 w-14 justify-center">
        {isFinished ? (
          <>
            <span className={`font-lexend font-black text-sm w-4 text-center ${fixture.homeScore! > fixture.awayScore! ? 'text-white' : 'text-white/30'}`}>
              {fixture.homeScore}
            </span>
            <span className="text-white/15 font-lexend font-black text-xs">–</span>
            <span className={`font-lexend font-black text-sm w-4 text-center ${fixture.awayScore! > fixture.homeScore! ? 'text-white' : 'text-white/30'}`}>
              {fixture.awayScore}
            </span>
          </>
        ) : (
          <span className="text-[10px] font-lexend font-bold text-white/15 tracking-widest">vs</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <TeamFlag code={fixture.away.code} />
        <span className={`font-lexend font-semibold text-xs truncate ${
          isFinished && fixture.awayScore! > fixture.homeScore! ? 'text-white' : isFinished ? 'text-white/35' : 'text-white/70'
        }`}>
          {fixture.away.name}
        </span>
      </div>

      {/* Group + venue */}
      <div className="hidden sm:flex flex-col items-end flex-shrink-0 w-40 gap-0.5">
        <span className="text-[9px] font-lexend font-black uppercase tracking-widest text-primary-container/50">
          {fixture.groupLabel}
        </span>
        <span className="text-[9px] font-lexend text-white/15 w-full text-right">
          {fixture.venue}, {fixture.city}
        </span>
      </div>

      {/* Arrow indicator */}
      <span className="material-symbols-outlined text-[14px] text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0">
        chevron_right
      </span>
    </div>
  )
}

// ── Date Section ──────────────────────────────────────────────────────────────
function DateSection({ fixtures }: { fixtures: Fixture[] }) {
  const label = formatDateLabel(fixtures[0].kickoff)
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2 bg-white/2 border-b border-white/5 sticky top-0 z-10 backdrop-blur-sm">
        <span className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
          {label}
        </span>
        <span className="text-[9px] font-lexend text-white/15">
          {fixtures.length} {fixtures.length === 1 ? 'match' : 'matches'}
        </span>
      </div>
      {fixtures.map((f) => (
        <FixtureRow key={f.id} fixture={f} />
      ))}
    </div>
  )
}

// ── Main ScheduleTab ──────────────────────────────────────────────────────────
type TabView = 'upcoming' | 'results'

export function ScheduleTab() {
  const [view, setView] = useState<TabView>('upcoming')

  const upcoming = useMemo(() => FIXTURES.filter((f) => f.status === 'upcoming'), [])
  const results  = useMemo(() => FIXTURES.filter((f) => f.status === 'finished').reverse(), [])

  const upcomingByDate = useMemo(() => groupByLocalDate(upcoming), [upcoming])
  const resultsByDate  = useMemo(() => groupByLocalDate(results),  [results])

  const tz = tzAbbr()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <p className="text-[11px] font-lexend font-bold uppercase tracking-widest text-white/25">
            {view === 'upcoming'
              ? `${upcoming.length} ${upcoming.length === 1 ? 'Fixture' : 'Fixtures'}`
              : `${results.length} ${results.length === 1 ? 'Result' : 'Results'}`}
          </p>
          {tz && (
            <p className="text-[9px] font-lexend text-white/15 mt-0.5">
              Times shown in your local timezone · {tz}
            </p>
          )}
        </div>

        <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 self-end sm:self-auto">
          {(['upcoming', 'results'] as TabView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-[10px] font-lexend font-bold uppercase tracking-wider rounded-md transition-all ${
                view === v ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {v === 'upcoming' ? 'Upcoming' : 'Results'}
            </button>
          ))}
        </div>
      </div>

      {view === 'upcoming' && (
        <GlassCard className="overflow-hidden">
          {upcomingByDate.map(([dateKey, fixtures]) => (
            <DateSection key={dateKey} fixtures={fixtures} />
          ))}
        </GlassCard>
      )}

      {view === 'results' && (
        resultsByDate.length > 0 ? (
          <GlassCard className="overflow-hidden">
            {resultsByDate.map(([dateKey, fixtures]) => (
              <DateSection key={dateKey} fixtures={fixtures} />
            ))}
          </GlassCard>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-3">sports_soccer</span>
            <p className="font-lexend font-black text-sm text-white/20">No results yet</p>
            <p className="font-lexend text-[11px] text-white/10 mt-1">Check back after Jun 11</p>
          </div>
        )
      )}
    </div>
  )
}