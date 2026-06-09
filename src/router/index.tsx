// src/router/index.tsx
import React, { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { MatchesPage } from '@/pages/matches/MatchesPage'
import { BracketTab } from '@/components/matches/BracketTab'
import { StadiumsPage } from '@/pages/stadiums/StadiumsPage'
import { TribesPage } from '@/pages/fanzone/TribesPage'
import { WatchPartyPage } from '@/pages/fanzone/WatchPartyPage'
import { FriendsPage } from '@/pages/profile/FriendsPage'
import { NotFound } from '@/pages/NotFound'

/* ── Lazy-loaded heavy pages ─────────────────────────────────────────────── */
/* Named exports must be wrapped via .then(m => ({ default: m.Name }))
   because React.lazy only reads the module's default export.            */

const LoginPage           = React.lazy(() => import('@/pages/Login').then(m => ({ default: m.LoginPage })))
const SignupPage          = React.lazy(() => import('@/pages/Signup').then(m => ({ default: m.SignupPage })))
const ForgotPasswordPage  = React.lazy(() => import('@/pages/ForgotPassword').then(m => ({ default: m.ForgotPasswordPage })))
const CheckEmailPage      = React.lazy(() => import('@/pages/CheckEmail').then(m => ({ default: m.CheckEmailPage })))
const ResetPasswordPage   = React.lazy(() => import('@/pages/ResetPassword').then(m => ({ default: m.ResetPasswordPage })))
const MatchDetailPage     = React.lazy(() => import('@/pages/matches/MatchDetailPage').then(m => ({ default: m.MatchDetailPage })))
const FanZonePage         = React.lazy(() => import('@/pages/fanzone/FanZonePage').then(m => ({ default: m.FanZonePage })))
const GamesPage           = React.lazy(() => import('@/pages/games/GamesPage').then(m => ({ default: m.GamesPage })))
const StadiumDetailPage   = React.lazy(() => import('@/pages/stadiums/StadiumDetailPage').then(m => ({ default: m.StadiumDetailPage })))
const ProfilePage         = React.lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))

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
      { path: '*', element: <NotFound /> },
    ],
  },
])