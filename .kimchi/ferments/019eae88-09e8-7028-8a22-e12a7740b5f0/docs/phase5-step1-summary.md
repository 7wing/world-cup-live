# Phase 5 Step 1 — Summary

## Files Modified

### 1. `src/pages/matches/MatchDetailPage.tsx`
- **Issue**: `<VibeMeter value={94} atmosphere={98} crowdNoise={93} energyIndex={88} ...>` hardcoded all values.
- **Fix**: Commented out the VibeMeter component entirely. The Match type has no `vibe_score`, `atmosphere`, `crowdNoise`, or `energyIndex` fields, so no real data exists to wire up. Replaced with a comment noting when the data pipeline is added.
- Also propagated `matchEvents` prop to all 3 MomentumChart usages.

### 2. `src/components/matches/MatchDetailSubComponents.tsx`
- **Issue**: MomentumChart detected goals via synthetic spike (`d.home - data[i-1].home >= 20`), which is misleading.
- **Fix**: Added `matchEvents?: MatchEvent[]` prop. Goal markers are now derived from actual `event_type === 'goal'` events matched by minute. Replaced single `goalIdx` logic with `goalMarkers[]` that renders all goal events.

### 3. `src/components/matches/ScheduleTab.tsx`
- **Issue**: `localDateKey` used `new Date(isoUtc)` which shifts dates for users in positive UTC offsets.
- **Fix**: Now uses `Intl.DateTimeFormat().resolvedOptions().timeZone` to get the user's runtime timezone, then parses the date in that timezone before extracting YYYY-MM-DD parts.

### 4. `src/components/matches/ScoreCard.tsx`
- **Issue**: Possession bar shown during live matches with default value 50, no real data pipeline.
- **Fix**: Conditionally renders possession bar only when `match.home_possession != null && match.home_possession !== 50`.

### 5. `src/hooks/usePrefetchMatch.ts`
- **Issue**: Checked if `fetchLineups` import path was correct.
- **Finding**: Import from `@/api/matches` is already correct — `fetchLineups` is defined once at `src/api/matches.ts:78`. No duplicate. No changes needed.

## Verification Results

| Check | Result |
|-------|--------|
| `grep -c 'value={94}' MatchDetailPage.tsx` | 0 (PASS) |
| `npx tsc --noEmit` | exit 0 (PASS) |
| `npm run lint` | pass (PASS) |
| `npm run build` | success (PASS) |

## Notes
- VibeMeter remains commented out pending a real-time vibe data source (e.g., `match.vibe_score` field or a separate `match_vibes` table).
- MomentumChart goal markers depend on `matchEvents` being passed from MatchDetailPage — propagation was added to all 3 usages.
- `date-fns-tz` is not installed; used native `Intl` API instead for timezone-safe date formatting.