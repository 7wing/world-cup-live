// src/router/index.tsx
import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { MatchesPage } from '@/pages/matches/MatchesPage'
import { LoginPage } from '@/pages/Login'
import { SignupPage } from '@/pages/Signup'
import { ForgotPasswordPage } from '@/pages/ForgotPassword'
import { CheckEmailPage } from '@/pages/CheckEmail'
import { ResetPasswordPage } from '@/pages/ResetPassword'
import { BracketTab } from '@/components/matches/BracketTab'
import { StadiumsPage } from '@/pages/stadiums/StadiumsPage'
import { TribesPage } from '@/pages/fanzone/TribesPage'
import { WatchPartyPage } from '@/pages/fanzone/WatchPartyPage'
import { FriendsPage } from '@/pages/profile/FriendsPage'
import { NotFound } from '@/pages/NotFound'

/* ── Lazy-loaded heavy pages ─────────────────────────────────────────────── */
/* Named exports must be wrapped via .then(m => ({ default: m.Name }))
   because React.lazy only reads the module's default export.            */

// Auth pages are eagerly imported so login/signup/reset never show a skeleton.

// eslint-disable-next-line react-refresh/only-export-components
const MatchDetailPage     = React.lazy(() => import('@/pages/matches/MatchDetailPage').then(m => ({ default: m.MatchDetailPage })))
// eslint-disable-next-line react-refresh/only-export-components
const FanZonePage         = React.lazy(() => import('@/pages/fanzone/FanZonePage').then(m => ({ default: m.FanZonePage })))
// eslint-disable-next-line react-refresh/only-export-components
const GamesPage           = React.lazy(() => import('@/pages/games/GamesPage').then(m => ({ default: m.GamesPage })))
// eslint-disable-next-line react-refresh/only-export-components
const StadiumDetailPage   = React.lazy(() => import('@/pages/stadiums/StadiumDetailPage').then(m => ({ default: m.StadiumDetailPage })))
// eslint-disable-next-line react-refresh/only-export-components
const ProfilePage         = React.lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
// eslint-disable-next-line react-refresh/only-export-components
const DiscoverPage        = React.lazy(() => import('@/pages/profile/DiscoverPage').then(m => ({ default: m.DiscoverPage })))
// eslint-disable-next-line react-refresh/only-export-components
const MessagesPage        = React.lazy(() => import('@/pages/profile/MessagesPage').then(m => ({ default: m.MessagesPage })))
// eslint-disable-next-line react-refresh/only-export-components
const TribeDetailPage     = React.lazy(() => import('@/pages/fanzone/TribeDetailPage').then(m => ({ default: m.TribeDetailPage })))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <MatchesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'check-email', element: <CheckEmailPage  /> },
      { path: 'matches', element: <MatchesPage /> },
      { path: 'matches/brackets', element: <BracketTab /> },
      { path: 'matches/:matchId', element: <MatchDetailPage /> },
      { path: 'fan-zone', element: <FanZonePage /> },
      { path: 'fan-zone/watch-party/:partyId', element: <WatchPartyPage /> },
      { path: 'fan-zone/tribes', element: <TribesPage /> },
      { path: 'games', element: <GamesPage /> },          
      { path: 'stadiums', element: <StadiumsPage /> },
      { path: 'stadiums/:stadiumId', element: <StadiumDetailPage /> },
      { path: 'profile/:userId', element: <ProfilePage /> },
      { path: 'profile/:userId/friends', element: <FriendsPage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'messages/:userId', element: <MessagesPage /> },
      { path: 'tribes/:tribeId', element: <TribeDetailPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])