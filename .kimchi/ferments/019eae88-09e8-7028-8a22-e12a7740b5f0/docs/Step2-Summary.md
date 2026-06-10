# Phase 5 Step 2: Matches, Stadiums & Games Summary

## Completed Fixes

### Part A: ReviewForm — `overall_rating` NOT sent to DB
**Status:** Already correct (no change needed)
- `ReviewForm.tsx` submits only `atmosphere_score`, `food_score`, `hotel_score`, `safety_score`
- `submitStadiumReview` in `api/stadiums.ts` excludes `overall_rating` from insert
- DB column `stadium_reviews.overall_rating` is `GENERATED ALWAYS` per SUPABASE.md

### Part B: StadiumDetailPage query invalidation
**Status:** Fixed
- Updated `useSubmitReview` in `useStadium.ts` to invalidate with correct query keys:
  - `['stadium', stadiumId, 'reviews']` for reviews list
  - `['stadium', stadiumSlug]` for stadium detail (matches `useStadium` query key)

### Part C: StadiumCard fetchPriority
**Status:** Fixed
- Changed `fetchPriority={priority ? 'high' : 'auto'}` → `fetchPriority={priority ? 'high' : 'low'}`
- Non-priority cards now use `'low'` to avoid competing with hero images

### Part D: StadiumHero image warmer
**Status:** Fixed
- Added `hasWarmed` ref to prevent repeated image warming on re-renders
- `useEffect` now runs only once on mount

### Part E: fetchStadiumById → fetchStadiumBySlug
**Status:** Fixed
- Renamed `fetchStadiumById` → `fetchStadiumBySlug` in:
  - `src/api/stadiums.ts`
  - `src/hooks/useStadium.ts`
- Supabase query already uses `.eq('slug', slug)` (correct)
- Updated all imports

## Verification Results
| Check | Result |
|-------|--------|
| `npm run lint` | 0 errors |
| `npx tsc --noEmit` | 0 errors |
| `npm run build` | success |
| `grep 'overall_rating' ReviewForm.tsx` | not found (correct - DB generates it) |
| `grep 'GENERATED ALWAYS' SUPABASE.md` | found |
| `grep 'fetchStadiumBySlug' useStadium.ts` | found |
| `grep "fetchPriority.*'low'" StadiumCard.tsx` | found |

## Files Modified
1. `src/api/stadiums.ts` — renamed `fetchStadiumById` → `fetchStadiumBySlug`
2. `src/hooks/useStadium.ts` — renamed import, fixed invalidation keys, added `fetchStadiumBySlug` usage
3. `src/components/stadiums/StadiumCard.tsx` — fixed `fetchPriority` to `'low'`
4. `src/components/stadiums/StadiumHero.tsx` — added `hasWarmed` ref
5. `src/pages/stadiums/StadiumDetailPage.tsx` — updated comment for clarity