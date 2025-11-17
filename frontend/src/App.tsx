import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
// import GamePage from './pages/Game';
import RoulettePage from './pages/Roulette';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        {/* <Route path="/game" element={<GamePage />} /> */}
        <Route path="/roulette" element={<RoulettePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
