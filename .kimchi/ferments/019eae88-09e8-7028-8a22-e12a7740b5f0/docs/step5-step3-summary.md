# Step 5.3 — Matches, Stadiums & Games Fix Summary

## All 5 parts completed and verified

| Part | File | Fix | Status |
|------|------|-----|--------|
| A | `src/api/miniLeague.ts` | Added `.limit(500)` to `fetchMiniLeague` query to prevent unbounded row growth | PASS |
| B | `src/api/oracleVotes.ts` | Added `{ onConflict: 'user_id,question' }` to upsert; button disabled after vote via `localVotes` state | PASS |
| C | `src/components/games/TriviaTab.tsx` | Score persisted via localStorage with lazy init; "New Session" button clears storage | PASS |
| D | `src/pages/games/GamesPage.tsx` | Imported `BracketTab` from `@/components/matches/BracketTab`; replaced placeholder `<BracketGameTab />` | PASS |
| E | `src/pages/games/GamesPage.tsx` + `src/api/games.ts` | Added `IncomingChallengesSection` component with Accept/Reject buttons; API helpers `fetchIncomingChallenges`, `acceptDuel`, `rejectDuel` with 10s polling | PASS |

## Verification results

```
PASS: BracketTab wired
PASS: localStorage in TriviaTab
PASS: accept/reject in FanDuel
PASS: onConflict in oracleVotes
PASS: limit(500) in miniLeague
```

- `npm run lint` → 0 errors
- `npx tsc --noEmit` → 0 errors
- `npm run build` → success (2.54s)

## Notes

- **Part E (FanDuel)**: `DuelTab.tsx` does not exist as a standalone file — the Fan Duel UI lives in `FanDuelTab` (a local component inside `GamesPage.tsx`). The accept/reject section was added there as `IncomingChallengesSection`, which polls every 10 seconds via `refetchInterval`.
- **Part B (Oracle)**: The `onConflict: 'user_id,question'` relies on the `UNIQUE(user_id, question)` constraint on `oracle_votes` (documented in SUPABASE.md).
- **Part A (MiniLeague)**: Server-side aggregation (RPC) was deferred to a future step; `.limit(500)` prevents the 1000-row Supabase limit from being hit in the interim.