import React, {useState} from "react";

import "./Board.css"

export interface Bet {
    type: string;
    value: number | string;
    amount: number;
}

interface BoardProps {
    balance: number;
    currentBet: number;
    onPlaceBet: (bet: Bet) => void;
    onClearBets: () => void;
    disabled: boolean;
}


const Board: React.FC<BoardProps> = ({balance, currentBet, onPlaceBet, onClearBets, disabled}) => {
    const [chipValue, setChipValue] = useState(1);

    const numbers = Array.from({length: 36}, (_, i) => i + 1);

    const getNumberColor = (num : number): string => 
    {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
        return redNumbers.includes(num) ? 'red' : 'black'
    }

    const handleNumberClick = (num: number) => 
    {
        if (disabled || chipValue > balance) return;
        onPlaceBet({ type: 'straight', value: num, amount: chipValue });
    };

    const handleColorClick = (color: string) => {
        if (disabled || chipValue > balance) return;
        onPlaceBet({ type: 'color', value: color, amount: chipValue})
    }

    const handleEvenOddClick = (range: string) => {
        if (disabled || chipValue > balance) return;
        onPlaceBet({ type: 'evenOdd', value: range, amount: chipValue})
    }

    const handleRangeClick = (range: string) => {
        if (disabled || chipValue > balance) return;
        onPlaceBet({ type: 'range', value: range, amount: chipValue})
    }

    return (
        <div id="board">

            <div id="board-subheader">

                <div id="chip-selecter">
                    {[1, 5, 25, 100, 500, 1000].map(value => (
                        <button
                        key={value}
                        className={`chip ${chipValue === value ? "selected": ''}`}
                        onClick={() => setChipValue(value)}
                        disabled={disabled}
                        style={{backgroundColor: `var(--chip-${value}-color)`}}
                        >
                            ¤{value}
                        </button>
                    ))}
                </div>
                <div id="board-bet-info-area">
                    <div className="board-bet-info">
                        Balance:
                        ¤{balance}
                    </div>
                    <div className="board-bet-info">
                        Current Bet:
                        ¤{currentBet}
                    </div>
                </div>
            </div>

            <div id="betting-area">

                <div id="inside-bets">
                    <button
                        key="0"
                        id="zero-button"
                        className="bet-button number-button"
                        onClick={() => handleNumberClick(0)}
                        disabled={disabled}
                    >
                        0
                    </button>

                    {numbers.map(num => (
                        <button
                            key={num}
                            className={`bet-button number-button ${getNumberColor(num)}-bet-button`}
                            onClick={() => handleNumberClick(num)}
                            disabled={disabled}
                        >
                            {num}
                        </button>
                    ))}                    
                </div>
                
                <div id="outside-bets">
                    <div></div>
                    <button
                        className="bet-button outside-bet-button"
                        onClick={() => handleRangeClick('1-18')}
                        disabled={disabled}
                    >1-18</button>
                    <button
                        className="bet-button outside-bet-button"
                        onClick={() => handleEvenOddClick('even')}
                        disabled={disabled}
                    >EVEN</button>
                    <button
                        className="bet-button outside-bet-button red-bet-button"
                        onClick={() => handleColorClick('red')}
                        disabled={disabled}
                    >RED</button>
                    <button
                        className="bet-button outside-bet-button"
                        onClick={() => handleColorClick('black')}
                        disabled={disabled}
                    >BLACK</button>
                    <button
                        className="bet-button outside-bet-button"
                        onClick={() => handleEvenOddClick('odd')}
                        disabled={disabled}
                    >ODD</button>
                    <button
                        className="bet-button outside-bet-button"
                        onClick={() => handleRangeClick('19-36')}
                        disabled={disabled}
                    >19-36</button>
                </div>

                <button
                    id="clear-bets-button"
                    className="bet-button"
                    onClick={onClearBets}
                    disabled={disabled || currentBet === 0}
                >
                    Clear Bets
                </button>

            </div>





        </div>
    )
}

export default Board;