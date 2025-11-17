import { useState, useEffect } from "react";
import AppHeader from "../components/AppHeader";
import Board, { type Bet } from "../components/Board";
import ActiveBets from "../components/ActiveBets";
import RouletteWheel from "../components/RouletteWheel";
import "./Roulette.css";

export interface PlacedBet extends Bet {
  id: number;
}

function Roulette() {
  const [balance, setBalance] = useState(0);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [betIdCounter, setBetIdCounter] = useState(0);
  const [spinInProgress, setSpinInProgress] = useState(false);

  const currentBetTotal = bets.reduce((sum, bet) => sum + bet.amount, 0);

  useEffect(() => {
    const jwtToken = sessionStorage.getItem("jwtToken");
    if (!jwtToken) return;

    const fetchBalance = async () => {
      try {
        const res = await fetch("http://167.172.30.196:5000/api/getcredits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwtToken }),
        });

        if (!res.ok) return;

        const data = await res.json();
        setBalance(data.credits);
      } catch {
        return;
      }
    };

    fetchBalance();
  }, []);

  const handlePlaceBet = (bet: Bet) => {
    if (spinInProgress || bet.amount > balance) return;
    setBalance(prev => prev - bet.amount);
    setBets(prev => [...prev, { ...bet, id: betIdCounter }]);
    setBetIdCounter(prev => prev + 1);
  };

  const handleClearBets = () => {
    if (spinInProgress) return;
    setBalance(prev => prev + currentBetTotal);
    setBets([]);
  };

  const handleRemoveBet = (id: number) => {
    if (spinInProgress) return;
    const betToRemove = bets.find(b => b.id === id);
    if (betToRemove) {
      setBalance(prev => prev + betToRemove.amount);
      setBets(bets.filter(bet => bet.id !== id));
    }
  };

  const evaluateBets = (winningNumber: number, bets: PlacedBet[]) => {
    const redNumbers = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    let totalPayout = 0;
    for (const bet of bets) {
      const { type, value, amount } = bet;
      switch (type) {
        case "straight":
          if (winningNumber === value) totalPayout += amount * 35;
          break;
        case "color":
          if ((value === "red" && redNumbers.has(winningNumber)) ||
              (value === "black" && winningNumber !== 0 && !redNumbers.has(winningNumber))) {
            totalPayout += amount * 2;
          }
          break;
        case "evenOdd":
          if (winningNumber !== 0) {
            if ((value === "even" && winningNumber % 2 === 0) ||
                (value === "odd" && winningNumber % 2 !== 0)) totalPayout += amount * 2;
          }
          break;
        case "range":
          const [min, max] = (value as string).split("-").map(Number);
          if (winningNumber >= min && winningNumber <= max) totalPayout += amount * 2;
          break;
      }
    }
    return totalPayout;
  };

  const handleSpinEnd = (number: number) => {
    setWinningNumber(number);
    const payout = evaluateBets(number, bets);
    setBalance(prev => prev + payout);
    setBets([]);
    setSpinInProgress(false);
  };

  return (
    <div>
      <AppHeader />
      <div id="roulette-content">
        <div className="roulette-main-row">
          <div className="roulette-left">
            <div className="roulette-page-section">
              <h2 className="header-row">Wheel</h2>
              <div className="row">
                <RouletteWheel
                  onSpinEnd={handleSpinEnd}
                  onSpinStart={() => setSpinInProgress(true)}
                />
                {winningNumber !== null && (
                  <div className="winning-number">
                    Winning Number: {winningNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="roulette-right">
            <div className="roulette-page-section">
              <h2 className="header-row">Current Bets</h2>
              <div className="row">
                <ActiveBets bets={bets} onRemoveBet={handleRemoveBet} />
              </div>
            </div>
          </div>
        </div>
        <div className="roulette-board-section">
          <div className="roulette-page-section">
            <h2 className="header-row">Betting Board</h2>
            <div className="row">
              <Board
                balance={balance}
                currentBet={currentBetTotal}
                onPlaceBet={handlePlaceBet}
                onClearBets={handleClearBets}
                disabled={spinInProgress}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Roulette;





