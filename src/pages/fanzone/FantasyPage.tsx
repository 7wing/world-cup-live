// src/pages/fanzone/FantasyPage.tsx
// Fantasy team draft — pick 11 players within a 100-credit budget.

import { useState, useEffect, useMemo } from "react";
import {
  Player,
  saveSquad,
  loadSquad,
  calculatePoints,
  calculateSquadPoints,
  SCORING_RULES,
} from "../../lib/fantasyStorage";

// ------------------------------------------------------------------ constants
const BUDGET = 100;
const SQUAD_SIZE = 11;
// Minimum position requirements
const MIN_POSITIONS: Record<Player["position"], number> = {
  GK: 1,
  DEF: 3,
  MID: 2,
  FWD: 1,
};

// ------------------------------------------------------------------ mock pool
// Replace with API call to your player endpoint
const MOCK_PLAYERS: Player[] = [
  { id: "p1",  name: "Ederson",        team: "Brazil",    position: "GK",  cost: 9  },
  { id: "p2",  name: "Courtois",       team: "Belgium",   position: "GK",  cost: 8  },
  { id: "p3",  name: "Alisson",        team: "Brazil",    position: "GK",  cost: 8  },
  { id: "p4",  name: "T. Alexander-Arnold", team: "England", position: "DEF", cost: 8 },
  { id: "p5",  name: "Theo Hernandez", team: "France",    position: "DEF", cost: 8  },
  { id: "p6",  name: "Marquinhos",     team: "Brazil",    position: "DEF", cost: 7  },
  { id: "p7",  name: "Rüdiger",        team: "Germany",   position: "DEF", cost: 7  },
  { id: "p8",  name: "Hakimi",         team: "Morocco",   position: "DEF", cost: 7  },
  { id: "p9",  name: "Cancelo",        team: "Portugal",  position: "DEF", cost: 7  },
  { id: "p10", name: "Bellingham",     team: "England",   position: "MID", cost: 13 },
  { id: "p11", name: "Vinicius Jr.",   team: "Brazil",    position: "MID", cost: 12 },
  { id: "p12", name: "De Bruyne",      team: "Belgium",   position: "MID", cost: 12 },
  { id: "p13", name: "Pedri",          team: "Spain",     position: "MID", cost: 10 },
  { id: "p14", name: "Valverde",       team: "Uruguay",   position: "MID", cost: 9  },
  { id: "p15", name: "Camavinga",      team: "France",    position: "MID", cost: 8  },
  { id: "p16", name: "Mbappé",         team: "France",    position: "FWD", cost: 15 },
  { id: "p17", name: "Haaland",        team: "Norway",    position: "FWD", cost: 14 },
  { id: "p18", name: "Rodri",          team: "Spain",     position: "FWD", cost: 13 },
  { id: "p19", name: "Osimhen",        team: "Nigeria",   position: "FWD", cost: 11 },
  { id: "p20", name: "Rashford",       team: "England",   position: "FWD", cost: 10 },
  { id: "p21", name: "Leao",           team: "Portugal",  position: "FWD", cost: 9  },
];

const POSITIONS: Player["position"][] = ["GK", "DEF", "MID", "FWD"];
const POSITION_COLORS: Record<Player["position"], string> = {
  GK:  "#F59E0B",
  DEF: "#3B82F6",
  MID: "#10B981",
  FWD: "#EF4444",
};

// ------------------------------------------------------------------ component
export function FantasyPage() {
  const matchdayId = "matchday_1"; // TODO: derive from router param
  const userId = "guest";          // TODO: replace with useAuth().user.id

  const [squad, setSquad] = useState<Player[]>([]);
  const [filter, setFilter] = useState<Player["position"] | "ALL">("ALL");
  const [locked, setLocked] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing squad on mount
  useEffect(() => {
    const existing = loadSquad(matchdayId, userId);
    if (existing) {
      setSquad(existing.players);
      setLocked(existing.lockedIn);
    }
  }, [matchdayId, userId]);

  const spent = useMemo(() => squad.reduce((s, p) => s + p.cost, 0), [squad]);
  const remaining = BUDGET - spent;
  const squadIds = new Set(squad.map((p) => p.id));

  // Validation
  const positionCounts = useMemo(() => {
    const c: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    squad.forEach((p) => c[p.position]++);
    return c;
  }, [squad]);

  const isValid =
    squad.length === SQUAD_SIZE &&
    POSITIONS.every((pos) => positionCounts[pos] >= MIN_POSITIONS[pos]);

  const canAdd = (player: Player) =>
    !locked &&
    !squadIds.has(player.id) &&
    squad.length < SQUAD_SIZE &&
    remaining >= player.cost;

  function addPlayer(player: Player) {
    if (canAdd(player)) setSquad((prev) => [...prev, player]);
  }

  function removePlayer(id: string) {
    if (!locked) setSquad((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSave() {
    saveSquad({ userId, matchdayId, players: squad, lockedIn: locked, savedAt: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLock() {
    if (!isValid) return;
    setLocked(true);
    saveSquad({ userId, matchdayId, players: squad, lockedIn: true, savedAt: "" });
  }

  const visiblePlayers = MOCK_PLAYERS.filter(
    (p) => filter === "ALL" || p.position === filter
  );

  const totalPoints = useMemo(() => calculateSquadPoints(squad), [squad]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 12px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Fantasy Draft</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 20 }}>
        Pick {SQUAD_SIZE} players within a {BUDGET}-credit budget. Scores update live after kick-off.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* ---- Left: Player Pool ---- */}
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {(["ALL", ...POSITIONS] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setFilter(pos)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: "1px solid",
                  borderColor: filter === pos ? "transparent" : "var(--color-border-secondary)",
                  background:
                    filter === pos
                      ? pos === "ALL"
                        ? "var(--color-text-secondary)"
                        : POSITION_COLORS[pos as Player["position"]]
                      : "transparent",
                  color: filter === pos ? "#fff" : "var(--color-text-secondary)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {pos}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 480,
              overflowY: "auto",
            }}
          >
            {visiblePlayers.map((player) => {
              const inSquad = squadIds.has(player.id);
              const affordable = remaining >= player.cost;
              const full = squad.length >= SQUAD_SIZE;
              return (
                <div
                  key={player.id}
                  onClick={() => (inSquad ? removePlayer(player.id) : addPlayer(player))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: inSquad
                      ? POSITION_COLORS[player.position]
                      : "var(--color-border-tertiary)",
                    background: inSquad
                      ? `${POSITION_COLORS[player.position]}18`
                      : "var(--color-background-secondary)",
                    cursor: locked
                      ? "default"
                      : !inSquad && (!affordable || full)
                      ? "not-allowed"
                      : "pointer",
                    opacity: !inSquad && (!affordable || full) ? 0.45 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: POSITION_COLORS[player.position],
                      color: "#fff",
                      borderRadius: 4,
                      padding: "1px 5px",
                      marginRight: 8,
                      minWidth: 28,
                      textAlign: "center",
                    }}
                  >
                    {player.position}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{player.name}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginRight: 8 }}>
                    {player.team}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: inSquad
                        ? POSITION_COLORS[player.position]
                        : "var(--color-text-primary)",
                    }}
                  >
                    {player.cost}cr
                  </span>
                  {inSquad && (
                    <span style={{ marginLeft: 6, fontSize: 12, color: POSITION_COLORS[player.position] }}>
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- Right: Your Squad ---- */}
        <div>
          {/* Budget bar */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>
                Budget: <strong>{remaining}cr left</strong> / {BUDGET}cr
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {squad.length}/{SQUAD_SIZE} players
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "var(--color-border-secondary)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 3,
                  background: spent / BUDGET > 0.9 ? "#EF4444" : "#10B981",
                  width: `${(spent / BUDGET) * 100}%`,
                  transition: "width 0.2s",
                }}
              />
            </div>
          </div>

          {/* Position requirements */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {POSITIONS.map((pos) => {
              const count = positionCounts[pos];
              const min = MIN_POSITIONS[pos];
              const ok = count >= min;
              return (
                <span
                  key={pos}
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: ok ? `${POSITION_COLORS[pos]}20` : "var(--color-background-secondary)",
                    border: `1px solid ${ok ? POSITION_COLORS[pos] : "var(--color-border-tertiary)"}`,
                    color: ok ? POSITION_COLORS[pos] : "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {pos}: {count} {ok ? "✓" : `(min ${min})`}
                </span>
              );
            })}
          </div>

          {/* Squad list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              maxHeight: 340,
              overflowY: "auto",
              marginBottom: 12,
            }}
          >
            {squad.length === 0 && (
              <div
                style={{
                  padding: "24px 0",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  fontSize: 13,
                }}
              >
                Click players from the pool to add them
              </div>
            )}
            {squad.map((player) => (
              <div
                key={player.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 10px",
                  borderRadius: 7,
                  background: "var(--color-background-secondary)",
                  fontSize: 13,
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    background: POSITION_COLORS[player.position],
                    color: "#fff",
                    borderRadius: 3,
                    padding: "1px 4px",
                    minWidth: 26,
                    textAlign: "center",
                  }}
                >
                  {player.position}
                </span>
                <span style={{ flex: 1, fontWeight: 500 }}>{player.name}</span>
                {locked && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#3B82F6",
                    }}
                  >
                    {calculatePoints(player)}pts
                  </span>
                )}
                <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
                  {player.cost}cr
                </span>
                {!locked && (
                  <button
                    onClick={() => removePlayer(player.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-secondary)",
                      fontSize: 16,
                      lineHeight: 1,
                      padding: "0 2px",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total points (if locked in) */}
          {locked && (
            <div
              style={{
                textAlign: "center",
                padding: "10px 0",
                fontSize: 18,
                fontWeight: 500,
                color: "#3B82F6",
                marginBottom: 8,
              }}
            >
              {totalPoints} total points
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            {!locked && (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: "1px solid var(--color-border-secondary)",
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {saved ? "Saved ✓" : "Save Draft"}
                </button>
                <button
                  onClick={handleLock}
                  disabled={!isValid}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 8,
                    border: "none",
                    background: isValid ? "#10B981" : "var(--color-border-secondary)",
                    color: isValid ? "#fff" : "var(--color-text-secondary)",
                    cursor: isValid ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "background 0.2s",
                  }}
                >
                  Lock In Squad
                </button>
              </>
            )}
            {locked && (
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px 0",
                  borderRadius: 8,
                  background: "#10B98120",
                  color: "#10B981",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "1px solid #10B981",
                }}
              >
                ✓ Squad locked in
              </div>
            )}
          </div>

          {/* Scoring guide */}
          <details style={{ marginTop: 16 }}>
            <summary
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              Scoring rules
            </summary>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <span>⚽ Goal (GK/DEF): +{SCORING_RULES.goal_gk_def}pts</span>
              <span>⚽ Goal (MID/FWD): +{SCORING_RULES.goal_outfield}pts</span>
              <span>🅰️ Assist: +{SCORING_RULES.assist}pts</span>
              <span>🛡️ Clean sheet (GK/DEF): +{SCORING_RULES.clean_sheet_gk_def}pts</span>
              <span>🛡️ Clean sheet (MID): +{SCORING_RULES.clean_sheet_mid}pt</span>
              <span>🟨 Yellow card: {SCORING_RULES.yellow_card}pt</span>
              <span>🟥 Red card: {SCORING_RULES.red_card}pts</span>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}