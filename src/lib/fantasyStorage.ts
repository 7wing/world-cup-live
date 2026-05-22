// src/lib/fantasyStorage.ts
// localStorage persistence for Fantasy draft picks and scores.
// Mirrors the predictionsStorage.ts pattern.

export interface Player {
  id: string;
  name: string;
  team: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  cost: number;          // credits (5–15)
  goals?: number;
  assists?: number;
  cleanSheet?: boolean;
  yellowCards?: number;
  redCards?: number;
}

export interface FantasySquad {
  userId: string;        // from auth, or 'guest'
  matchdayId: string;
  players: Player[];
  lockedIn: boolean;
  totalPoints?: number;
  savedAt: string;       // ISO timestamp
}

const KEY_PREFIX = "wcl_fantasy_";

function squadKey(matchdayId: string, userId = "guest") {
  return `${KEY_PREFIX}${userId}_${matchdayId}`;
}

export function saveSquad(squad: FantasySquad): void {
  try {
    const key = squadKey(squad.matchdayId, squad.userId);
    localStorage.setItem(key, JSON.stringify({ ...squad, savedAt: new Date().toISOString() }));
  } catch (e) {
    console.error("[fantasyStorage] saveSquad failed:", e);
  }
}

export function loadSquad(matchdayId: string, userId = "guest"): FantasySquad | null {
  try {
    const raw = localStorage.getItem(squadKey(matchdayId, userId));
    if (!raw) return null;
    return JSON.parse(raw) as FantasySquad;
  } catch {
    return null;
  }
}

export function deleteSquad(matchdayId: string, userId = "guest"): void {
  try {
    localStorage.removeItem(squadKey(matchdayId, userId));
  } catch (e) {
    console.error("[fantasyStorage] deleteSquad failed:", e);
  }
}

/** Return every saved squad for a user (all matchdays). */
export function listSquads(userId = "guest"): FantasySquad[] {
  const prefix = `${KEY_PREFIX}${userId}_`;
  const squads: FantasySquad[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const raw = localStorage.getItem(k);
        if (raw) squads.push(JSON.parse(raw) as FantasySquad);
      }
    }
  } catch (e) {
    console.error("[fantasyStorage] listSquads failed:", e);
  }
  return squads.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

/** Points per stat (adjust to taste). */
export const SCORING_RULES = {
  goal_outfield: 6,
  goal_gk_def: 8,
  assist: 3,
  clean_sheet_gk_def: 4,
  clean_sheet_mid: 1,
  yellow_card: -1,
  red_card: -3,
} as const;

export function calculatePoints(player: Player): number {
  let pts = 0;
  const goals = player.goals ?? 0;
  const assists = player.assists ?? 0;
  const yellow = player.yellowCards ?? 0;
  const red = player.redCards ?? 0;

  if (player.position === "GK" || player.position === "DEF") {
    pts += goals * SCORING_RULES.goal_gk_def;
    if (player.cleanSheet) pts += SCORING_RULES.clean_sheet_gk_def;
  } else if (player.position === "MID") {
    pts += goals * SCORING_RULES.goal_outfield;
    if (player.cleanSheet) pts += SCORING_RULES.clean_sheet_mid;
  } else {
    pts += goals * SCORING_RULES.goal_outfield;
  }

  pts += assists * SCORING_RULES.assist;
  pts += yellow * SCORING_RULES.yellow_card;
  pts += red * SCORING_RULES.red_card;

  return pts;
}

export function calculateSquadPoints(players: Player[]): number {
  return players.reduce((sum, p) => sum + calculatePoints(p), 0);
}