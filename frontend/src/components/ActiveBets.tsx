import React from "react";

import {type PlacedBet} from "../pages/Roulette"

import "./ActiveBets.css"

interface ActiveBetsProps {
    bets: PlacedBet[];
    onRemoveBet: (id: number) => void;
}

const ActiveBets: React.FC<ActiveBetsProps> = ({ bets, onRemoveBet }) => {

    return (
        <div id="active-bets">
            <ul>
            {bets.map(bet => (
                <li 
                    key={bet.id} 
                    style={{borderLeft: `3px solid var(--chip-${bet.amount}-color)`}}
                    onClick={() => onRemoveBet(bet.id)}
                >
                ¤{bet.amount} on {bet.value} ({bet.type})
                </li>
            ))}
            </ul>
        </div>
    )

};

export default ActiveBets