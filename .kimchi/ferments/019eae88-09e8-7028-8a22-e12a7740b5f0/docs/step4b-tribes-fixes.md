# Step 4b: Tribes Fixes — Per-Tribe Join Loading & Member Count

## Problem
In `TribesPage.tsx`, `useMutation` returned a single global `isPending` flag.
Clicking "Join" on Tribe A showed a spinner on ALL tribe cards simultaneously.

## Solution

### Part A: Created `src/hooks/useTribes.ts`
Exposes `useJoinTribe()` hook with:
- `joinMutation` — the raw mutation object (includes `variables` tracking in-flight tribe ID)
- `isJoining(tribeId)` — helper that returns `true` only for the specific tribe being joined

```typescript
// src/hooks/useTribes.ts
export function useJoinTribe() {
  const joinMutation = useMutation({
    mutationFn: (tribeId: string) => {
      if (!user) throw new Error('Not authenticated')
      return joinTribe(user.id, tribeId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tribes'] })  // DB trigger handles member_count
      push('Joined tribe!', 'success')
    },
    // ...
  })

  const isJoining = (tribeId: string) =>
    joinMutation.isPending && joinMutation.variables === tribeId

  return { joinMutation, isJoining }
}
```

### Part B: Updated `src/pages/fanzone/TribesPage.tsx`
- Replaced inline `useMutation` with `useJoinTribe()` hook
- `TribeCard` now receives `isJoining: boolean` instead of `isPending: boolean`
- Button text shows "Joining…" while that specific tribe is joining

### Part C: Member Count
- No client-side `member_count` increment found or removed
- `joinTribe()` in `src/api/fanzone.ts` only inserts into `tribe_members` table
- DB trigger (per `SUPABASE.md`) handles `tribes.member_count` automatically
- Query invalidation (`qc.invalidateQueries({ queryKey: ['tribes'] })`) refreshes UI with server-correct count

## Files Changed
- **Created:** `src/hooks/useTribes.ts` — new hook with per-tribe loading state
- **Modified:** `src/pages/fanzone/TribesPage.tsx` — uses new hook, passes per-tribe `isJoining` prop

## Verification
```
npm run lint      → 0 errors
npx tsc --noEmit  → 0 errors
npm run build     → success
grep 'variables' src/hooks/useTribes.ts || grep 'joinMutation' src/hooks/useTribes.ts → VERIFIED
```

## Notes
- The `isJoining(tribeId)` pattern is cleaner than exposing `variables` directly; it encapsulates the comparison logic
- The DB trigger approach is correct — no optimistic `member_count` updates client-side