// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { LoginPage } from '@/pages/Login'
import { SignupPage } from '@/pages/Signup'
import { ForgotPasswordPage } from '@/pages/ForgotPassword'
import { ResetPasswordPage } from '@/pages/ResetPassword'
import { MatchesPage } from '@/pages/matches/MatchesPage'
import { MatchDetailPage } from '@/pages/matches/MatchDetailPage'
import { BracketTab } from '@/components/matches/BracketTab'
import { FanZonePage } from '@/pages/fanzone/FanZonePage'
import { GamesPage } from '@/pages/fanzone/GamesPage'
import { TribesPage } from '@/pages/fanzone/TribesPage'
import { StadiumsPage } from '@/pages/stadiums/StadiumsPage'
import { StadiumDetailPage } from '@/pages/stadiums/StadiumDetailPage'
import { WatchPartyPage } from '@/pages/fanzone/WatchPartyPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { FriendsPage } from '@/pages/profile/FriendsPage'
import { NotFound } from '@/pages/NotFound'

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