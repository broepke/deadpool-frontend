import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PlayersPage from './features/players/PlayersPage';
import PicksPage from './features/picks/PicksPage';
import LeaderboardPage from './features/leaderboard/LeaderboardPage';
import DraftPage from './features/draft/DraftPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/leaderboard" replace />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="picks" element={<PicksPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="draft" element={<DraftPage />} />
          <Route path="*" element={<Navigate to="/leaderboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
