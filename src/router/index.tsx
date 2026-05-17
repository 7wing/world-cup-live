// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { LoginPage } from '@/pages/Login'
import { SignupPage } from '@/pages/Signup'
import { MatchesPage } from '@/pages/matches/MatchesPage'
import { MatchDetailPage } from '@/pages/matches/MatchDetailPage'
import { BracketsPage } from '@/pages/matches/BracketsPage'
import { FanZonePage } from '@/pages/fanzone/FanZonePage'
import { GamesPage } from '@/pages/fanzone/GamesPage'
import { TribesPage } from '@/pages/fanzone/TribesPage'
import { StadiumsPage } from '@/pages/stadiums/StadiumsPage'
import { StadiumDetailPage } from '@/pages/stadiums/StadiumDetailPage'
import { PassportPage } from '@/pages/passport/PassportPage'
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
      { path: 'matches', element: <MatchesPage /> },
      { path: 'matches/brackets', element: <BracketsPage /> },
      { path: 'matches/:matchId', element: <MatchDetailPage /> },
      { path: 'fan-zone', element: <FanZonePage /> },
      { path: 'fan-zone/games', element: <GamesPage /> },
      { path: 'fan-zone/tribes', element: <TribesPage /> },
      { path: 'stadiums', element: <StadiumsPage /> },
      { path: 'stadiums/:stadiumId', element: <StadiumDetailPage /> },
      { path: 'passport', element: <PassportPage /> },
      { path: 'profile/:userId', element: <ProfilePage /> },
      { path: 'profile/:userId/friends', element: <FriendsPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])