# Fix All Issues — Implementation Plan

> Ferment: Fix all project issues  
> Date: 2026-06-10

## Overview

This plan addresses all 50+ issues from `ISSUES.md` and the prior audit reports. Work is organized into 6 phases, each producing a verifiable, buildable slice. Every change targets a functional outcome (a working page, a fixed race condition, a secure DB). Dead code removal, lint fixes, and cleanup are folded into the relevant phases rather than treated as separate work.

---

## Phase 1: Foundation (Lint, Dead Code, Build Config)

**Goal:** Get the codebase to a clean baseline — zero ESLint errors, zero TypeScript issues, no dead code, no build warnings.

### Chunk 1.1 — Fix ESLint Errors
**Files:** `src/router/index.tsx`, `src/hooks/useAuth.ts`, `src/hooks/useRealtime.ts`, `src/api/trivia.ts`, `src/components/fanzone/WatchPartiesSidebar.tsx`, `src/components/matches/ScorePredictor.tsx`, `src/pages/games/GamesPage.tsx`, `src/components/layout/TopBar.tsx`, `src/components/profile/SettingsModal.tsx`, `src/components/fanzone/LiveChatPanel.tsx`, `src/pages/ResetPassword.tsx`

**Changes:**
- `router/index.tsx`: Remove unused `Suspense` import; restructure so each lazy-loaded page component is defined in its own file (fix `react-refresh/only-export-components`).
- `hooks/useAuth.ts`: Fix `exhaustive-deps` warning.
- `hooks/useRealtime.ts`: Replace `as any` with a proper typed payload. Fix missing dependency.
- `api/trivia.ts`: Remove useless `rows` assignment.
- `fanzone/WatchPartiesSidebar.tsx`: Fix `purity` error (move `Date.now()` outside render).
- `matches/ScorePredictor.tsx`: Fix `set-state-in-effect` error.
- `games/GamesPage.tsx`: Fix `set-state-in-effect` and `exhaustive-deps`.
- `layout/TopBar.tsx`: Fix `set-state-in-effect`.
- `profile/SettingsModal.tsx`: Fix `set-state-in-effect`.
- `fanzone/LiveChatPanel.tsx`: Fix missing dependency.
- `pages/ResetPassword.tsx`: Fix `set-state-in-effect`.

**Acceptance:** `npm run lint` reports 0 errors, 0 warnings.

### Chunk 1.2 — Remove Dead Code & Duplicates
**Files:** `src/api/lineups.ts`, `src/api/matchStats.ts`, `src/components/matches/HeatmapPitch.tsx`, `src/components/games/MiniLeagueTab.tsx`, `src/lib/server/seedMatches.ts`, `src/lib/server/seedPlayers.ts`

**Changes:**
- Delete `src/api/lineups.ts` (logic duplicated in `src/api/matches.ts`).
- Delete `src/api/matchStats.ts` (logic duplicated in `src/api/matches.ts`).
- Delete `src/components/matches/HeatmapPitch.tsx` (never imported, no data source).
- Verify `MiniLeagueTab` is truly unreachable; if so, delete or wire it up in Phase 5.
- Move `src/lib/server/` files outside `src/` (e.g., to `scripts/`) or exclude them in `vite.config.ts` to prevent accidental client bundling.

**Acceptance:** `npm run build` still succeeds; no new lint errors.

### Chunk 1.3 — Build Optimizations
**Files:** `vite.config.ts`

**Changes:**
- Add `manualChunks` to split vendor libraries (react, react-dom, react-router-dom, @tanstack/react-query, @supabase/supabase-js) from app code.
- Set `build.chunkSizeWarningLimit: 600` to reduce noise.

**Acceptance:** Build succeeds; main chunk < 500 KB; no "Some chunks are larger than 500 kB" warning.

---

## Phase 2: Database Schema & Security (SUPABASE.md)

**Goal:** Produce a single `SUPABASE.md` with every SQL migration needed. No code changes in this phase — just the SQL document.

### Chunk 2.1 — SUPABASE.md (Triggers, Constraints, RLS, RPCs)
**File:** `SUPABASE.md`

**SQL sections:**
1. **RLS Policies** — Enable RLS on every table; add policies so authenticated users can read public data, write their own rows, and admins can manage everything.
2. **Unique Constraints** —
   - `oracle_votes` UNIQUE(`user_id`, `question`)
   - `predictions` UNIQUE(`user_id`, `match_id`)
   - `fantasy_squads` UNIQUE(`user_id`, `matchday_id`)
   - `watch_parties` UNIQUE(`name`)
3. **DB Triggers for Denormalized Counters** —
   - `posts.likes` increment/decrement trigger on `post_likes` insert/delete.
   - `posts.comment_count` increment/decrement trigger on `post_comments` insert/delete.
   - `tribes.member_count` increment/decrement trigger on `tribe_members` insert/delete.
   - `stadiums.avg_atmosphere`, `avg_food`, `avg_parking`, `avg_access` + `total_reviews` update trigger on `stadium_reviews` insert/update/delete.
   - `watch_parties.last_message`, `last_msg_at` update trigger on `watch_party_messages` insert.
4. **RPC: `email_has_account`** — PostgreSQL function for `ForgotPasswordPage` to check email existence without leaking timing info.
5. **Schema fixes** —
   - `match_alerts.match_id` nullable fix. If it must remain nullable, remove it from PK and use a surrogate PK. If it must be non-null, add `NOT NULL`.
   - `stadium_reviews.overall_rating` — make it `GENERATED ALWAYS AS ((atmosphere + food + parking + access) / 4.0) STORED`.

**Acceptance:** `SUPABASE.md` exists, each SQL block is runnable in the Supabase SQL Editor, and applying it would fix all schema mismatches and counter drift issues.

---

## Phase 3: Auth, Profile & UI Performance

**Goal:** Fix all auth race conditions, profile page rendering bugs, and the GPU compositing issue caused by `backdrop-filter: blur(20px)`.

### Chunk 3.1 — Auth Race Conditions & Robustness
**Files:** `src/hooks/useAuth.ts`, `src/store/authStore.ts`, `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx`, `src/api/profile.ts`

**Changes:**
- `useAuth.ts`: Remove `zustand/persist` for auth state (or gate rehydration behind `onAuthStateChange`). Ensure `loading` is resolved before rendering children. Do NOT double-fire `ensureUserProfile`.
- `Login.tsx`: Remove the redundant `ensureUserProfile` call; rely solely on `useAuth` listener.
- `Signup.tsx`: Make username availability check atomic by moving check server-side, or at least show the final assigned username after `ensureUserProfile` completes.
- `ForgotPassword.tsx`: Handle missing `email_has_account` RPC gracefully — show a generic "If the email exists, a reset link has been sent" message regardless (more secure UX).
- `ResetPassword.tsx`: Simplify PKCE/token flow. Use `supabase.auth.verifyOtp` with `type: 'recovery'` and access the token from the URL hash. Remove the fragile 6s timeout fallback.

**Acceptance:** Hard refresh shows no auth flash; login/signup/reset flows work without console errors.

### Chunk 3.2 — Profile Page GPU Fix & Edit Profile
**Files:** `src/pages/profile/ProfilePage.tsx`, `src/components/profile/EditProfileModal.tsx`, `src/components/profile/BadgeGrid.tsx`, `src/styles/globals.css`

**Changes:**
- Replace `backdrop-filter: blur(20px)` on scrollable content (`.glass-card`, `VenueHero`, `ProfilePage` hero) with solid semi-transparent backgrounds (`background: rgba(18,20,20,0.85)`).
- Keep blur **only** on fixed `TopBar` and `BottomNav`.
- `EditProfileModal`: Wait for the mutation to finish before calling `onClose`. Disable the close button while uploading.
- `BadgeGrid`: For new users with zero badges, show a grid of locked badges so users know what they can earn (seed default locked rows via the UI or show placeholder badges).

**Acceptance:** No black rectangle / scroll jank on Profile page or Stadium detail page.

### Chunk 3.3 — Profile Data Loading & Prediction UX
**Files:** `src/hooks/useProfile.ts`, `src/components/profile/SettingsModal.tsx`, `src/components/matches/ScorePredictor.tsx`

**Changes:**
- `useProfile.ts`: Make friends, photos, and profile queries lazy — only fetch when the corresponding tab is visible.
- `ScorePredictor`: Handle empty input gracefully (show `-` instead of jumping to `0`). Add validation for `0-0` predictions.

**Acceptance:** Profile page loads without a burst of simultaneous queries; prediction inputs feel responsive.

---

## Phase 4: Fan Zone, Posts, Tribes & Watch Parties

**Goal:** Fix all social feature bugs: TOCTOU races, feed filters, pagination, media cleanup, tribe counters, watch party realtime.

### Chunk 4.1 — Posts: Atomic Counters, Optimistic Updates, Pagination
**Files:** `src/api/fanzone.ts`, `src/hooks/usePosts.ts`, `src/components/fanzone/PostCard.tsx`, `src/components/fanzone/PostComposer.tsx`, `src/pages/fanzone/FanZonePage.tsx`

**Changes:**
- `fanzone.ts`: Replace client-side read-update-write for `likes` and `comment_count` with `supabase.rpc('increment_likes', ...)` or use the DB triggers from Phase 2 after they're applied.
- `usePosts.ts`: Implement optimistic updates for `togglePostLike` and `createPostComment` using TanStack Query's `setQueryData`.
- `FanZonePage.tsx`: Add infinite scroll / cursor pagination (`fetchPosts` accepts `cursor`, `limit`).
- `PostComposer.tsx`: On failed `createPost`, delete the uploaded media from Supabase Storage to prevent orphaned files.

**Acceptance:** Like/comment counts update instantly without flicker; pagination loads more posts on scroll; no orphaned media in Storage on failed posts.

### Chunk 4.2 — Feed Filter & Realtime Chat
**Files:** `src/components/fanzone/FeedFilter.tsx`, `src/hooks/useRealtime.ts`, `src/components/fanzone/LiveChatPanel.tsx`

**Changes:**
- `FeedFilter.tsx`: Fix "Following" tab to query the `friendships` table and filter posts by `user_id IN (friendIds)`.
- `useRealtime.ts`: Ensure the Supabase channel is removed and recreated when `matchId` changes. Track channel refs in a closure or ref.
- `LiveChatPanel.tsx`: Cleanup subscription on unmount and on `matchId` change.

**Acceptance:** "Following" tab shows only friends' posts; switching matches doesn't duplicate chat messages.

### Chunk 4.3 — Tribes & Watch Parties
**Files:** `src/api/tribes.ts`, `src/hooks/useTribes.ts`, `src/pages/fanzone/TribesPage.tsx`, `src/pages/fanzone/WatchPartyPage.tsx`, `src/components/fanzone/WatchPartiesSidebar.tsx`, `src/api/watchParties.ts`

**Changes:**
- `useTribes.ts`: Fix `joinTribe` mutation so `isPending` is scoped per tribe (use `variables` from mutation state) instead of global.
- `TribesPage.tsx`: Show per-tribe loading state on the join button.
- `WatchPartyPage.tsx`: Replace 5s polling with Supabase Realtime subscription to `watch_party_messages`.
- `WatchPartiesSidebar.tsx`: Remove `viewer_count` manual updates and rely on a DB counter or subscription if needed.
- `api/watchParties.ts`: Remove client-side `last_message` update; rely on DB trigger from Phase 2. Add unique check on `watch_parties.name`.

**Acceptance:** Tribe join shows spinner only on the clicked tribe; watch party messages appear instantly; no duplicate party names.

---

## Phase 5: Matches, Stadiums & Games

**Goal:** Fix match detail placeholders, stadium review submission, and games hub issues.

### Chunk 5.1 — Match Detail Fixes
**Files:** `src/pages/matches/MatchDetailPage.tsx`, `src/components/matches/MatchDetailSubComponents.tsx`, `src/components/matches/ScorePredictor.tsx`, `src/components/matches/ScheduleTab.tsx`, `src/components/matches/ScoreCard.tsx`, `src/hooks/usePrefetchMatch.ts`

**Changes:**
- `MatchDetailPage.tsx`: Remove hardcoded `VibeMeter` values; derive from match data or hide until data is available.
- `MatchDetailSubComponents.tsx`: Fix `MomentumChart` goal marker logic to use real `match_events` data.
- `ScheduleTab.tsx`: Fix `localDateKey` to use `date-fns` `formatInTimeZone` or `startOfDay` in the user's timezone.
- `ScoreCard.tsx`: Hide possession bar if no real possession data exists.
- `usePrefetchMatch.ts`: Import `fetchLineups` only from `@/api/matches` and delete the duplicate.

**Acceptance:** Match detail shows real data or gracefully omits unavailable metrics; schedule grouping is timezone-safe.

### Chunk 5.2 — Stadium Reviews & Ratings
**Files:** `src/pages/stadiums/StadiumDetailPage.tsx`, `src/components/stadiums/ReviewForm.tsx`, `src/components/stadiums/StadiumCard.tsx`, `src/components/stadiums/StadiumHero.tsx`, `src/hooks/useStadium.ts`

**Changes:**
- `ReviewForm.tsx`: Compute and submit `overall_rating` as the average of the 4 scores. After Phase 2 SQL is applied, this becomes redundant (generated column).
- `StadiumDetailPage.tsx`: After submit, invalidate query so `avg_*` columns refresh.
- `StadiumCard.tsx`: Set `fetchPriority="low"` for all cards; only hero images get `high`.
- `StadiumHero.tsx`: Memoize `slides` with `useMemo(stadiums, [stadiums])` and guard the image warmer with an `isFirstRender` ref.
- `useStadium.ts`: Rename `fetchStadiumById(slug)` to `fetchStadiumBySlug` for clarity.

**Acceptance:** Reviews show star ratings; card images don't compete with hero for bandwidth; no unnecessary image re-warming.

### Chunk 5.3 — Games Hub Fixes
**Files:** `src/pages/games/GamesPage.tsx`, `src/components/games/MiniLeagueTab.tsx`, `src/components/games/OracleTab.tsx`, `src/components/games/TriviaTab.tsx`, `src/components/games/DuelTab.tsx`, `src/api/miniLeague.ts`, `src/api/oracle.ts`, `src/api/oracleVotes.ts`, `src/api/trivia.ts`, `src/api/games.ts`

**Changes:**
- `MiniLeagueTab.tsx`: Add `LIMIT` and server-side aggregation to the leaderboard query. Avoid fetching all predictions.
- `OracleTab.tsx`: On Phase 2 SQL applied, switch to `upsert` with `onConflict: 'user_id,question'`.
- `TriviaTab.tsx`: Persist session score to `localStorage` so navigating away and back preserves progress.
- `GamesPage.tsx`: Wire up the existing `BracketTab.tsx` (import and render it in the Bracket tab slot instead of a placeholder).
- `DuelTab.tsx`: Add accept/reject UI: when `status='pending'` and the opponent views their Games page, show an incoming challenge card with Accept/Reject buttons. Use realtime or polling.

**Acceptance:** Leaderboard loads quickly; Oracle prevents double votes (with SQL); Trivia score persists; Bracket tab shows real bracket; FanDuel has an accept/reject flow.

---

## Phase 6: Missing Features & Polish

**Goal:** Implement all referenced-but-missing pages and features. Add React.memo, debounce scroll, and mobile sidebar fixes.

### Chunk 6.1 — Missing Pages
**Files:** (new) `src/pages/profile/DiscoverPage.tsx`, `src/pages/profile/MessagesPage.tsx`, `src/pages/fanzone/TribeDetailPage.tsx`, `src/router/index.tsx`

**Changes:**
- `DiscoverPage.tsx`: Show a searchable list of all users (excluding self) with "Add Friend" buttons.
- `MessagesPage.tsx`: Show a simple DM list + thread view using Supabase Realtime on a `direct_messages` table. Document the `direct_messages` table schema in `SUPABASE.md`.
- `TribeDetailPage.tsx`: Show tribe info, members list, member count, total points, and a post feed filtered by tribe.
- `router/index.tsx`: Add routes `/discover`, `/messages`, `/tribes/:tribeId`. Ensure `LanguageToggle` is imported and placed in `TopBar.tsx`.

**Acceptance:** All new routes render without errors; navigation from Profile/FanZone works.

### Chunk 6.2 — Service Worker & Push Notifications
**Files:** (new) `public/sw.js`, `src/lib/pushNotifications.ts`, `src/main.tsx`

**Changes:**
- Create `public/sw.js` that registers for push events and shows notifications.
- `pushNotifications.ts`: Register the service worker on app init. Handle subscription flow.
- `main.tsx`: Call push registration on mount (gated by user preference).

**Acceptance:** Push notification flow works end-to-end (subscribe → receive → display).

### Chunk 6.3 — Performance Polish
**Files:** `src/components/layout/TopBar.tsx`, `src/components/layout/BottomNav.tsx`, `src/pages/fanzone/FanZonePage.tsx`

**Changes:**
- `TopBar.tsx`: Debounce scroll handler with `requestAnimationFrame` or a 100ms throttle. Wrap in `React.memo`.
- `BottomNav.tsx`: Wrap in `React.memo`.
- `FanZonePage.tsx`: Ensure `WatchPartiesSidebar` and `TribesSidebar` collapse gracefully on mobile (hide or stack cleanly).

**Acceptance:** Scroll is smooth; TopBar/BottomNav don't cause layout thrash; mobile layout is usable.

---

## Verification Checklist

After all phases:

- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm run build` → success, main chunk < 500 KB
- [ ] `SUPABASE.md` exists with runnable SQL for triggers, constraints, RLS, RPCs
- [ ] Auth flow works (login, signup, forgot password, reset password)
- [ ] FanZone feed shows posts, likes update instantly, comments work, pagination loads more
- [ ] "Following" filter shows only friends' posts
- [ ] Tribes join button works per-tribe, member count updates
- [ ] Watch parties use realtime chat, no duplicate messages, no duplicate party names
- [ ] Stadium reviews show `overall_rating` stars; avg ratings update after submission
- [ ] Match detail shows real data or omits unavailable metrics
- [ ] Games hub: leaderboard loads fast, oracle votes deduplicated, trivia score persists, bracket renders, duels accept/reject
- [ ] Missing pages work: `/discover`, `/messages`, `/tribes/:tribeId`
- [ ] Profile page loads without jank; edit profile avatar uploads correctly
- [ ] Push notifications service worker registered
- [ ] Language toggle visible in TopBar
- [ ] Mobile layout is functional
