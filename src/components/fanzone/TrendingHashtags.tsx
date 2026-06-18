import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useLiveMatches } from '@/hooks/useMatches'
import { GlassCard } from '@/components/ui/GlassCard'

const HASHTAG_REGEX = /#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g

interface TrendingTag {
  tag: string
  count: number
  /** Original casing from first occurrence; used for display */
  display: string
}

function normalizeTag(tag: string): string {
  return tag.slice(1).toLowerCase()
}

function toTeamTag(name: string): string {
  return name.replace(/\s+/g, '')
}

// Module-level constant — stable for the app lifetime
const POST_CUTOFF = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

export function TrendingHashtags(): JSX.Element {
  // ── Recent posts ──────────────────────────────────────────────────────────

  const { data: posts } = useQuery({
    queryKey: ['posts', 'trending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('content')
        .gte('created_at', POST_CUTOFF)
        .limit(200)
      if (error) throw error
      return data as { content: string }[]
    },
    staleTime: 5 * 60 * 1000,
  })

  // ── Live matches ──────────────────────────────────────────────────────────
  const { data: liveMatches } = useLiveMatches()

  // ── Build tag map ─────────────────────────────────────────────────────────
  const tagMap = new Map<string, { count: number; display: string }>()

  // Count hashtag usage from posts
  if (posts) {
    for (const post of posts) {
      const raw = post.content.match(HASHTAG_REGEX) ?? []
      for (const rawTag of raw) {
        const norm = normalizeTag(rawTag)
        const existing = tagMap.get(norm)
        tagMap.set(norm, {
          count: (existing?.count ?? 0) + 1,
          display: existing?.display ?? rawTag,
        })
      }
    }
  }

  // Add match-derived tags (base count of 5 so they always appear)
  const addedMatchTags = new Set<string>()
  if (liveMatches) {
    for (const match of liveMatches) {
      const homeTag = toTeamTag(match.home_team.name)
      const awayTag = toTeamTag(match.away_team.name)

      if (!addedMatchTags.has(homeTag)) {
        addedMatchTags.add(homeTag)
        const norm = homeTag.toLowerCase()
        const existing = tagMap.get(norm)
        tagMap.set(norm, {
          count: Math.max(existing?.count ?? 0, 5),
          display: existing?.display ?? `#${homeTag}`,
        })
      }

      if (!addedMatchTags.has(awayTag)) {
        addedMatchTags.add(awayTag)
        const norm = awayTag.toLowerCase()
        const existing = tagMap.get(norm)
        tagMap.set(norm, {
          count: Math.max(existing?.count ?? 0, 5),
          display: existing?.display ?? `#${awayTag}`,
        })
      }

      // Always add #WorldCup and #MatchDay
      for (const base of ['WorldCup', 'MatchDay']) {
        const norm = base.toLowerCase()
        const existing = tagMap.get(norm)
        tagMap.set(norm, {
          count: Math.max(existing?.count ?? 0, 5),
          display: existing?.display ?? `#${base}`,
        })
      }
    }
  }

  // Sort by count descending, take top 6
  const sorted: TrendingTag[] = Array.from(tagMap.entries())
    .map(([, v]) => ({ tag: v.display.slice(1), count: v.count, display: v.display }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return (
    <GlassCard className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className="text-lg leading-none">🔥</span>
        <span className="font-lexend font-black text-[9px] uppercase tracking-widest text-white/30">
          Trending
        </span>
        {liveMatches && liveMatches.length > 0 && (
          <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[8px] font-lexend font-black uppercase text-red-400">
            Live
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-1 py-2">
        {sorted.length === 0 ? (
          <p className="px-3 py-4 text-center font-lexend text-xs text-white/30">
            No trends yet
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {sorted.map(({ tag, count, display }) => (
              <li
                key={tag}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
              >
                <span className="font-lexend text-xs text-primary-container font-semibold">
                  {display}
                </span>
                <span className="font-lexend text-[10px] text-white/25 font-medium">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  )
}