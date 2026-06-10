# Step 1: Auth Race Conditions — Fix Summary

## Files Modified

### 1. `src/store/authStore.ts`
- Removed `zustand/persist` middleware and `persist(...)` wrapper
- Session is now driven entirely by `onAuthStateChange` — no localStorage rehydration on load
- `loading: true` starts fresh on every page load; cleared after first auth event
- Fixes: flash of unauthenticated UI on refresh, `loading` blocking the app

### 2. `src/pages/Login.tsx`
- Removed `ensureUserProfile` import and call — login handler now only calls `signInWithPassword` then navigates
- Removed `useAuthStore` import and `setUser`/`setSession` calls
- `onAuthStateChange` in `useAuth` is the single source of truth for session + profile creation
- Fixes: double-fire of `ensureUserProfile` causing unique constraint violation (23505) race

### 3. `src/pages/Signup.tsx`
- Removed `useCallback` import (no longer needed)
- Removed `cn` import (no longer needed)
- Removed all username availability check logic: `checkUsername` function, `UsernameStatus` type, `usernameStatus`/`usernameSuggestions` state, `onBlur` handler, status indicator UI, suggestions UI
- Removed `usernameStatus === 'taken'` guard from submit handler
- Button `disabled` reduced to just `loading`
- Collisions handled server-side by `ensureUserProfile`'s upsert — no pre-flight check needed
- Fixes: TOCTOU race between availability check and signup commit

### 4. `src/pages/ForgotPassword.tsx`
- Removed `useNotificationStore` import and `push` call
- Removed `noAccount` state
- Removed `email_has_account` RPC call entirely
- `handleSubmit` now always calls `resetPasswordForEmail` and shows generic success message regardless of whether the email exists
- Fixes: RPC missing causing silent failure; removes email enumeration vector

### 5. `src/pages/ResetPassword.tsx`
- Removed `PASSWORD_RECOVERY` event listener fallback
- Removed 6-second timeout fallback
- Now uses only `token_hash` query param with `verifyOtp({ type: 'recovery', token_hash })`
- Hash fragment error check preserved
- Fixes: PKCE token consumed on first verify; page reload after success now shows clean error instead of 6s timeout

## Verification Results

| Check | Result |
|---|---|
| `npm run lint` | PASS (0 errors, 0 warnings) |
| `npx tsc --noEmit` | PASS (0 errors) |
| `grep -c 'ensureUserProfile' src/pages/Login.tsx` | 0 — PASS |
| `grep -c 'email_has_account' src/pages/ForgotPassword.tsx` | 0 — PASS |