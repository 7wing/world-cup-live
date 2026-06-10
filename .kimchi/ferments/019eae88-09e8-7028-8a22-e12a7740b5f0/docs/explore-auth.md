# Auth & State Management Patterns

## How Auth State is Managed
- **Zustand Store** (`src/store/authStore.ts`): Manages `user`, `session`, and `loading` state with persistence via `zustand/persist`
- **Persistence Configuration**: Only `session` is persisted (via `partialize`), stored under key `wcl-auth`
- **Auth Subscription**: `src/hooks/useAuth.ts` uses `supabase.auth.onAuthStateChange()` to listen for auth changes
- **Profile Loading**: On auth state change, calls `ensureUserProfile()` to fetch/create user profile in DB
- **Loading State**: Tracks loading until both session AND profile are resolved

## Where `ensureUserProfile` is Called From
1. **`useAuth` hook** (`src/hooks/useAuth.ts`): Called automatically on any auth state change when session exists
2. **Login page** (`src/pages/Login.tsx`): Called manually after `signInWithPassword` to ensure profile before redirect

## Login/Signup/Reset Password Flow Patterns
### Login Flow (`Login.tsx`)
1. Call `supabase.auth.signInWithPassword()`
2. On success: 
   - Set session via `setSession()` from authStore
   - Call `ensureUserProfile()` to fetch/create DB profile
   - Set user via `setUser()` from authStore
   - Redirect to `/matches`

### Signup Flow (`Signup.tsx`)
1. Collect email/password + optional username
2. Call `supabase.auth.signUp()` 
3. On success: 
   - Set session/user manually (no auto redirect - waits for email verification)
   - Shows success message prompting email verification

### Password Reset Flow
- **Forgot Password** (`ForgotPassword.tsx`): 
  1. Checks if email exists via RPC `email_has_account` (to prevent email enumeration)
  2. If exists, calls `supabase.auth.resetPasswordForEmail()`
- **Reset Password** (`ResetPassword.tsx`):
  1. Reads `token_hash` and `type` from URL params
  2. Calls `supabase.auth.verifyOtp()` to validate token
  3. On success: prompts for new password, then calls `supabase.auth.updateUser()`

## Zustand Persist Configuration
- Found in `src/store/authStore.ts`
- Uses `persist` middleware from `zustand/middleware`
- Configuration: `{ name: 'wcl-auth', partialize: (s) => ({ session: s.session }) }`
- Only persists the `session` object (not user or loading state)
- Session is rehydrated on app startup

## Race Condition / Double-Fire Patterns Observed
- **Cancellation Flag**: `useAuth` hook uses `let cancelled = false` pattern to prevent state updates after cleanup
- **Early Return**: Checks `if (cancelled) return` at start of auth state change handler
- **Cleanup**: Unsubscribes from Supabase listener and sets `cancelled = true` on unmount
- **Conditional State Updates**: Multiple checks for `!cancelled` before calling `setUser()`/`setSession()`/`setLoading()`
- **Manual Calls**: Login page manually calls `ensureUserProfile()` (could potentially race with useAuth hook if timing overlaps, but appears sequential)
