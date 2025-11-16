import { useState } from "react";

import AppHeader from "../components/AppHeader";
import Board, { type Bet } from "../components/Board";
import ActiveBets from "../components/ActiveBets";
import RouletteWheel from "../components/RouletteWheel";

import "./Roulette.css";

export interface PlacedBet extends Bet {
  id: number;
}

function Roulette() {
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [betIdCounter, setBetIdCounter] = useState(0);

  const currentBetTotal = bets.reduce((sum, bet) => sum + bet.amount, 0);

  const handlePlaceBet = (bet: Bet) => {
    if (bet.amount > balance) {
      // Insufficient balance
      return;
    }

    setBalance((prev) => prev - bet.amount);
    setBets((prev) => [...prev, { ...bet, id: betIdCounter }]);
    setBetIdCounter((prev) => prev + 1);
  };

  const handleClearBets = () => {
    setBalance((prev) => prev + currentBetTotal);
    setBets([]);
  };

  const handleRemoveBet = (id: number) => {
    const betToRemove = bets.find((b) => b.id === id);

    if (betToRemove) {
      setBalance(balance + betToRemove.amount);
      setBets(bets.filter((bet) => bet.id !== id));
    }
  };

  const handleSpinEnd = (number: number) => {
    setWinningNumber(number);
  };

  return (
    <div>
      <AppHeader />
      <div id="roulette-content">
        {/* Wheel Section */}
        <div className="roulette-page-section">
          <h2 className="header-row">Wheel</h2>
          <div className="row">
            <RouletteWheel onSpinEnd={handleSpinEnd} />
            {winningNumber !== null && (
              <div className="winning-number">
                Winning Number: {winningNumber}
              </div>
            )}
          </div>
        </div>

        {/* Betting Board Section */}
        <div className="roulette-page-section">
          <h2 className="header-row">Betting Board</h2>
          <div className="row">
            <Board
              balance={balance}
              currentBet={currentBetTotal}
              onPlaceBet={handlePlaceBet}
              onClearBets={handleClearBets}
              disabled={false}
            />
          </div>
        </div>

        {/* Current Bets Section */}
        <div className="roulette-page-section">
          <h2 className="header-row">Current Bets</h2>
          <div className="row">
            <ActiveBets bets={bets} onRemoveBet={handleRemoveBet} />
          </div>
        </div>

        {/* Optional Sidebar */}
        <h2>Sidebar Leaderboard</h2>
      </div>
    </div>
  );
}

export default Roulette;
