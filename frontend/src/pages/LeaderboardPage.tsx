import AppHeader from "../components/AppHeader";
import Leaderboard from "../components/Leaderboard";
import "../components/Leaderboard.css";

export default function LeaderboardPage() {
  return (
    <div>
      <AppHeader setBalance={() => {return}}/>
      <div style={{ padding: 20 }}>
        <Leaderboard />
      </div>
    </div>
  );
}
