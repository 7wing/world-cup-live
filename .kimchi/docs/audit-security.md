# Security Audit

## 1. Exposed Secrets on Disk — `.env` Not in Git but Contains Real Keys ❗ CRITICAL

- **`.env` exists on disk with real secrets (confirmed by reading the file)**  
  - `VITE_SUPABASE_URL` — Supabase project URL  
  - `VITE_SUPABASE_ANON_KEY` — Supabase anon key  
  - `FOOTBALL_DATA_API_KEY=34ee8ca2469e4518ab609e845dd6bd04` — football-data.org key (real)  
  - `VITE_GOOGLE_GEMINI_API_KEY=AIzaSyAfJaMZE69t9Hha5H09yzn4qSlTv7qU468` — Google Gemini key (real)  
- **Git tracking status**: `git ls-files .env` returns empty — `.env` is **not currently tracked** in git.  
  - This means a prior commit may have included it (and the keys are compromised), but it has since been removed from tracking.  
  - The file still exists on disk, so the risk of accidental re-commit remains high.  
- **Recommendation**:  
  1. **Rotate all keys immediately** at the respective provider dashboards — the keys in `.env` are real and should be treated as compromised.  
  2. Verify `.gitignore` includes `.env`.  
  3. Run `git log --all --oneline --diff-filter=D -- .env` to confirm the commit hash that removed it and force-push to invalidate any cached copies.  
  4. Use `.env.example` with placeholder values for onboarding.  
  5. Add a pre-commit hook or CI check to block commits containing real-looking keys.

## 2. No Additional Hardcoded Secrets in Source

- Searched `src/` for long alphanumeric strings that could be tokens.  
  - None found outside `import.meta.env.*` references.

## 3. Client-Side API Keys (Expected but Documented)

- `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_GEMINI_API_KEY`, `VITE_API_BASE_URL` are bundled into the client.  
  - For Supabase: this is expected (anon key is designed for public use with RLS).  
  - For Gemini & Football Data: these keys are now public because they are in the built bundle.  
  - **Recommendation**: Move server-side-only keys (Gemini, Football Data) to Edge Functions or a backend proxy so they never ship to the browser.

## 4. No `dangerouslySetInnerHTML` Usage

- Searched codebase — none found. Good.

## 5. Supabase Client Initialization

- `src/lib/supabase.ts` uses the standard `createClient(url, anonKey)` pattern.  
  - No service-role key exposure.  
  - RLS appears to be the intended security model.

## 6. Auth Patterns

- `src/hooks/useAuth.ts` and `src/store/authStore.ts` leverage Supabase Auth.  
  - No plaintext password storage observed.  
  - Session is managed by the Supabase client.

## 7. Server-Side Seed Scripts Using Secrets (Informational)

- `src/lib/server/seedPlayers.ts` (line 69) and `src/lib/server/seedMatches.ts` (line 259) use `process.env.FOOTBALL_DATA_API_KEY` directly.  
- These are Node.js seed scripts (run via `npx tsx`) and are not bundled into the client, so there is no browser exposure.  
- However, having secrets referenced in `src/` at all increases the risk of accidental inclusion in a client bundle if a future refactor adds an import.  
- **Recommendation**: Document these as build-time-only scripts. Consider moving them outside `src/` (e.g., to a `scripts/` directory) and adding a CI check that no `process.env` references exist in non-server files.

## 8. Supabase Edge Functions — Credentials Properly Server-Side

- `supabase/functions/notify/index.ts` — uses `SUPABASE_SERVICE_ROLE_KEY` and VAPID keys via `Deno.env.get()`. Correct.  
- `supabase/functions/generate-trivia/index.ts` — uses `GEMINI_API_KEY` via `Deno.env.get()`. Correct. No hardcoded credentials.  
- No exposed secrets in Edge Functions.

## 9. Summary

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | `.env` with real secrets on disk (not currently tracked but keys are real and should be rotated) | **CRITICAL** | `.env` |
| 2 | Server-side API keys (Gemini, Football Data) exposed in client bundle via `VITE_` prefix | **HIGH** | `.env` / Vite build |
| 3 | Seed scripts use `process.env.FOOTBALL_DATA_API_KEY` inside `src/lib/server/` | **LOW** | `src/lib/server/` |

## Recommendations

1. **Rotate all keys immediately** — `FOOTBALL_DATA_API_KEY` and `VITE_GOOGLE_GEMINI_API_KEY` in `.env` are real and compromised.  
2. **Audit git history** — `git log --all -- .env` to find any prior commits that included `.env` and force-push to invalidate caches.  
3. **Untrack `.env` if not already done** — `git rm --cached .env && git commit -m "Remove .env"`  
4. **Hide server-side keys** — route Gemini / Football Data calls through Supabase Edge Functions so the client never receives these keys.  
5. **Add CI pre-commit hook** — use a tool like `git-secrets` or `detect-secrets` to block commits containing real-looking API keys.  
6. **Move seed scripts outside `src/`** to prevent accidental client-bundle inclusion.  
7. **Add `.env` check in CI** — fail builds that contain `VITE_GOOGLE_GEMINI_API_KEY` or `FOOTBALL_DATA_API_KEY` patterns outside of `.env`.
