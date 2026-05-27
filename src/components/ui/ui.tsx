// src/shared/ui.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Primitive UI atoms shared across Fan Zone, Watch Party, and Games pages.
// Drop these into your existing component library or keep them co-located here.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties, ReactNode } from 'react'

// ── Style constants ───────────────────────────────────────────────────────────
export const capStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
}

export const glassStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export const nfmt = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)

// ── LiveDot ───────────────────────────────────────────────────────────────────
export function LiveDot() {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: 7,
        height: 7,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'var(--primary)',
          animation: 'ping 1.6s ease-out infinite',
        }}
      />
      <span
        className="pulse"
        style={{
          position: 'relative',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--primary)',
        }}
      />
    </span>
  )
}

// ── NeonBtn ───────────────────────────────────────────────────────────────────
interface NeonBtnProps {
  children: ReactNode
  onClick?: () => void
  outline?: boolean
  sm?: boolean
  disabled?: boolean
  block?: boolean
  style?: CSSProperties
  type?: 'button' | 'submit'
}

export function NeonBtn({
  children,
  onClick,
  outline,
  sm,
  disabled,
  block,
  style = {},
  type = 'button',
}: NeonBtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: sm ? '5px 14px' : '9px 22px',
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transition: 'all 0.15s',
        background: outline ? 'transparent' : 'var(--primary-dim)',
        color: disabled ? 'var(--t4)' : 'var(--primary)',
        border: `1px solid ${disabled ? 'var(--border)' : 'var(--primary-border)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: block ? 'block' : 'inline-block',
        width: block ? '100%' : undefined,
        textAlign: block ? 'center' : undefined,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  icon: ReactNode
  label: string
  badge?: string
}

export function SectionHeader({ icon, label, badge }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span>{icon}</span>
        <span style={{ ...capStyle, color: 'var(--t3)' }}>{label}</span>
      </div>
      {badge && (
        <span style={{ ...capStyle, color: 'var(--primary)', fontSize: 10 }}>
          {badge}
        </span>
      )}
    </div>
  )
}