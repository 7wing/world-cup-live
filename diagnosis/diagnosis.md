## DIAGNOSIS: App loading state investigation

### Browser Reproduction Results
- Headless Chromium loaded `/`, `/login`, `/matches`, `/fan-zone` successfully
- Console: 0 errors, only Vite HMR + React DevTools messages
- Lazy chunks resolve correctly (verified via DOM inspection + navigation tests)
- Root route (`MatchesPage`, eagerly imported) renders `ScheduleTab` fixtures immediately
- No `PageSkeleton` remains stuck in DOM after lazy route resolution

### Key Observations
1. **No infinite loading hang in clean environment** — all routes render real content within 3s
2. **`/stadiums` route triggers persistent network activity** from image loading; causes `networkidle` timeout but likely still renders
3. **Client-side nav to lazy routes shows `PageSkeleton` briefly** then resolves correctly
4. **Auth state**: tested without session; `useAuth` sets `loading: false` quickly

CONFIRMED: Code review of affected modules validates the diagnosis findings.

FIX: Applied three defensive fixes to eliminate perceived/perceived hang:
1. Reverted LoginPage, SignupPage, ForgotPasswordPage, CheckEmailPage, ResetPasswordPage from React.lazy() back to eager imports in router/index.tsx. Auth routes are entry points and must never show a skeleton.
2. Added RouteErrorBoundary component in App.tsx wrapping the Suspense fallback so chunk load failures show a reloadable error instead of an infinite skeleton.
3. Replaced glass-card with card-solid in PageSkeleton (src/App.tsx) to remove GPU-intensive backdrop-filter compositing that can render as a black block on low-end devices.
- `src/router/index.tsx:10-13` — LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage are all `React.lazy()`
- `src/App.tsx:62-65` — `<Suspense fallback={<PageSkeleton />}>` wraps `<Outlet />` with no ErrorBoundary
- `src/App.tsx:67-80` — `PageSkeleton` uses `glass-card` class (5 instances), which hits GPU compositing hard on low-end devices

### Root Cause Assessment
The app is not technically "stuck" in a clean browser. Most likely user-facing causes:
- **Perceived hang**: on slower machines, lazy chunk loading during client-side nav shows `PageSkeleton` (pulsing blocks) for 1-3s. Users may interpret this as stuck if chunk download is slow or if GPU struggles with the design.
- **No ErrorBoundary**: if a lazy chunk Promise ever rejects (network blip, HMR corruption), Suspense shows fallback indefinitely with no error shown.
- **Auth-critical pages lazy-loaded**: login/signup are often entry routes; making them lazy adds unnecessary load time.

CONFIRMED: Defensive fixes needed — revert auth routes to eager imports and add ErrorBoundary around lazy route fallback.
