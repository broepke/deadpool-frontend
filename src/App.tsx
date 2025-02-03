import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PlayersPage from './features/players/PlayersPage';
import PicksPage from './features/picks/PicksPage';
import PickCountsPage from './features/picks/PickCountsPage';
import LeaderboardPage from './features/leaderboard/LeaderboardPage';
import DraftPage from './features/draft/DraftPage';
import ProfilePage from './features/profile/ProfilePage';
import PeoplePage from './features/people/PeoplePage';
import AuthGuard from './features/auth/AuthGuard';
import { AnalyticsProvider } from './services/analytics/provider';

function App() {
  return (
    <Router>
      <AnalyticsProvider>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/draft" replace />} />
              <Route path="players" element={<PlayersPage />} />
              <Route path="picks" element={<PicksPage />} />
              <Route path="picks/counts" element={<PickCountsPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="draft" element={<DraftPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="people" element={<PeoplePage />} />
              <Route path="*" element={<Navigate to="/draft" replace />} />
            </Route>
          </Route>
        </Routes>
      </AnalyticsProvider>
    </Router>
  );
}

export default App;
