# Step 4a — Fan Zone Posts Fixes

## Changes Summary

### Part A: Fixed TOCTOU in `src/api/fanzone.ts`

**`togglePostLike`** — Removed all read-update-write on `posts.likes`. Now only INSERT/DELETE `post_likes` rows and let the DB trigger handle counter updates. The function returns `boolean` (new liked state) so callers know the result.

**`createPostComment`** — Removed client-side read-update-write on `posts.comment_count`. Now INSERTs into `post_comments` and returns the inserted row (with user join). DB trigger handles the counter.

**`fetchPosts`** — Rewrote with cursor-based pagination support:
- Accepts `params: { matchId?, userId?, friendIds?, cursor?, limit? }`
- Returns `{ posts: Post[], nextCursor: string | null }`
- Uses `limit + 1` to detect if there's a next page
- Supports `.in('user_id', friendIds)` for Following filter

**Added `fetchFriendIds`** — Queries `friendships` for accepted friends of a user. Used by the Following feed filter.

---

### Part B: Infinite Scroll + Optimistic Updates in `src/hooks/usePosts.ts`

**`usePosts`** — Replaced `useQuery` with `useInfiniteQuery`:
- Query key: `['posts', filter, matchId, userId]`
- `initialPageParam: null`
- `getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined`
- On "Following" filter, fetches `friendIds` via `fetchFriendIds` and includes `self + friends` in the query

**`useToggleLike`** — Added full optimistic update:
- `onMutate`: snapshots all post query caches, then uses `qc.setQueriesData` to toggle `liked` and adjust `likes ± 1` for the target post
- `onError`: rolls back all snapshots
- `onSettled`: invalidates post queries

**`useCreateComment`** — Added full optimistic update:
- `onMutate`: creates a temporary `PostComment` object with optimistic ID, prepends to comments list, increments `comment_count` on the post
- `onError`: rolls back snapshots, removes comments query cache
- `onSuccess`: invalidates comments + posts queries

---

### Part C: PostComposer Media Cleanup in `src/components/fanzone/PostComposer.tsx`

- Tracks `mediaBucket` and `mediaPath` in `useRef` after upload success
- `handlePost` now accepts a `cleanupMedia?: () => Promise<void>` parameter
- Passes a cleanup closure to the `onPost` callback; it calls `supabase.storage.from(bucket).remove([path])` on failure

---

### Part D: Following Feed Filter

**`src/pages/fanzone/FanZonePage.tsx`** — Updated to use `usePosts` with `filter`:
- Filter prop (`'All' | 'Trending' | 'Following'`) passed to `usePosts({ filter })`
- Posts fetched from `data.pages.flatMap(p => p.posts)`
- "Trending" filter applied client-side (sort by likes)
- "Following" filter handled server-side in `usePosts` via `fetchFriendIds`
- Added "Load more" button with `fetchNextPage()` / `hasNextPage`

**`src/components/fanzone/PostCard.tsx`** — Uses `useCreateComment` hook instead of raw `useMutation` + `createPostComment`.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/api/fanzone.ts` | `fetchPosts` → cursor pagination + friend filter; `togglePostLike` → DB trigger only; `createPostComment` → DB trigger only; added `fetchFriendIds` |
| `src/hooks/usePosts.ts` | `useQuery` → `useInfiniteQuery`; added `useToggleLike` optimistic; added `useCreateComment` optimistic; exported `FeedFilterType` |
| `src/components/fanzone/PostComposer.tsx` | Track storage path; pass cleanup function on post failure |
| `src/pages/fanzone/FanZonePage.tsx` | Use `usePosts` with filter + infinite scroll; "Load more" button; handle media cleanup on error |
| `src/components/fanzone/PostCard.tsx` | Use `useCreateComment` from hook |

## Verification

```
npm run lint    → 0 errors
tsc --noEmit    → 0 errors
npm run build   → success
grep 'onMutate' src/hooks/usePosts.ts   → matches
grep 'useInfiniteQuery' src/hooks/usePosts.ts → matches
```

## Decisions

- **Friend IDs in hook, not FeedFilter**: The filter component only knows which tab is active. Logic to fetch and apply friendship data belongs in the query hook — cleaner separation.
- **Cursor-based pagination**: Used `created_at` as cursor (last item's timestamp) rather than offset — handles real-time inserts correctly.
- **Cleanup closure in PostComposer**: File deletion logic stays in the composer (where bucket/path are known); FanZonePage calls it on mutation error — avoids prop drilling storage internals.