# World Cup Live — Full Codebase Issues Report

A systematic audit of every functional, architectural, and UX problem found across the codebase. Issues are grouped by feature area, ordered roughly from most severe to cosmetic.

---

## 1. Authentication & Login

### 1.1 Auth state race condition on hard refresh
`useAuth.ts` subscribes to `onAuthStateChange`, but `authStore` is also persisted via `zustand/persist` with `partialize: (s) => ({ session: s.session })`. On page load, the persisted session is rehydrated **before** `onAuthStateChange` fires. The result is a flash of unauthenticated UI even when the user is already logged in, and the `loading` flag stays `true` until Supabase resolves, potentially blocking the entire app behind a spinner.

### 1.2 `ForgotPasswordPage` depends on a non-existent RPC
```ts
const { data: exists } = await supabase.rpc('email_has_account', { lookup_email: email })
```
There is no migration or seed file that creates this Postgres function. The RPC call will always return an error, so the code silently falls through — but the error is swallowed with `console.warn`, meaning the no-account warning **never shows**. Anyone can request a reset link for any email with no feedback.

### 1.3 `ResetPasswordPage` PKCE / token_hash flow is fragile
The page tries three different verification strategies (hash fragment, `token_hash` query param, `PASSWORD_RECOVERY` event) with a 6-second timeout fallback that sets a generic error message. In practice, Supabase sends the email with a `token_hash` param, the `verifyOtp` call succeeds, but if the Supabase project uses PKCE (the new default), the token is consumed on first verification. Any page reload after that shows "Link expired" even if the password was never changed.

### 1.4 `LoginPage` re-calls `ensureUserProfile` on every login
`ensureUserProfile` does a DB read followed by a potential INSERT. `useAuth.ts` already calls the same function inside `onAuthStateChange`, so every sign-in triggers it **twice** — once from `LoginPage.handleLogin` and once from the auth listener. This can cause a race where two `INSERT` calls race and one fails with a 23505 (unique-violation), which is silently swallowed but still causes a console error.

### 1.5 `SignupPage` username availability check is non-atomic
The `checkUsername` call runs on `onBlur` and the result is stored in React state. Between the check and the actual sign-up, another user can claim that username. The server-side upsert in `ensureUserProfile` does pick a new username with `pickAvailableUsername`, but the UI never reflects this — the user sees their chosen name in the form, submits, and ends up with a system-generated one like `cr7_goat_1` with no explanation.

---

## 2. Posts & Fan Zone

### 2.1 Like toggle is not optimistic — causes visible flicker
`useToggleLike` in `usePosts.ts` calls `togglePostLike` which does **two sequential Supabase requests** (insert/delete then select+update), then `queryClient.invalidateQueries` refetches the whole posts list. There is no optimistic update, so after clicking like the count jumps back to the old value for ~300ms, then updates. This is jarring on every single like.

### 2.2 `togglePostLike` in `fanzone.ts` has a TOCTOU race
```ts
const { data } = await supabase.from('posts').select('likes').eq('id', postId).single()
// ... then:
await supabase.from('posts').update({ likes: data.likes + 1 }).eq('id', postId)
```
Two concurrent likes will both read the same value and both write `n+1`, resulting in a final count of `n+1` instead of `n+2`. This should be a Postgres-side increment (`likes = likes + 1`) or handled by a DB trigger/function.

### 2.3 `createPostComment` has the same TOCTOU race
```ts
const { data } = await supabase.from('posts').select('comment_count').eq('id', postId).single()
await supabase.from('posts').update({ comment_count: data.comment_count + 1 })
```
Identical problem — concurrent comments will corrupt the counter.

### 2.4 `PostComposer` media upload path leaks files on partial failure
When `handleFileSelect` uploads a file to `post-images` or `post-videos` but the subsequent `createPost` mutation fails, the uploaded file is orphaned in Supabase Storage. There is no cleanup path. Over time this wastes storage quota with no way to reclaim it from the client.

### 2.5 Fan Zone feed has no pagination or infinite scroll
`fetchPosts` is hard-limited to `.limit(30)`. There is no cursor, no "load more", no infinite scroll. Once there are more than 30 posts they are simply invisible. There is no UI indication that only the most recent 30 are shown.

### 2.6 `FeedFilter` "Following" tab shows wrong posts
The "Following" filter is:
```ts
if (filter === 'Following') return posts.filter(p => !p.is_official)
```
This just filters out official posts — it has nothing to do with who the user follows. The `friendships` table exists but is never consulted here. Users clicking "Following" will see all non-official posts from strangers, not just their friends.

### 2.7 Real-time chat in `LiveChatPanel` subscribes but never unsubscribes properly on matchId change
`useRealtimeMatch` creates a Supabase channel named `match:${matchId}`. If the user navigates from one match detail page to another without unmounting the parent, the old channel subscription remains active and the new one is added — causing duplicate messages to appear in the chat.

---

## 3. Tribes & Watch Parties

### 3.1 `joinTribe` silently ignores the `tribe_members` insert but never updates `tribes.member_count`
```ts
const { error } = await supabase.from('tribe_members').insert(...)
if (error && error.code !== '23505') throw error
```
A user who joins a tribe gets a row in `tribe_members`, but `tribes.member_count` is never incremented. This means the member count displayed on every `TribeCard` and `TribesSidebar` will always show whatever was seeded and never reflect actual joins. The only way to fix it is a DB trigger or an RPC — neither exists.

### 3.2 `TribesPage` join button has no per-tribe pending state
`isPending` from `useMutation` is shared across all tribe cards. Clicking "Join" on Tribe A shows a spinner on *every* tribe simultaneously, making it look like all joins are in flight.

### 3.3 `WatchPartiesSidebar` — `viewer_count` is never updated
`watch_parties.viewer_count` is set to whatever was inserted and never incremented when users enter a party. The displayed "X watching" is permanently stale. There is no realtime subscription, just a 60-second poll, so even if viewer_count were updated it would lag significantly.

### 3.4 `WatchPartyPage` has no realtime subscription — uses polling every 5s
All other chat features use Supabase Realtime. Watch party chat polls every 5 seconds. On a busy match day this means messages appear up to 5 seconds late, which feels broken relative to the `LiveChatPanel` that updates instantly.

### 3.5 `sendPartyMessage` updates `watch_parties.last_message` client-side
```ts
await supabase.from('watch_parties').update({ last_message: content, last_msg_at: ... })
```
If two users send messages simultaneously, the last-message in the sidebar could show either one depending on which update wins. More importantly, this is an extra write per message that should be handled by a DB trigger.

### 3.6 `CreatePartyModal` allows creating duplicate-named parties
There is no `UNIQUE` constraint on `watch_parties.name` in the schema, and no client-side deduplication check. Users can (and will) create multiple parties with identical names, making the sidebar confusing.

---

## 4. Profile Page

### 4.1 Profile page shows a black block / scroll lag — root cause
`ProfilePage` renders a `glass-card` hero div with `before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-10` plus `backdrop-filter: blur(20px)`. Multiple stacked `backdrop-filter` elements on the same scroll container trigger GPU compositing layer explosions on Chrome/mobile, causing the black-block artifact and scroll jank. This is a known Chromium issue when `backdrop-filter` elements overlap within a scrollable container. The Stadium page has the same problem (`VenueHero` + multiple `GlassCard` components all with `backdrop-filter: blur(20px)`).

**Specific bad patterns:**
- `glass-card` (backdrop-blur on every card) stacked inside a `PageWrapper` that itself has overflow-x:hidden
- `TopBar` uses inline styles with `backdropFilter: 'blur(20px)'` and is `position: fixed`
- `BottomNav` also `position: fixed` with `backdrop-filter`
- When scrolling, the browser must re-composite 4–6 blur layers simultaneously → jank + black flash

### 4.2 `ProfilePage` — `useFriends`, `useUserPhotos`, `useProfile` all fire simultaneously without coordination
All three queries start in parallel regardless of whether the user is viewing those tabs. This causes a burst of 3–5 Supabase requests on every profile page load, including for users who just want to check their own stats.

### 4.3 `EditProfileModal` — avatar upload race condition
`useUploadAvatar` calls `uploadAvatar` (Storage upload) then `updateUserProfile` (DB update) sequentially inside `mutationFn`. If the user closes the modal before the storage upload completes, `onClose` is called but the mutation continues running in the background. If it succeeds, the store is updated but the modal is gone — the UI never reflects the new avatar until the next page load.

### 4.4 `PredictionRow` inline editing uses uncontrolled `number` inputs
```tsx
<input type="number" min={0} max={99} value={home} onChange={(e) => setHome(Number(e.target.value))} />
```
If the user clears the field, `Number('')` = `0`, and the displayed value jumps to 0 immediately. There is also no validation preventing a user from submitting `home=0, away=0` as an actual prediction intentionally vs. accidentally.

### 4.5 Badge tab shows "No badges yet" for new users but creates no default badges
`passport_badges` is populated per-user but there is no seed/trigger that inserts locked badge rows for new users. New users see an empty badge grid rather than a grid of locked badges showing what they can earn — a poor onboarding experience. Only users who happen to have rows already (from a manual seed) see anything.

---

## 5. Stadium Page

### 5.1 Black block / scroll jank (same root cause as Profile)
`StadiumDetailPage` stacks `VenueHero` (with `backdrop-blur` + `glass-surface` class) on top of multiple `GlassCard` components inside a `PageWrapper` that has `overflow-x: hidden`. The combination of:
- Fixed `TopBar` with backdrop blur
- `VenueHero` full-bleed image with gradient overlay
- Multiple `GlassCard` components each with `backdrop-filter: blur(20px)`
- `StatBadge` grid, `ProgressBar` rows

…forces the browser to re-composite 6–8 GPU layers on every scroll tick. On low-end devices and Safari this produces a flickering black rectangle that covers portions of the page.

**Fix direction:** Replace `backdrop-filter: blur()` on scrollable content with a solid semi-transparent background (`background: rgba(18,20,20,0.9)`). Reserve blur only for the fixed TopBar/BottomNav.

### 5.2 `StadiumCard` image `fetchPriority` is wrong
```tsx
fetchPriority={priority ? 'high' : 'auto'}
```
`priority` is only `true` for the first 3 cards. But `StadiumHero` already loads the hero images eagerly with `new Image()` warming. The card images that are below the fold but have `fetchPriority='high'` compete with above-the-fold content for bandwidth.

### 5.3 `StadiumHero` image warmer runs on every render
```ts
useEffect(() => {
  slides.forEach((s) => { const img = new Image(); img.src = s.hero_image_url })
}, [slides])
```
`slides` is `useMemo(() => stadiums, [stadiums])` — so `slides` has referential stability, but the dependency `[slides]` will still re-run if `stadiums` changes (e.g., after a stale query refresh). This re-fires the entire warming loop unnecessarily.

### 5.4 `fetchStadiumById` uses `slug` as the lookup but the route param is called `stadiumId`
```ts
// router/index.tsx
{ path: 'stadiums/:stadiumId', element: <StadiumDetailPage /> }

// StadiumDetailPage.tsx
const { stadiumId } = useParams()
const { data: stadium } = useStadium(stadiumId!)  // passed as slug
```
`useStadium` → `fetchStadiumById(slug)` → `.eq('slug', slug)`. This actually works but is confusingly named. If someone ever tries to navigate by `id` (UUID) instead of slug it silently returns nothing.

### 5.5 Stadium reviews — `submitStadiumReview` never calculates `overall_rating`
The `overall_rating` column in `stadium_reviews` is `nullable`. The `ReviewForm` collects 4 scores but never computes or sends `overall_rating`. The schema comment says it's nullable but the display code in `StadiumDetailPage` shows `{r.overall_rating && <StarRating value={r.overall_rating} />}` — meaning stars are never shown for any review submitted through the app.

### 5.6 Stadium `avg_*` columns are never updated after a review is submitted
`useSubmitReview` invalidates the React Query cache for the stadium, which triggers a re-fetch. But the `avg_atmosphere`, `avg_food`, etc. columns on the `stadiums` table are **not** computed in real time by any DB trigger. Unless the developer has manually created triggers (none exist in the visible codebase), these averages will always show the seeded values and never change when users submit reviews.

---

## 6. Matches & Match Detail

### 6.1 `MatchDetailPage` — `VibeMeter` uses a hardcoded value of 94
```tsx
<VibeMeter value={94} atmosphere={98} crowdNoise={93} energyIndex={88} match={match} />
```
This is placeholder data never removed. Every single live match shows "94 / Electric" regardless of what's actually happening.

### 6.2 `MomentumChart` goal marker logic is wrong
```ts
const goalIdx = data.findIndex((d, i) => i > 0 && d.home - data[i - 1].home >= 20)
```
This marks a momentum *spike* of ≥20 points as a goal marker. A goal event in `match_events` doesn't always produce a momentum spike (especially if the away team scores). The marker is misleading and frequently misplaced.

### 6.3 `HeatmapPitch` is entirely synthetic — never connected to real data
`HeatmapPitch.tsx` exists but is never imported or rendered anywhere in the app. There is no data source (no `zone_data` or `heatmap` table in the schema) to populate it. It's dead code.

### 6.4 `ScheduleTab` date grouping uses local timezone but `localDateKey` is not DST-safe
```ts
function localDateKey(isoUtc: string): string {
  const d = new Date(isoUtc)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
```
This works correctly for most timezones but will group a match that kicks off at 23:30 UTC into the next calendar day for users in UTC+1. Depending on the user's offset, matches can appear in the wrong date bucket.

### 6.5 `usePrefetchMatch` prefetches lineups but `fetchLineups` is imported from `@/api/matches` not `@/api/lineups`
Both files export a `fetchLineups` function. `usePrefetchMatch` imports from `@/api/matches`. The two implementations are identical but this duplication means a future change to one won't be reflected in the other.

### 6.6 `ScoreCard` possession bar is always shown during live matches regardless of data
```tsx
{isLive && (
  <div>...
    <div style={{ width: `${match.home_possession}%` }} />
```
`match.home_possession` defaults to `50` (seeded as 50 in `seedMatches.ts`). So during live matches the possession bar always shows 50/50 unless someone has manually updated the `matches` row. There is no real-time possession data pipeline.

---

## 7. Games Hub

### 7.1 `MiniLeagueTab` — `fetchMiniLeague` query is O(n) unbounded
```ts
const { data } = await supabase.from('predictions').select('user_id, points_earned, is_correct, users!inner(username)')
```
This fetches **every prediction row from every user** with no limit, then groups client-side. As predictions accumulate over a tournament this query will become increasingly slow and eventually hit the 1000-row max set in `supabase/config.toml`, silently truncating the leaderboard.

### 7.2 `OracleTab` — vote is stored but there is no unique constraint preventing double-voting
The `oracle_votes` table has no `UNIQUE(user_id, question)` constraint in the visible schema. The `castOracleVote` function uses `upsert` with no `onConflict` specified:
```ts
await supabase.from('oracle_votes').upsert({ question: questionId, option_idx: optionIdx, user_id: userId })
```
Without `onConflict`, upsert falls back to insert. A user can vote multiple times (e.g., by refreshing `localVotes` state) and each vote inserts a new row, inflating counts.

### 7.3 `TriviaTab` session score is lost on page navigation
Score is stored only in `useState`. Navigating away from the Games page and back resets the score to 0. There is no persistence (localStorage or DB) for trivia session progress.

### 7.4 `GamesPage` Bracket tab is a non-functional placeholder
```tsx
function BracketGameTab() {
  return (
    <GlassCard className="p-8 text-center">
      <p>Bracket predictor coming once the group stage concludes.</p>
    </GlassCard>
  )
}
```
The tab is listed in the navigation and users can click it, but it shows only a placeholder message. The actual bracket functionality exists in `BracketTab.tsx` but is not wired up in `GamesPage`.

### 7.5 `FanDuelTab` — `createDuelChallenge` creates a `pending` session but there is no accept/reject flow
A user can challenge another fan, which inserts a `duel_sessions` row with `status='pending'`. There is no notification to the opponent, no UI for the opponent to accept or decline, and no polling on the opponent's side to detect incoming challenges. The duel system is essentially non-functional end-to-end.

---

## 8. Schema / Database Mismatches

### 8.1 `match_alerts` PK is `(user_id, match_id)` but `match_id` is nullable in schema
```sql
-- from document index 1:
match_id  | text | Primary   -- but also Nullable in some columns
```
The `syncMatchAlertToSupabase` function inserts with a non-null `match_id`, but the schema definition shown lists `match_id` as nullable for `match_alerts`. If `match_id` is part of the PK it cannot be null — this is a schema contradiction that will cause silent failures.

### 8.2 `fantasy_squads` has no `UNIQUE(user_id, matchday_id)` constraint visible in schema
`saveFantasySquad` uses:
```ts
.upsert({ user_id, matchday_id, ... }, { onConflict: 'user_id,matchday_id' })
```
If this unique constraint doesn't exist in Supabase, the upsert becomes an insert and users will accumulate multiple squads per matchday, breaking the load logic.

### 8.3 `oracle_votes` has no `UNIQUE(user_id, question)` — double votes possible (see 7.2)

### 8.4 `predictions` upsert conflict target is `user_id,match_id` — requires a unique constraint
Same pattern. The schema document shows no explicit unique constraint. If it's missing, every prediction submit creates a new row instead of updating the existing one.

### 8.5 No DB triggers for any denormalized counter columns
The following columns are denormalized counters that the app manually increments client-side (with the TOCTOU race described above):
- `posts.likes`
- `posts.comment_count`
- `tribes.member_count`
- `tribes.total_points`
- `stadiums.avg_*`, `stadiums.total_reviews`

None of these are maintained by DB triggers in the visible codebase. They will drift from reality under any concurrent usage.

---

## 9. Performance & UI Rendering

### 9.1 `globals.css` — `backdrop-filter: blur(20px)` on `.glass-card` is the #1 performance killer
`.glass-card` is used 50+ times across the app. Each instance creates a new GPU compositing layer. When multiple glass cards are visible simultaneously (e.g., StadiumsPage grid, ProfilePage, MatchDetailPage), the browser compositor must blend 10–20 blur layers per frame. This is the direct cause of:
- The black block artifact
- Scroll lag / jank
- High GPU usage on mobile

**Every instance of `.glass-card` in a scrollable container should use a solid background instead of `backdrop-filter`.**

### 9.2 `StadiumsPage` renders all filtered stadiums at once with no virtualization
Up to 16 stadium cards are rendered simultaneously, each with a `<img>` tag and multiple `ProgressBar` components. With `backdrop-filter` on each card this is extremely expensive. There is no lazy rendering, windowing, or virtualization.

### 9.3 `TopBar` re-renders on every scroll event
```ts
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 20)
  window.addEventListener('scroll', onScroll, { passive: true })
})
```
This triggers a React state update (and full `TopBar` re-render) on every single scroll event past the 20px threshold going forward AND backward. It should use a debounce or `useCallback` with a threshold check.

### 9.4 `WatchPartiesSidebar` and `TribesSidebar` are included in `FanZonePage` as `sticky` sidebars but have no max-height on mobile
On mobile viewports, both sidebars render below the main feed (grid collapses to 1 column) and the `sticky top-[68px]` has no effect. The sidebars just add ~400px of content below the posts with no visual separation.

---

## 10. Missing Features That Are Referenced in UI

| UI Element | Referenced In | Status |
|---|---|---|
| Discover Players page | `FriendsPage`, `ProfilePage` | Route `/discover` doesn't exist |
| Messages page | `ProfilePage` "Message" button | Route `/messages/:userId` doesn't exist |
| Individual tribe page | `ProfilePage` tribe link | Route `/tribes/:tribeId` doesn't exist |
| Oracle predictions generator | `useOracle.ts` | Gemini call works but `oracle_predictions` table never gets populated automatically |
| Password reset email `email_has_account` RPC | `ForgotPasswordPage` | Function never created |
| Fantasy matchday ID | `FantasyPage` hardcoded `'matchday_1'` | No matchday management system exists |
| Push notification service worker | `pushNotifications.ts` | No `sw.js` or service worker file exists in the project |
| `LanguageToggle` component | Implemented in `src/components/ui/` | Never imported or used anywhere |

---

## 11. Security Issues

### 11.1 No Row Level Security (RLS) policies are visible
The codebase uses the Supabase `anon` key for all reads and writes. There are no RLS policies shown for any table. This means:
- Any anonymous user can read all `users`, `predictions`, `posts`, `tribes` data
- Any anonymous user can INSERT/UPDATE/DELETE rows in any table
- The `users.xp` and `users.global_rank` columns can be directly modified by any client

### 11.2 `SUPABASE_SERVICE_ROLE_KEY` usage in edge functions is correct but `SUPABASE_ANON_KEY` is used in seed scripts
`seedMatches.ts` uses `VITE_SUPABASE_ANON_KEY` to create the admin Supabase client:
```ts
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)
```
Seed scripts should use the `SERVICE_ROLE_KEY` to bypass RLS. Using the anon key means the seed will fail if RLS is ever properly enabled.

---

## 12. TypeScript / Code Quality

### 12.1 `fetchMatchStats` is defined twice
`src/api/matches.ts` exports `fetchMatchStats`. `src/api/matchStats.ts` also exports `fetchMatchStats`. They are identical. `useMatches.ts` imports from `@/api/matches`, `MatchDetailPage` imports from `@/api/matchEvents` (which re-exports from `@/api/matches`). The duplication will cause confusion and future divergence.

### 12.2 `src/api/lineups.ts` duplicates logic from `src/api/matches.ts`
Both files export `fetchLineups` and `fetchLineupsForTeam`. Only `@/api/matches` version is used in hooks. `@/api/lineups.ts` is dead code.

### 12.3 `MiniLeagueTab` imports from `@/api/miniLeague` but `GamesPage` imports `MiniLeagueTab` — which is never rendered
`GamesPage` defines tabs: `trivia | predictor | bracket | duel`. `MiniLeagueTab` is imported in the file list but `Games Page` never renders it. The mini-league is completely unreachable from the UI.

### 12.4 `src/lib/server/` files are client-importable
`src/lib/server/aiGenerator.ts` and `src/lib/server/seedMatches.ts` live inside `src/` which is bundled by Vite. The comment says "Never import this on the client", but Vite will include them in the bundle if any file accidentally imports them. They should live outside `src/` or be excluded in `vite.config.ts`.

---

## Summary

The codebase has a solid architectural vision but suffers from:

1. **The scroll/black-block issue** is caused by `backdrop-filter: blur(20px)` on `.glass-card` being used pervasively in scrollable containers — fix by using solid semi-transparent backgrounds for in-scroll elements
2. **Counter drift bugs** affect likes, comments, member counts, and stadium ratings — all need DB triggers
3. **Missing database constraints** (UNIQUE on oracle_votes, predictions, fantasy_squads) make upserts insert duplicates
4. **The entire notifications system** (push, service worker) is wired up on the client but the service worker file doesn't exist
5. **Several pages are linked but don't exist** (Discover, Messages, individual Tribe pages)
6. **No RLS policies** means the database is effectively public read/write for anyone with the anon key
7. **Auth double-fire** between `LoginPage` and `useAuth` causes harmless but noisy duplicate profile creation
