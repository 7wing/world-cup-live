# Performance and Architecture Audit

**Generated:** 2026-06-10  
**Build Output:** `.kimchi/ferments/019eae58-843a-7149-889b-3163d55ad45a/docs/build-output.txt`

---

## PERFORMANCE

### 1. Bundle Size Issues

| Finding | Evidence | Severity |
|---------|----------|----------|
| Main bundle exceeds 500 kB threshold | `index-BU3NcHRt.js`: 933.99 kB (gzipped: 256.74 kB) | warning |

**Evidence:**
```
dist/assets/index-BU3NcHRt.js                933.99 kB │ gzip: 256.74 kB
(!) Some chunks are larger than 500 kB after minification.
```

**Lazy-loaded chunks (all under 50 kB - good):**
| Chunk | Size | Gzipped |
|-------|------|---------|
| MatchDetailPage | 40.72 kB | 8.90 kB |
| FanZonePage | 32.33 kB | 8.87 kB |
| StadiumDetailPage | 23.30 kB | 5.74 kB |
| GamesPage | 23.54 kB | 5.60 kB |
| ProfilePage | 19.23 kB | 5.05 kB |

**Recommendation:** The main bundle at 934 kB should be analyzed for vendor chunking opportunities. Consider splitting node_modules into a separate vendor chunk or using dynamic imports for heavy dependencies.

---

### 2. Large Unoptimized Images

| Finding | Evidence | Severity |
|---------|----------|----------|
| Multiple stadium images exceed 1 MB | 16 stadium images between 321 KB and 5.6 MB | warning |

**Evidence:**
```
-rw-r--r-- 5.6M  src/assets/stadiums/hard-rock.jpg
-rw-r--r-- 5.2M  src/assets/stadiums/lumen.jpg
-rw-r--r-- 4.7M  src/assets/stadiums/nrg.jpg
-rw-r--r-- 4.0M  src/assets/stadiums/att.jpg
-rw-r--r-- 3.6M  src/assets/stadiums/levis.jpg
-rw-r--r-- 3.0M  src/assets/stadiums/gillette.jpg
-rw-r--r-- 3.0M  src/assets/stadiums/bbva.jpg
-rw-r--r-- 2.7M  src/assets/stadiums/bmo.jpg
-rw-r--r-- 2.6M  src/assets/stadiums/metlife.jpg
-rw-r--r-- 2.6M  src/assets/stadiums/azteca.jpg
-rw-r--r-- 2.6M  src/assets/stadiums/akron.jpg
-rw-r--r-- 2.0M  src/assets/stadiums/sofi.jpg
-rw-r--r-- 1.9M  src/assets/stadiums/mercedes-benz.jpg
-rw-r--r-- 1.7M  src/assets/stadiums/bc-place.jpg
-rw-r--r-- 1.3M  src/assets/stadiums/lincoln.jpg
-rw-r--r-- 321K  src/assets/stadiums/arrowhead.jpg
```

**Total stadium image size:** ~46 MB uncompressed

**Recommendation:** 
- Convert all stadium images to WebP format (typically 25-35% smaller with same quality)
- Serve responsive images with `srcset` for mobile devices
- Consider lazy loading stadium images that are not in the initial viewport
- Target < 500 KB per image as a guideline

---

### 3. Lazy Loading Effectiveness

| Finding | Evidence | Severity |
|---------|----------|----------|
| Router uses React.lazy for heavy pages | 7 pages lazy-loaded | info |
| Main bundle still contains significant code | 933.99 kB main chunk | warning |

**Evidence from `src/router/index.tsx`:**
```typescript
const MatchDetailPage   = React.lazy(() => import('@/pages/matches/MatchDetailPage').then(m => ({ default: m.MatchDetailPage })))
const FanZonePage       = React.lazy(() => import('@/pages/fanzone/FanZonePage').then(m => ({ default: m.FanZonePage })))
const GamesPage         = React.lazy(() => import('@/pages/games/GamesPage').then(m => ({ default: m.GamesPage })))
const StadiumDetailPage = React.lazy(() => import('@/pages/stadiums/StadiumDetailPage').then(m => ({ default: m.StadiumDetailPage })))
const ProfilePage       = React.lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
// ...auth pages also lazy-loaded
```

**Eager Prefetch in `src/main.tsx`:**
```typescript
queryClient.prefetchQuery({ queryKey: ['stadiums'], queryFn: fetchStadiumsWithHero })
queryClient.prefetchQuery({ queryKey: ['matches'], queryFn: fetchMatches })
```

**Recommendation:** Good lazy loading implementation. Consider splitting the main bundle further if possible - analyze with `vite-bundle-visualizer`.

---

### 4. Memory Leaks in Hooks

| Finding | Evidence | Severity |
|---------|----------|----------|
| useRealtime has proper cleanup | Removes Supabase channel on unmount | info |
| useFlagWarmer has no cleanup | Prefetches images only - low risk | info |

**Evidence from `src/hooks/useRealtime.ts`:**
```typescript
return () => {
  if (channel) {
    supabase.removeChannel(channel)
  }
}
```

**Recommendation:** All hooks with subscriptions/timers/event listeners should have cleanup functions. Audit periodically as new hooks are added.

---

### 5. Memoization Opportunities

| Finding | Evidence | Severity |
|---------|----------|----------|
| No React.memo usage in components | Grep found zero matches in `src/components/` | warning |
| Limited useCallback/useMemo in hooks | Only found in `usePrefetchMatch.ts` | info |

**Evidence:**
```bash
$ grep -rn "React\.memo" src/components/
(no output)

$ grep -rn "React\.memo\|useMemo\|useCallback" src/components/layout/ src/hooks/
src/hooks/usePrefetchMatch.ts:1:import { useCallback } from 'react'
src/hooks/usePrefetchMatch.ts:19:  return useCallback(
```

**Components that could benefit from memoization:**
- `TopBar.tsx` - Renders on every route change, accesses multiple stores
- `BottomNav.tsx` - Mobile navigation, similar pattern
- `MatchDetailSubComponents.tsx` - Contains multiple sub-components (StatBar, MomentumChart, FormationPitch, etc.)

**Recommendation:** 
- Wrap `TopBar` and `BottomNav` with `React.memo` since they have stable props but re-render on pathname changes
- Use `useCallback` for event handlers passed to memoized children
- Consider `useMemo` for expensive computations in large components

---

## ARCHITECTURE

### 1. API/Hooks Separation

| Finding | Evidence | Severity |
|---------|----------|----------|
| Well-separated architecture | API files in `src/api/`, hooks in `src/hooks/` | info |

**Evidence:**
```typescript
// src/hooks/useMatches.ts imports from API
import { fetchMatch, fetchMatches, fetchMatchStats } from '@/api/matches'

// src/api/matches.ts directive
// Single source of truth for all match-related Supabase queries.
// hooks/useMatches.ts imports from here — do NOT duplicate logic there.
```

**Recommendation:** Maintain this separation. Other domains follow the same pattern.

---

### 2. Large Component Files

| File | Lines | Severity |
|------|-------|----------|
| `src/pages/stadiums/StadiumDetailPage.tsx` | 581 | warning |
| `src/pages/games/GamesPage.tsx` | 573 | warning |
| `src/pages/profile/ProfilePage.tsx` | 556 | warning |
| `src/pages/matches/MatchDetailPage.tsx` | 525 | warning |
| `src/components/matches/MatchDetailSubComponents.tsx` | 514 | warning |

**Recommendation:** 
- Break StadiumDetailPage into sections (Overview, Reviews, Events, etc.)
- Extract tab components from MatchDetailPage into separate files
- Consider co-locating related sub-components in feature folders

---

### 3. Prop Drilling Assessment

| Finding | Evidence | Severity |
|---------|----------|----------|
| No prop drilling for IDs | MatchDetailPage fetches data via hooks | info |

**Evidence:**
```bash
$ grep "userId\|matchId" src/components/matches/MatchDetailSubComponents.tsx
(no output - props not passed down)
```

**Data flow in MatchDetailPage:**
```typescript
// src/pages/matches/MatchDetailPage.tsx
const { matchId } = useParams<{ matchId: string }>()
const { data: match } = useMatch(matchId!)  // Hook fetches data
const { data: matchStat } = useMatchStats(matchId)
const { data: lineups = [] } = useLineups(matchId)

// Pass computed data to sub-components, not IDs
<StatBar label="Possession" home={homePossession} away={100-homePossession} />
<FormationPitch homePlayers={homeXI} awayPlayers={awayXI} />
```

**TopBar/BottomNav use Zustand stores directly:**
```typescript
const { user } = useAuthStore()  // Direct store access
const setSettingsOpen = useSettingsStore((s) => s.setOpen)
```

**Assessment:** Architecture is well-designed. Data is fetched at the page level via hooks and passed as computed values. Global state uses Zustand stores. No prop drilling anti-patterns observed.

---

### 4. Data Fetching Patterns

| Finding | Evidence | Severity |
|---------|----------|----------|
| React Query used for server state | All hooks use @tanstack/react-query | info |
| Batch queries for related data | `usePredictionsForMatches` fetches array in one query | info |

**Evidence:**
```typescript
// Good pattern - single query for multiple matches
export const usePredictionsForMatches = (matchIds: string[]) => {
  return useQuery({
    queryKey: ['predictions', 'batch', matchIds],
    queryFn: () => fetchPredictionsForMatches(matchIds),  // Single DB call
  })
}
```

**Recommendation:** Continue using React Query's batching. Monitor for N+1 patterns when adding new features.

---

### 5. Folder Organization

| Finding | Evidence | Severity |
|---------|----------|----------|
| Feature-based structure | `components/matches/`, `pages/matches/`, `api/`, `hooks/` | info |

**Structure:**
```
src/
├── api/           # API calls (matches.ts, stadiums.ts, fanzone.ts)
├── components/
│   ├── layout/    # TopBar, BottomNav, PageWrapper
│   ├── matches/   # Match-specific components
│   ├── stadiums/  # Stadium components
│   ├── fanzone/   # FanZone components
│   ├── games/     # Game components
│   └── ui/        # Shared UI primitives
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── store/         # Zustand stores
├── types/         # TypeScript types
└── utils/         # Utilities (cn, date formatting)
```

**Recommendation:** Structure is maintainable. Consider feature-folders (`src/features/matches/`) if project continues to grow.

---

## SUMMARY

| Category | Status | Priority |
|----------|--------|----------|
| Bundle Size | Main chunk 934 kB - needs optimization | Medium |
| Image Optimization | 16 images totaling ~46 MB - needs WebP conversion | High |
| Lazy Loading | Properly implemented | N/A |
| Memoization | No React.memo usage - opportunity | Low |
| Prop Drilling | Well-architected, no issues | N/A |
| API/Hooks | Clean separation | N/A |
| Component Size | 5 files > 500 lines - consider splitting | Low |

### Priority Recommendations:

1. **Convert stadium images to WebP** - Immediate impact on load time and bandwidth
2. **Analyze main bundle for vendor splitting** - Potential to reduce initial load by 200-400 kB
3. **Add React.memo to TopBar/BottomNav** - Simple optimization for frequent re-renders
4. **Break down large page components** - Long-term maintainability

---

*Report generated by Ferment audit process*