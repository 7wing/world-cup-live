# Routing and Page Structure Summary

## Current Route List
- `/` (index) → MatchesPage
- `/login` → LoginPage (lazy)
- `/signup` → SignupPage (lazy)
- `/forgot-password` → ForgotPasswordPage (lazy)
- `/reset-password` → ResetPasswordPage (lazy)
- `/check-email` → CheckEmailPage (lazy)
- `/matches` → MatchesPage
- `/matches/brackets` → BracketTab
- `/matches/:matchId` → MatchDetailPage (lazy)
- `/fan-zone` → FanZonePage (lazy)
- `/fan-zone/watch-party/:partyId` → WatchPartyPage
- `/fan-zone/tribes` → TribesPage
- `/games` → GamesPage (lazy)
- `/stadiums` → StadiumsPage
- `/stadiums/:stadiumId` → StadiumDetailPage (lazy)
- `/profile/:userId` → ProfilePage (lazy)
- `/profile/:userId/friends` → FriendsPage
- `*` → NotFound

## Lazy-loaded Pages
- LoginPage
- SignupPage
- ForgotPasswordPage
- CheckEmailPage
- ResetPasswordPage
- MatchDetailPage
- FanZonePage
- GamesPage
- StadiumDetailPage
- ProfilePage

## Missing Routes Referenced in UI but Not Implemented
None identified from TopBar and BottomNav - all navigation links correspond to defined routes.

## Auth Routing Setup
- Uses `ProtectedRoute` component from `src/router/ProtectedRoute.tsx`
- Protected routes are not yet applied in the router (all routes currently public)
- Protection logic: redirects to `/login` when no user, shows spinner during loading
- Auth state managed via `useAuthStore` from Zustand

## Service Worker Status
- Exists at `public/sw.js`
- Implements push notifications with background sync
- Not registered in `src/main.tsx` (commented instructions present)
- Handles notification clicks and push subscription changes

## LanguageToggle Status
- Component exists at `src/components/ui/LanguageToggle.tsx`
- Not currently imported/used anywhere in the codebase
- Comments indicate it should be added to `TopBar.tsx` next to profile avatar
- Supports locale switching via i18next with visual indicators

