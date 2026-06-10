# Code Quality Audit

**Total: 31 problems (23 errors, 8 warnings)**

---

## 1. ESLint Errors (23)

### no-useless-assignment

| File | Line | Severity | Description |
|------|------|----------|-------------|
| `src/api/trivia.ts` | 34 | error | The value assigned to `rows` is not used in subsequent statements |

### react-hooks/purity

| File | Line | Severity | Description |
|------|------|----------|-------------|
| `src/components/fanzone/WatchPartiesSidebar.tsx` | 66 | error | Cannot call impure function `Date.now()` during render. Calling an impure function produces unstable results that update unpredictably when the component re-renders. |
| `src/pages/fanzone/WatchPartyPage.tsx` | 78 | error | Cannot call impure function `Date.now()` during render. Same issue as above. |

### react-hooks/set-state-in-effect

| File | Line | Severity | Description |
|------|------|----------|-------------|
| `src/components/layout/TopBar.tsx` | 33 | error | Calling `setState` synchronously within an effect can trigger cascading renders. Effects should synchronize React with external systems; calling setState in the effect body causes cascading renders that hurt performance. |
| `src/components/matches/ScorePredictor.tsx` | 23 | error | Calling `setState` synchronously within an effect (same pattern). |
| `src/components/profile/SettingsModal.tsx` | 20 | error | Calling `setState` synchronously within an effect (calling `loadMatchAlerts()` then `setAlerts`). |
| `src/pages/ResetPassword.tsx` | 26 | error | Calling `setState` synchronously within an effect (setting `linkError` inside effect body). |
| `src/pages/fanzone/FantasyPage.tsx` | 91 | error | Calling `setState` synchronously within an effect (setting `squad` from `existingSquad`). |
| `src/pages/games/GamesPage.tsx` | 138 | error | Calling `setState` synchronously within an effect (updating `scores` map from saved predictions). |

### @typescript-eslint/no-explicit-any

| File | Line | Severity | Description |
|------|------|----------|-------------|
| `src/hooks/useRealtime.ts` | 17 | error | Unexpected `any`. Specify a different type. |
| `src/lib/server/seedPlayers.ts` | 126 | error | Unexpected `any`. Specify a different type. |
| `src/pages/matches/MatchDetailPage.tsx` | 88 | error | Unexpected `any`. Specify a different type. |

### @typescript-eslint/no-unused-vars

| File | Line | Severity | Description |
|------|------|----------|-------------|
| `src/router/index.tsx` | 2 | error | `'Suspense'` is defined but never used. |

### react-refresh/only-export-components

| File | Lines | Severity | Description |
|------|-------|----------|-------------|
| `src/router/index.tsx` | 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 | error | Fast refresh only works when a file only exports components. Move components to a separate file. If all exports are HOCs, add them to the `extraHOCs` option. |

---

## 2. ESLint Warnings (8)

### react-hooks/exhaustive-deps

| File | Line | Severity | Description |
|------|------|----------|-------------|
| `src/components/fanzone/LiveChatPanel.tsx` | 22 | warning | Missing dependency: `setMessages`. Either include it or remove the dependency array. |
| `src/components/fanzone/LiveChatPanel.tsx` | 26 | warning | Complex expression in the dependency array. Extract it to a separate variable so it can be statically checked. |
| `src/components/matches/ScorePredictor.tsx` | 26 | warning | Missing dependency: `existing`. Either include it or remove the dependency array. |
| `src/hooks/useAuth.ts` | 37 | warning | Missing dependencies: `setLoading`, `setSession`, and `setUser`. Either include them or remove the dependency array. |
| `src/hooks/useRealtime.ts` | 27 | warning | Missing dependencies: `addMessage` and `updateMatch`. Either include them or remove the dependency array. |
| `src/pages/games/GamesPage.tsx` | 66 | warning | Missing dependency: `liveMatch`. Either include it or remove the dependency array. |
| `src/pages/games/GamesPage.tsx` | 139 | warning | Missing dependency: `saved`. Either include it or remove the dependency array. |
| `src/pages/games/GamesPage.tsx` | 139 | warning | Complex expression in the dependency array (`saved.map((p) => p.id).join(',')`). Extract it to a separate variable. |

---

## 3. Console Calls in src/ (excluding lib/server/)

| File | Call | Level | Notes |
|------|------|-------|-------|
| `src/components/fanzone/PostComposer.tsx` | `console.error('[PostComposer] upload error...` | warning | Error-level log in production code |
| `src/components/fanzone/WatchPartiesSidebar.tsx` | `console.error('[CreatePartyModal] error...` | warning | Error-level log in production code |
| `src/hooks/useAuth.ts` | `console.error('[useAuth] profile setup failed...` | warning | Error-level log in production code |
| `src/api/profile.ts` | `console.error('[fetchUserById] error...` | warning | Error-level log in API module |
| `src/api/profile.ts` | `console.error('[fetchFriends]', error.message)` | warning | Error-level log in API module |
| `src/api/profile.ts` | `console.error('[fetchUserPhotos]', error.message)` | warning | Error-level log in API module |
| `src/api/miniLeague.ts` | `console.error('[fetchMiniLeague]', error.message)` | warning | Error-level log in API module |
| `src/api/stadiums.ts` | `console.error('[fetchStadiums]', error.message, error.code)` | warning | Error-level log in API module |
| `src/api/games.ts` | `console.error('[fetchPotentialOpponents]', error.message)` | warning | Error-level log in API module |
| `src/api/games.ts` | `console.error('[fetchUserDuelStats]', error.message)` | warning | Error-level log in API module |
| `src/api/games.ts` | `console.error('[fetchRecentDuels]', error.message)` | warning | Error-level log in API module |
| `src/api/games.ts` | `console.error('[fetchActiveDuel]', error.message)` | warning | Error-level log in API module |
| `src/api/games.ts` | `console.error('[createDuelChallenge]', error.message)` | warning | Error-level log in API module |
| `src/api/oracle.ts` | `console.error('[fetchOraclePrediction]', error.message)` | warning | Error-level log in API module |
| `src/api/oracleVotes.ts` | `console.error('[fetchOracleVoteCounts]', error.message)` | warning | Error-level log in API module |
| `src/api/oracleVotes.ts` | `console.error('[castOracleVote]', error.message)` | warning | Error-level log in API module |
| `src/api/trivia.ts` | `console.warn('[triggerGeneration] failed silently...` | warning | Warn-level log in API module |
| `src/api/trivia.ts` | `console.error('[fetchTriviaQuestions]', error.message)` (x2) | warning | Error-level log in API module |
| `src/pages/ForgotPassword.tsx` | `console.warn('email_has_account RPC failed, skipping pre-check...` | warning | Warn-level log in page |
| `src/lib/matchAlerts.ts` | `console.error('[matchAlerts] Failed to sync to Supabase...` | warning | Error-level log in lib module |
| `src/lib/fantasyStorage.ts` | `console.error('[fantasyStorage] loadSquad...` | warning | Error-level log in storage module |
| `src/lib/fantasyStorage.ts` | `console.error('[fantasyStorage] loadPlayers...` | warning | Error-level log in storage module |
| `src/lib/fantasyStorage.ts` | `console.error('[fantasyStorage] listSquads...` | warning | Error-level log in storage module |
| `src/lib/fantasyStorage.ts` | `console.error('[fantasyStorage] saveSquad upsert...` | warning | Error-level log in storage module |
| `src/lib/fantasyStorage.ts` | `console.error('[fantasyStorage] saveSquad players...` | warning | Error-level log in storage module |
| `src/lib/pushNotifications.ts` | `console.warn('[pushNotifications] Push not supported in this browser.')` | warning | Warn-level log in lib module |
| `src/lib/pushNotifications.ts` | `console.error('[pushNotifications] VAPID public key is not configured.')` | warning | Error-level log in lib module |
| `src/lib/pushNotifications.ts` | `console.warn('[pushNotifications] Notification permission denied.')` | warning | Warn-level log in lib module |
| `src/lib/pushNotifications.ts` | `console.error('[pushNotifications] Failed to save subscription...` | warning | Error-level log in lib module |
| `src/lib/pushNotifications.ts` | `console.warn('[pushNotifications] Failed to remove subscription...` | warning | Warn-level log in lib module |

**Recommendation**: Replace `console.log/error/warn` calls with a structured logging utility (e.g., a custom logger with log levels, or integrate a service like Sentry for production error tracking).

---

## 4. TypeScript Issues

### `@ts-ignore` usage — none found

### `@ts-expect-error` usage — none found

### `as any` casts — 1 instance

| File | Line | Notes |
|------|------|-------|
| `src/hooks/useRealtime.ts` | 17 | `payload.new as any` — should have a typed interface instead of `any` |

### `: any` return types — none found

### `: unknown` usage — none found

---

## 5. TODO/FIXME and Commented-Out Code

### TODO/FIXME Comments — none found

### Commented-Out Code Blocks

| File | Notes |
|------|-------|
| `src/types/index.ts` | Multiple commented-out type definitions and comments (`// src/types/index.ts`, `// Raw DB row shape`, `// UI-facing shape...`) |
| `src/components/ui/LanguageToggle.tsx` | Commented-out file header and usage comment (`// Dropdown to switch locale...`) |
| `src/components/ui/TranslateButton.tsx` | Commented-out file header and usage note (`// Drop this onto any post...`) |
| `src/components/stadiums/VenueHero.tsx` | Commented-out file header |
| `src/components/stadiums/StadiumHero.tsx` | Commented-out file header and inline comments (`// Derived stats from live data`, `// Auto-advance...`, `// Warm all slide images...`) |
| `src/components/stadiums/StadiumCard.tsx` | Commented-out file header and fallback logic notes |
| `src/components/stadiums/ReviewForm.tsx` | Commented-out file header and inline comment (`// Pass both id and slug...`) |

**Recommendation**: Remove dead commented-out code to reduce noise. Use version control to retrieve old code if needed.

---

## 6. Unused Imports and Dead Code

### From ESLint (no-useless-assignment, no-unused-vars)

| File | Line | Issue |
|------|------|-------|
| `src/api/trivia.ts` | 34 | Variable `rows` assigned but never used |
| `src/router/index.tsx` | 2 | `Suspense` imported but never used |

---

## 7. Oversized Files (>300 lines)

| File | Lines | Notes |
|------|-------|-------|
| `src/pages/stadiums/StadiumDetailPage.tsx` | 581 | Page-level file — consider extracting sub-components |
| `src/pages/games/GamesPage.tsx` | 573 | Page-level file — consider extracting tab/panel components |
| `src/pages/profile/ProfilePage.tsx` | 556 | Page-level file — consider extracting sections |
| `src/pages/matches/MatchDetailPage.tsx` | 525 | Page-level file — consider extracting detail panels |
| `src/components/matches/MatchDetailSubComponents.tsx` | 514 | Component library file — consider splitting by feature |
| `src/lib/supabase.ts` | 452 | Utility file — consider splitting by domain (auth, storage, db) |
| `src/pages/fanzone/FantasyPage.tsx` | 419 | Page-level file — consider extracting roster/pick logic |
| `src/components/fanzone/WatchPartiesSidebar.tsx` | 382 | Sidebar component — consider extracting modal/panel sub-components |
| `src/api/fanzone.ts` | 378 | API module — consider splitting by resource (posts, reactions, etc.) |
| `src/components/matches/HeatmapPitch.tsx` | 339 | Visualization component — consider splitting canvas logic |
| `src/components/matches/BracketTab.tsx` | 316 | Tab component — consider extracting bracket rendering logic |

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| ESLint errors | 23 | High (blocks clean build) |
| ESLint warnings | 8 | Medium |
| Console.error/warn calls | 32 | Medium (production hygiene) |
| `as any` casts | 1 | Low-Medium |
| Commented-out code blocks | ~15 | Low |
| Oversized files (>300 lines) | 11 | Medium |
| Total issues | ~75 | — |

**Top priorities for remediation:**
1. Fix the 10 `react-hooks/set-state-in-effect` and `react-hooks/purity` errors — these indicate architectural issues with state management patterns
2. Fix the 10 `react-refresh/only-export-components` errors in `src/router/index.tsx` — these break fast refresh during development
3. Address the 8 `react-hooks/exhaustive-deps` warnings — these risk stale closure bugs
4. Remove the unused `Suspense` import and fix the `rows` variable assignment in `trivia.ts`
5. Replace `console.*` calls with a structured logger for production-grade observability