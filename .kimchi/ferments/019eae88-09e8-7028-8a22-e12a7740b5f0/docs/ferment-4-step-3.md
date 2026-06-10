# Ferment 4, Step 3 — Watch Parties: Realtime Chat + Deduplication

## What was done

### Part A — Realtime chat replaces polling (`WatchPartyPage.tsx`)
- Removed `refetchInterval: 5_000` from the `fetchPartyMessages` query (polling gone)
- Added a `useEffect` that subscribes to a Supabase Realtime channel filtered on `party_id`
- New INSERT events append directly to local `optimistic` state (deduplicated by id)
- Channel is cleaned up on unmount via `supabase.removeChannel(channel)`
- Initial load still uses the `useQuery` so messages appear immediately on mount

### Part B — Removed manual counter updates + added dedup check (`src/api/fanzone.ts`)
- `sendPartyMessage`: removed the second `supabase.from('watch_parties').update(...)` call — DB trigger `party_message_insert` (defined in SUPABASE.md) now handles `last_message` / `last_msg_at` automatically
- `createWatchParty`: wrapped in try/catch; catches PostgreSQL error code `23505` (unique_violation) and re-throws a user-friendly message: "A party with this name already exists."

### Part C — Realtime replaces polling in sidebar modal (`WatchPartiesSidebar.tsx`)
- `PartyChatModal`: same realtime pattern — `supabase.channel()` subscription replaces `refetchInterval`
- `CreatePartyModal`: `onError` handler now inspects the error message for "already exists" and shows it inline instead of a generic failure message

## Files changed
- `src/pages/fanzone/WatchPartyPage.tsx` — realtime subscription + removed polling
- `src/api/fanzone.ts` — removed manual `watch_parties` update, added unique-name catch
- `src/components/fanzone/WatchPartiesSidebar.tsx` — realtime in modal, better dedup error UX

## Verification
```
npm run lint        → 0 errors
npx tsc --noEmit    → 0 errors
npm run build       → success
grep supabase.channel WatchPartyPage.tsx → OK
grep "UNIQUE.*name" SUPABASE.md → OK
```

## Notes
- The Realtime dedup uses `setOptimistic` with a `find` check against both the query data (`messages`) and existing optimistic items (`prev`) to avoid double-adding messages when both the realtime event and React Query invalidation fire.
- `createWatchParty` uses `{ cause: err }` on the re-thrown Error to satisfy the `preserve-caught-error` ESLint rule.