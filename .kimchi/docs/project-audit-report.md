# World Cup Live — Project Audit Report

> Date: 2026-06-10
> Scope: Code Quality, Security, Performance, Architecture
> Method: ESLint (29 rules), TypeScript build, Vite bundle analysis, manual source review

---

## Executive Summary

| Category | Critical | High | Warning | Info |
|----------|----------|------|---------|------|
| **Security** | 1 | 1 | 0 | 4 |
| **Code Quality** | 0 | 23 | 8 | 3 |
| **Performance** | 0 | 1 | 1 | 3 |
| **Architecture** | 0 | 0 | 2 | 6 |
| **Total** | **1** | **25** | **11** | **13** |

**Total issues: 50**

### Most Urgent Actions

1. **Rotate all API keys in `.env` immediately** — the file contains real, active keys and may have been committed in the past. Keys must be treated as compromised.
2. **Fix 23 ESLint errors** — several indicate real runtime bugs (cascading renders, impure render calls).
3. **Move server-side keys out of the client bundle** — Gemini and Football Data keys are visible in the browser bundle.
4. **Convert 16 stadium images from JPEG to WebP** — they total ~46 MB and are served uncompressed.

---

## 1. Security

### 1.1 Real API Keys on Disk — CRITICAL

**File:** `.env`

The `.env` file is **not currently tracked** in git (confirmed: `git ls-files .env` returns empty). However, it exists on disk with real, active API keys:

```
FOOTBALL_DATA_API_KEY=34ee8ca2469e4518ab609e845dd6bd04
VITE_GOOGLE_GEMINI_API_KEY=AIzaSyAfJaMZE69t9Hha5H09yzn4qSlTv7qU468
VITE_SUPABASE_URL=<real Supabase URL>
VITE_SUPABASE_ANON_KEY=<real anon key>
```

- If `.env` was ever committed and later removed from tracking, the keys are still in git history.
- The file existing on disk poses risk of accidental future commits.

**Immediate actions:**
1. Rotate all keys at their provider dashboards (football-data.org, Google AI Studio, Supabase).
2. Run `git log --all --oneline -- .env` to check if it was ever committed and identify affected commits.
3. If committed in the past, use `git filter-repo` or BFG Repo-Cleaner to purge history, then force-push.
4. Run `git rm --cached .env && git commit -m "Remove .env from tracking"` to ensure it never re-appears.
5. Create `.env.example` with placeholder values for onboarding.
6. Add a pre-commit hook (e.g., `detect-secrets`, `git-secrets`) to block future commits containing API-key-like strings.

---

### 1.2 Server-Side Keys Bundled in Client — HIGH

**Files:** `.env`, `vite.config.ts`, built `dist/assets/index-*.js`

`FOOTBALL_DATA_API_KEY` and `VITE_GOOGLE_GEMINI_API_KEY` are prefixed with `VITE_` (or referenced via `process.env` in seed scripts), meaning they are bundled into the client-side JavaScript at build time.

- Both keys appear verbatim in the built `dist/` assets.
- Anyone can open DevTools → Network or Sources to extract these keys.
- `VITE_SUPABASE_ANON_KEY` is expected to be public (designed for public use with RLS enforcement).

**Recommendation:** Create Supabase Edge Functions to proxy calls to Gemini and Football Data. Move these keys to the Edge Function environment (`GEMINI_API_KEY`, `FOOTBALL_DATA_API_KEY`) so the client never receives them.

---

### 1.3 Seed Scripts with Secrets in `src/` — LOW

**Files:** `src/lib/server/seedPlayers.ts` (line 69), `src/lib/server/seedMatches.ts` (line 259)

Both scripts use `process.env.FOOTBALL_DATA_API_KEY` directly. These are Node.js scripts run via `npx tsx` and are not bundled into the browser client, so there is no runtime exposure. However, keeping secrets in `src/` risks accidental client-bundle inclusion if a future refactor adds an import.

**Recommendation:** Move seed scripts to a `scripts/` directory outside `src/`. Add a CI check to ensure no `process.env` references exist in non-server files.

---

### 1.4 Supabase Auth — OK (Informational)

- `src/lib/supabase.ts` uses `createClient(url, anonKey)` — no service-role key exposure.
- Auth is handled by Supabase client; no plaintext passwords.
- RLS appears to be the intended enforcement layer.

---

### 1.5 Edge Functions — OK (Informational)

- `supabase/functions/notify/index.ts` — uses `SUPABASE_SERVICE_ROLE_KEY` and VAPID keys via `Deno.env.get()`. Correct.
- `supabase/functions/generate-trivia/index.ts` — uses `GEMINI_API_KEY` via `Deno.env.get()`. Correct.
- No hardcoded secrets in Edge Functions.

---

## 2. Code Quality

### 2.1 ESLint Errors — 23 total (all HIGH severity)

These errors cause real runtime issues and block a clean build.

#### `react-hooks/set-state-in-effect` — 6 errors

Calling `setState` synchronously inside `useEffect` causes cascading re-renders and should be replaced with lazy initializers or `useMemo`.

| File | Line |
|------|------|
| `src/components/layout/TopBar.tsx` | 33 |
| `src/components/matches/ScorePredictor.tsx` | 23 |
| `src/components/profile/SettingsModal.tsx` | 20 |
| `src/pages/ResetPassword.tsx` | 26 |
| `src/pages/fanzone/FantasyPage.tsx` | 91 |
| `src/pages/games/GamesPage.tsx` | 138 |

**Fix:** Move the initial state computation into `useState`'s lazy initializer or use `useMemo`.

#### `react-hooks/purity` — 2 errors

Calling impure functions during render produces unpredictable re-renders.

| File | Line |
|------|------|
| `src/components/fanzone/WatchPartiesSidebar.tsx` | 66 |
| `src/pages/fanzone/WatchPartyPage.tsx` | 78 |

Both call `Date.now()` directly in the render body.

**Fix:** Move to `useMemo` or `useState` lazy initializer.

#### `react-refresh/only-export-components` — 10 errors

**File:** `src/router/index.tsx` (lines 17–26)

The router file exports both a `router` object and page components. Fast refresh only works when a file exports components.

**Fix:** Move page component imports to separate files or add HOCs to the `extraHOCs` ESLint config option.

#### `@typescript-eslint/no-explicit-any` — 3 errors

| File | Line |
|------|------|
| `src/hooks/useRealtime.ts` | 17 |
| `src/lib/server/seedPlayers.ts` | 126 |
| `src/pages/matches/MatchDetailPage.tsx` | 88 |

**Fix:** Define typed interfaces for the unknown payloads.

#### Unused variable and import — 2 errors

| File | Line | Issue |
|------|------|-------|
| `src/api/trivia.ts` | 34 | `rows` assigned but never used |
| `src/router/index.tsx` | 2 | `Suspense` imported but never used |

---

### 2.2 ESLint Warnings — 8 total

All are `react-hooks/exhaustive-deps` warnings indicating potentially stale closures:

| File | Line | Missing dependency |
|------|------|---------------------|
| `src/components/fanzone/LiveChatPanel.tsx` | 22 | `setMessages` |
| `src/components/fanzone/LiveChatPanel.tsx` | 26 | Complex expression in dep array |
| `src/components/matches/ScorePredictor.tsx` | 26 | `existing` |
| `src/hooks/useAuth.ts` | 37 | `setLoading`, `setSession`, `setUser` |
| `src/hooks/useRealtime.ts` | 27 | `addMessage`, `updateMatch` |
| `src/pages/games/GamesPage.tsx` | 66 | `liveMatch` |
| `src/pages/games/GamesPage.tsx` | 139 | `saved` |
| `src/pages/games/GamesPage.tsx` | 139 | Complex expression (`saved.map((p) => p.id).join(',')`) |

**Fix:** Add missing dependencies or extract complex expressions to named variables.

---

### 2.3 Console Logging — 32 calls (Warning)

Production code contains 32 `console.error/warn` calls across the client bundle:

| File | Count |
|------|-------|
| `src/api/trivia.ts` | 3 |
| `src/api/profile.ts` | 3 |
| `src/api/games.ts` | 6 |
| `src/lib/fantasyStorage.ts` | 4 |
| `src/lib/pushNotifications.ts` | 5 |
| `src/lib/matchAlerts.ts` | 1 |
| `src/api/oracle.ts`, `oracleVotes.ts`, `miniLeague.ts`, `stadiums.ts` | 4 |
| `src/pages/ForgotPassword.tsx`, `src/components/fanzone/PostComposer.tsx`, `WatchPartiesSidebar.tsx`, `src/hooks/useAuth.ts` | 4 |
| `src/lib/utils.ts` | 2 |

**Recommendation:** Replace with a structured logger that can be stubbed or silenced in production (e.g., integrate Sentry for error-level logs).

---

### 2.4 TypeScript Anti-Patterns — 1 instance

| File | Line | Pattern |
|------|------|---------|
| `src/hooks/useRealtime.ts` | 17 | `payload.new as any` — no `as unknown as T` safety |

No `@ts-ignore` or `@ts-expect-error` found — good hygiene overall.

---

### 2.5 Commented-Out Dead Code — ~15 blocks (Warning)

| File | Notes |
|------|-------|
| `src/types/index.ts` | Multiple commented-out type definitions |
| `src/components/stadiums/StadiumHero.tsx` | Commented-out file header and inline logic |
| `src/components/stadiums/VenueHero.tsx`, `StadiumCard.tsx`, `ReviewForm.tsx` | Commented-out file headers and usage notes |
| `src/components/ui/LanguageToggle.tsx`, `TranslateButton.tsx` | Commented-out file headers |

**Recommendation:** Remove dead commented code. Use version control to retrieve old code if needed.

---

### 2.6 Oversized Files — 11 files > 300 lines (Warning)

| File | Lines |
|------|-------|
| `src/pages/stadiums/StadiumDetailPage.tsx` | 581 |
| `src/pages/games/GamesPage.tsx` | 573 |
| `src/pages/profile/ProfilePage.tsx` | 556 |
| `src/pages/matches/MatchDetailPage.tsx` | 525 |
| `src/components/matches/MatchDetailSubComponents.tsx` | 514 |
| `src/lib/supabase.ts` | 452 |
| `src/pages/fanzone/FantasyPage.tsx` | 419 |
| `src/components/fanzone/WatchPartiesSidebar.tsx` | 382 |
| `src/api/fanzone.ts` | 378 |
| `src/components/matches/HeatmapPitch.tsx` | 339 |
| `src/components/matches/BracketTab.tsx` | 316 |

---

## 3. Performance

### 3.1 Bundle Size — 934 KB main chunk (Warning)

**Evidence:**
```
dist/assets/index-BU3NcHRt.js   933.99 kB   gzip: 256.74 kB
(!) Some chunks are larger than 500 kB after minification.
```

The initial bundle is nearly double the 500 KB threshold. Lazy-loaded chunks are well-sized (19–41 KB each).

**Recommendation:** Add `manualChunks` to `vite.config.ts` to split vendor libraries (React, TanStack Query, Supabase, date-fns) into a separate cacheable chunk. Use `vite-bundle-visualizer` to identify specific bloat.

---

### 3.2 Stadium Images — ~46 MB across 16 files (Warning)

All stadium images are uncompressed JPEGs between 321 KB and 5.6 MB:

| File | Size |
|------|------|
| `src/assets/stadiums/hard-rock.jpg` | 5.6 MB |
| `src/assets/stadiums/lumen.jpg` | 5.2 MB |
| `src/assets/stadiums/nrg.jpg` | 4.7 MB |
| `src/assets/stadiums/att.jpg` | 4.0 MB |
| `src/assets/stadiums/levis.jpg` | 3.6 MB |
| `src/assets/stadiums/gillette.jpg` | 3.0 MB |
| `src/assets/stadiums/bbva.jpg` | 3.0 MB |
| `src/assets/stadiums/bmo.jpg` | 2.7 MB |
| `src/assets/stadiums/metlife.jpg` | 2.6 MB |
| `src/assets/stadiums/azteca.jpg` | 2.6 MB |
| `src/assets/stadiums/akron.jpg` | 2.6 MB |
| `src/assets/stadiums/sofi.jpg` | 2.0 MB |
| `src/assets/stadiums/mercedes-benz.jpg` | 1.9 MB |
| `src/assets/stadiums/bc-place.jpg` | 1.7 MB |
| `src/assets/stadiums/lincoln.jpg` | 1.3 MB |
| `src/assets/stadiums/arrowhead.jpg` | 321 KB |

**Recommendation:**
- Convert all to WebP (typically 25–35% smaller at equivalent quality).
- Serve responsive images with `srcset` for mobile devices.
- Add `loading="lazy"` to images outside the initial viewport.
- Target < 500 KB per image as a guideline.

---

### 3.3 Lazy Loading — Good (Info)

- 7 heavy pages are wrapped in `React.lazy()`: `MatchDetailPage`, `FanZonePage`, `GamesPage`, `StadiumDetailPage`, `ProfilePage`, and auth pages.
- TanStack Query prefetches `stadiums` and `matches` on app load — good proactive loading.

---

### 3.4 Memoization — Zero React.memo Usage (Warning)

**Confirmed:** `grep -rn "React\.memo" src/components/` returns no results.

Components that would benefit from `React.memo`:
- `TopBar.tsx` — re-renders on every route change, accesses multiple stores
- `BottomNav.tsx` — mobile navigation, stable props
- `MatchDetailSubComponents.tsx` — contains multiple heavy sub-components

**Recommendation:** Wrap `TopBar` and `BottomNav` with `React.memo`. Use `useCallback` for event handlers passed to memoized children.

---

## 4. Architecture

### 4.1 API / Hook Separation — Excellent (Info)

The codebase follows a clean separation:
- `src/api/*.ts` — single source of truth for all Supabase queries
- `src/hooks/*.ts` — import from API modules, never duplicate logic
- Example: `src/hooks/useMatches.ts` imports from `src/api/matches.ts`

This pattern is applied consistently across all domains (matches, stadiums, fanzone, profile, games).

---

### 4.2 Data Fetching — Well-Designed (Info)

- React Query (TanStack Query) is used consistently for server state.
- Batch queries exist (e.g., `usePredictionsForMatches` fetches all predictions in a single query).
- No N+1 query anti-patterns observed.
- Realtime subscriptions in `useRealtime.ts` have proper cleanup (`supabase.removeChannel`).

---

### 4.3 State Management — Zustand Well-Applied (Info)

Global state uses Zustand stores (`authStore`, `settingsStore`) accessed directly by components. No prop drilling observed — components access stores directly rather than passing state through intermediaries.

Example from `TopBar.tsx`:
```typescript
const { user } = useAuthStore()
const setSettingsOpen = useSettingsStore((s) => s.setOpen)
```

---

### 4.4 Folder Organization — Feature-Based (Info)

The structure is clear and maintainable:
```
src/
  api/           # Supabase query functions
  components/
    layout/      # TopBar, BottomNav, PageWrapper
    matches/     # Match-detail components
    stadiums/    # Stadium components
    fanzone/     # FanZone components
    games/       # Game/duel components
    profile/     # Profile components
    ui/          # Shared primitives
  hooks/         # Custom React hooks
  pages/         # Route-level page components
  store/         # Zustand state stores
  types/         # TypeScript type definitions
  lib/           # Utilities and server-side scripts
```

**Note:** `src/lib/supabase.ts` mixes client initialization (452 lines) with Database type definitions. The types should be extracted to `src/types/database.ts` for better separation.

---

### 4.5 Component Size — 11 Oversized Files (Warning)

See Section 2.6 for the full list.

**Recommendation:** Extract tab/panel sub-components into separate files. Example for `GamesPage.tsx` (573 lines): extract `PredictionsTab`, `DuelTab`, `FantasyTab`, and `TriviaTab` into `src/components/games/tabs/`.

---

### 4.6 Auth Architecture — Supabase-Based (Info)

- `src/hooks/useAuth.ts` and `src/store/authStore.ts` use Supabase Auth.
- Session is managed by the Supabase client; no manual JWT handling.
- Auth callbacks are handled in `AuthCallback.tsx`.

---

## 5. Prioritized Recommendations

### Immediate (this week)

| # | Action | Category | Files |
|---|--------|----------|-------|
| 1 | Rotate all `.env` API keys at provider dashboards (Football Data, Google AI, Supabase) | Security | `.env` |
| 2 | Audit git history for `.env` commits (`git log --all -- .env`) and purge history if found | Security | `.git` |
| 3 | Fix `react-hooks/set-state-in-effect` and `react-hooks/purity` (8 errors) — cause cascading renders | Code Quality | `TopBar.tsx`, `ScorePredictor.tsx`, `SettingsModal.tsx`, `ResetPassword.tsx`, `FantasyPage.tsx`, `GamesPage.tsx`, `WatchPartiesSidebar.tsx`, `WatchPartyPage.tsx` |
| 4 | Fix `react-refresh/only-export-components` (10 errors) in router — breaks Fast Refresh | Code Quality | `src/router/index.tsx` |
| 5 | Untrack `.env` (`git rm --cached .env`) and create `.env.example` | Security | `.env` |

### Short-term (next sprint)

| # | Action | Category | Files |
|---|--------|----------|-------|
| 6 | Route Gemini and Football Data calls through Supabase Edge Functions; remove keys from `VITE_` prefix | Security | `.env`, `supabase/functions/` |
| 7 | Fix remaining ESLint errors (`@typescript-eslint/no-explicit-any`, unused vars, 2 files) | Code Quality | `useRealtime.ts`, `trivia.ts`, `seedPlayers.ts`, `MatchDetailPage.tsx` |
| 8 | Fix 8 `react-hooks/exhaustive-deps` warnings to prevent stale closure bugs | Code Quality | `LiveChatPanel.tsx`, `ScorePredictor.tsx`, `useAuth.ts`, `useRealtime.ts`, `GamesPage.tsx` |
| 9 | Add `manualChunks` to `vite.config.ts` to split vendor code (React, TanStack, Supabase) from app code | Performance | `vite.config.ts` |
| 10 | Convert 16 stadium JPEGs to WebP and add `loading="lazy"` + `srcset` | Performance | `src/assets/stadiums/` |
| 11 | Add `React.memo` to `TopBar` and `BottomNav` | Performance | `src/components/layout/` |
| 12 | Add pre-commit CI hook (`detect-secrets` or `git-secrets`) to block API-key-like strings | Security | `.git/hooks/`, CI config |

### Medium-term (backlog)

| # | Action | Category | Files |
|---|--------|----------|-------|
| 13 | Replace all `console.*` calls in `src/` with a structured logger or Sentry | Code Quality | `src/api/`, `src/lib/`, `src/hooks/`, `src/components/` |
| 14 | Remove commented-out dead code (~15 blocks) | Code Quality | `src/types/`, `src/components/stadiums/`, `src/components/ui/` |
| 15 | Split 11 oversized files (>300 lines) into co-located sub-components | Architecture | See Section 2.6 |
| 16 | Extract Database type definitions from `supabase.ts` into `src/types/database.ts` | Architecture | `src/lib/supabase.ts` |
| 17 | Move seed scripts (`seedPlayers.ts`, `seedMatches.ts`) to `scripts/` directory | Security | `src/lib/server/` |
| 18 | Add CI check to fail builds containing `VITE_GOOGLE_GEMINI_API_KEY` or `FOOTBALL_DATA_API_KEY` patterns outside of `.env` | Security | CI config |

---

## Issue Counts by Severity

| Severity | Count | Description |
|----------|-------|-------------|
| **CRITICAL** | 1 | `.env` with real, active API keys on disk (may be in git history) |
| **HIGH** | 25 | 23 ESLint errors + 2 security issues (server-side keys in client bundle + seed scripts in `src/`) |
| **Warning** | 11 | 8 ESLint warnings + bundle size + stadium images |
| **Info** | 13 | Architecture and best-practice observations |
| **Total** | **50** | |

---

*Report synthesized from: `audit-code-quality.md`, `audit-security.md`, `audit-perf-arch.md`*
*Generated by Ferment audit process — 2026-06-10*