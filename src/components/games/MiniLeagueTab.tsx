// src/components/games/MiniLeagueTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Mini League leaderboard with your-row highlight, progress bars, stats sidebar.
// ─────────────────────────────────────────────────────────────────────────────

import { glassStyle, capStyle, NeonBtn } from '../../shared/ui'
import { MINI_LEAGUE } from '../../lib/fanzoneData'

const MEDALS = ['🥇', '🥈', '🥉']

function trendColor(trend: string) {
  return trend === 'up'
    ? 'var(--primary)'
    : trend === 'down'
      ? 'var(--red)'
      : 'var(--t4)'
}
function trendIcon(trend: string) {
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'
}

export function MiniLeagueTab() {
  const max = MINI_LEAGUE[0].pts

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
      {/* ── Leaderboard table ──────────────────────────────────────────────── */}
      <div>
        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 60px 70px 20px',
            gap: 8,
            padding: '6px 16px 10px',
            borderBottom: '1px solid var(--border-soft)',
            marginBottom: 6,
          }}
        >
          {['#', 'Player', 'Correct', 'Pts', ''].map((h) => (
            <span key={h} style={{ ...capStyle, fontSize: 8, color: 'var(--t4)' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {MINI_LEAGUE.map((p) => (
          <div
            key={p.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 60px 70px 20px',
              gap: 8,
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 4,
              background: p.you ? 'rgba(0,255,65,0.06)' : 'transparent',
              border: p.you
                ? '1px solid var(--primary-border)'
                : '1px solid transparent',
            }}
          >
            {/* Rank / Medal */}
            <span
              style={{
                fontSize: p.rank <= 3 ? 16 : 13,
                fontWeight: 900,
                color: p.rank <= 3 ? 'var(--primary)' : 'var(--t4)',
                fontStyle: 'italic',
              }}
            >
              {p.rank <= 3 ? MEDALS[p.rank - 1] : p.rank}
            </span>

            {/* Player info + bar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--surface-hi)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                  }}
                >
                  {p.avatar}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: p.you ? 800 : 600,
                    color: p.you ? 'var(--primary)' : 'var(--t1)',
                  }}
                >
                  {p.name}
                </span>
                {p.you && (
                  <span
                    style={{
                      ...capStyle,
                      fontSize: 7,
                      color: 'var(--primary)',
                      background: 'var(--primary-dim)',
                      padding: '1px 6px',
                      borderRadius: 6,
                      border: '1px solid var(--primary-border)',
                    }}
                  >
                    You
                  </span>
                )}
              </div>
              {/* Points bar */}
              <div
                style={{
                  height: 2,
                  background: 'var(--border-soft)',
                  borderRadius: 1,
                  marginTop: 5,
                  marginLeft: 34,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: p.you
                      ? 'var(--primary)'
                      : 'rgba(255,255,255,0.15)',
                    borderRadius: 1,
                    width: `${(p.pts / max) * 100}%`,
                    transition: 'width 0.4s',
                  }}
                />
              </div>
            </div>

            {/* Correct count */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--t3)',
                textAlign: 'center',
              }}
            >
              {p.correct} ✓
            </span>

            {/* Points */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: p.you ? 'var(--primary)' : 'var(--t1)',
              }}
            >
              {p.pts.toLocaleString()}
            </span>

            {/* Trend */}
            <span
              style={{ fontSize: 13, fontWeight: 800, color: trendColor(p.trend) }}
            >
              {trendIcon(p.trend)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Your stats */}
        <div style={{ ...glassStyle, padding: 20 }}>
          <p style={{ ...capStyle, color: 'var(--t4)', marginBottom: 14 }}>
            Your Stats
          </p>
          {[
            { l: 'Ranking', v: '#2', c: 'var(--primary)' },
            { l: 'Total Pts', v: '1,840', c: 'var(--t1)' },
            { l: 'Correct', v: '12', c: 'var(--t1)' },
            { l: 'Accuracy', v: '80%', c: 'var(--primary)' },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '7px 0',
                borderBottom: '1px solid var(--border-soft)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--t3)' }}>{s.l}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: s.c }}>
                {s.v}
              </span>
            </div>
          ))}
        </div>

        {/* Invite CTA */}
        <div
          style={{
            ...glassStyle,
            padding: 16,
            background:
              'linear-gradient(135deg, rgba(0,255,65,0.06) 0%, transparent 70%)',
            borderColor: 'var(--primary-border)',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            Invite Friends
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'var(--t3)',
              lineHeight: 1.55,
              marginBottom: 12,
            }}
          >
            Challenge friends and compete for the top spot.
          </p>
          <NeonBtn block>Share League Link →</NeonBtn>
        </div>
      </div>
    </div>
  )
}