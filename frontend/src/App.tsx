import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import Roulette from './pages/Roulette';

function App() {
  const jwtToken =
    sessionStorage.getItem("jwtToken") || localStorage.getItem("jwtToken") || "";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cards" element={<CardPage />} />
        <Route path="/roulette" element={<Roulette jwtToken={jwtToken} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
