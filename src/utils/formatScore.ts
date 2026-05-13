export const formatScore = (home: number, away: number) =>
  `${home} - ${away}`

export const getMatchResult = (
  home: number,
  away: number,
  teamSide: 'home' | 'away'
): 'win' | 'draw' | 'loss' => {
  if (home === away) return 'draw'
  if (teamSide === 'home') return home > away ? 'win' : 'loss'
  return away > home ? 'win' : 'loss'
}