export type AlertKey = 'goals' | 'redCards' | 'lineups' | 'fantasyPts' | 'kickoff'

export const MATCH_ALERT_OPTIONS: { key: AlertKey; label: string; icon: string }[] = [
  { key: 'goals', label: 'Goals', icon: 'sports_soccer' },
  { key: 'redCards', label: 'Red Cards', icon: 'square' },
  { key: 'lineups', label: 'Line-up Release', icon: 'groups' },
  { key: 'fantasyPts', label: 'Fantasy Updates', icon: 'auto_awesome' },
  { key: 'kickoff', label: 'Kick-off Reminder', icon: 'notifications' },
]

const STORAGE_KEY = 'wcl-match-alerts'

export const DEFAULT_ALERTS: Record<AlertKey, boolean> = {
  goals: true,
  redCards: true,
  lineups: false,
  fantasyPts: false,
  kickoff: true,
}

export function loadMatchAlerts(): Record<AlertKey, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ALERTS }
    return { ...DEFAULT_ALERTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_ALERTS }
  }
}

export function saveMatchAlerts(alerts: Record<AlertKey, boolean>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}
