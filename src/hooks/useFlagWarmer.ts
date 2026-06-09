import { useEffect } from 'react'
import { useMatches } from './useMatches'

/**
 * Preload external flag images into the browser cache so fixture rows
 * render without visual pop-in when scrolling the schedule.
 * Emoji flags and bundled SVG flags (country-flag-icons) are skipped.
 */
export function useFlagWarmer() {
  const { data: matches } = useMatches()

  useEffect(() => {
    if (!matches?.length) return

    const urls = new Set<string>()
    for (const m of matches) {
      const home = m.home_team?.flag_url
      const away = m.away_team?.flag_url
      if (home?.startsWith('http')) urls.add(home)
      if (away?.startsWith('http')) urls.add(away)
    }

    for (const url of urls) {
      const img = new Image()
      img.decoding = 'async'
      img.src = url
    }
  }, [matches])
}
