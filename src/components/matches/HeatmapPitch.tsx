// src/components/matches/HeatmapPitch.tsx
// Renders a 3×5 grid heatmap on a stylised pitch SVG.
// homeZones / awayZones: 15 values (0–1), left-to-right, top-to-bottom.

import { useState } from "react";

interface HeatmapProps {
  /** 15 cells: 3 columns × 5 rows, values 0–1 */
  homeZones: number[];
  /** 15 cells: 3 columns × 5 rows, values 0–1 */
  awayZones: number[];
  homeColor?: string;   // default: team-primary or blue
  awayColor?: string;   // default: team-secondary or red
  homeTeam?: string;
  awayTeam?: string;
}

const COLS = 3;
const ROWS = 5;
const CELL_W = 100 / COLS;  // 33.33 units
const CELL_H = 100 / ROWS;  // 20 units

function HeatLayer({
  zones,
  color,
  opacity = 0.85,
}: {
  zones: number[];
  color: string;
  opacity?: number;
}) {
  return (
    <>
      {zones.map((intensity, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = col * CELL_W;
        const y = row * CELL_H;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={CELL_W}
            height={CELL_H}
            fill={color}
            fillOpacity={intensity * opacity}
          />
        );
      })}
    </>
  );
}

export function HeatmapPitch({
  homeZones,
  awayZones,
  homeColor = "#3B8BD4",
  awayColor = "#E8593C",
  homeTeam = "Home",
  awayTeam = "Away",
}: HeatmapProps) {
  const [view, setView] = useState<"home" | "away" | "both">("both");

  // Clamp arrays to 15 elements
  const hz = homeZones.slice(0, 15).map((v) => Math.max(0, Math.min(1, v)));
  const az = awayZones.slice(0, 15).map((v) => Math.max(0, Math.min(1, v)));

  return (
    <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>
      {/* Toggle */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 10,
          justifyContent: "center",
        }}
      >
        {(["home", "away", "both"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setView(t)}
            style={{
              padding: "4px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: view === t ? "transparent" : "var(--color-border-secondary, #ccc)",
              background:
                view === t
                  ? t === "home"
                    ? homeColor
                    : t === "away"
                    ? awayColor
                    : "var(--color-text-secondary, #666)"
                  : "transparent",
              color: view === t ? "#fff" : "var(--color-text-secondary, #555)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t === "home" ? homeTeam : t === "away" ? awayTeam : "Both"}
          </button>
        ))}
      </div>

      {/* Pitch */}
      <div
        style={{
          position: "relative",
          borderRadius: 8,
          overflow: "hidden",
          border: "1.5px solid var(--color-border-secondary, #ccc)",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          style={{ display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Football pitch heatmap"
        >
          {/* Pitch surface */}
          <rect width="100" height="100" fill="#2d5a27" />
          {/* Alternating mow stripes */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <rect
              key={i}
              x={0}
              y={i * 10}
              width={100}
              height={10}
              fill={i % 2 === 0 ? "#2d5a27" : "#345e2d"}
            />
          ))}

          {/* Heat layers */}
          {(view === "home" || view === "both") && (
            <HeatLayer zones={hz} color={homeColor} opacity={view === "both" ? 0.65 : 0.85} />
          )}
          {(view === "away" || view === "both") && (
            <HeatLayer zones={az} color={awayColor} opacity={view === "both" ? 0.65 : 0.85} />
          )}

          {/* Pitch markings (white, thin) */}
          {/* Outer boundary */}
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          {/* Centre line */}
          <line
            x1="2"
            y1="50"
            x2="98"
            y2="50"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          {/* Centre circle */}
          <circle
            cx="50"
            cy="50"
            r="9"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.8)" />
          {/* Penalty areas */}
          <rect
            x="28"
            y="2"
            width="44"
            height="16"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          <rect
            x="28"
            y="82"
            width="44"
            height="16"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          {/* Goal areas */}
          <rect
            x="38"
            y="2"
            width="24"
            height="7"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          <rect
            x="38"
            y="91"
            width="24"
            height="7"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          {/* Penalty spots */}
          <circle cx="50" cy="12" r="0.8" fill="rgba(255,255,255,0.8)" />
          <circle cx="50" cy="88" r="0.8" fill="rgba(255,255,255,0.8)" />
          {/* Penalty arcs */}
          <path
            d="M38 18 A11 11 0 0 1 62 18"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          <path
            d="M38 82 A11 11 0 0 0 62 82"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="0.6"
          />
          {/* Corner arcs */}
          <path
            d="M2 5 A3 3 0 0 0 5 2"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.5"
          />
          <path
            d="M95 2 A3 3 0 0 0 98 5"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.5"
          />
          <path
            d="M2 95 A3 3 0 0 1 5 98"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.5"
          />
          <path
            d="M95 98 A3 3 0 0 1 98 95"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.5"
          />

          {/* Grid lines (subtle) */}
          {[1, 2].map((c) => (
            <line
              key={c}
              x1={c * CELL_W}
              y1="0"
              x2={c * CELL_W}
              y2="100"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.4"
            />
          ))}
          {[1, 2, 3, 4].map((r) => (
            <line
              key={r}
              x1="0"
              y1={r * CELL_H}
              x2="100"
              y2={r * CELL_H}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.4"
            />
          ))}
        </svg>

        {/* Direction labels */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "rgba(255,255,255,0.55)",
            pointerEvents: "none",
          }}
        >
          Attack ↑
        </div>
      </div>

      {/* Legend */}
      {view === "both" && (
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            marginTop: 8,
            fontSize: 12,
            color: "var(--color-text-secondary, #666)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: homeColor,
                opacity: 0.85,
                display: "inline-block",
              }}
            />
            {homeTeam}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: awayColor,
                opacity: 0.85,
                display: "inline-block",
              }}
            />
            {awayTeam}
          </span>
        </div>
      )}
    </div>
  );
}