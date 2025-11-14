import {useState} from "react";

import AppHeader from "../components/AppHeader";
import Board, {type Bet} from "../components/Board"
import ActiveBets from "../components/ActiveBets";

import "./Roulette.css"

export interface PlacedBet extends Bet {
  id: number;
}

function Roulette()
{
    const [balance, setBalance] = useState(1000);
    const [bets, setBets] = useState<PlacedBet[]>([]);
    // const [spinning, setSpinning] = useState(false);
    // const [winningNumber, setWinningNumber] = useState<number | null>(null);
    // const [message, setMessage] = useState('');
    const [betIdCounter, setBetIdCounter] = useState(0);

    const currentBetTotal = bets.reduce((sum, bet) => sum + bet.amount, 0);

    const handlePlaceBet = (bet: Bet) => {
        if (bet.amount > balance) {
            // setMessage('Insufficient balance!');
            return;
        }
    
        setBalance(prev => prev - bet.amount);
        setBets(prev => [...prev, { ...bet, id: betIdCounter }]);
        setBetIdCounter(prev => prev + 1);
        // setMessage(`Bet placed: $${bet.amount} on ${bet.value}`);
    };
    
    const handleClearBets = () => {
        setBalance(prev => prev + currentBetTotal);
        setBets([]);
        // setMessage('All bets cleared');
    };

    const handleRemoveBet = (id: number) => {
        const betToRemove = bets.find(bet => bet.id === id);
        
        if (betToRemove) {
            setBalance(balance + betToRemove.amount);
            setBets(bets.filter(bet => bet.id !== id));
        }
    };

    return (
        <div>
            <AppHeader />
            <div id="roulette-content">

                <div className="roulette-page-section">
                    <h2 className="header-row">Bank</h2>
                    <div className="row">
                        
                    </div>
                </div>

                <div className="roulette-page-section">
                    <h2 className="header-row">Wheel</h2>
                    <div className="row">
                        
                    </div>
                </div>

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

                <div className="roulette-page-section">
                    <h2 className="header-row">Current Bets</h2>
                    <div className="row">
                        <ActiveBets bets={bets} onRemoveBet={handleRemoveBet}/>
                    </div>
                </div>

                <h2>Sidebar Leaderboard</h2>
            </div>
        </div>
    )
}

export default Roulette;