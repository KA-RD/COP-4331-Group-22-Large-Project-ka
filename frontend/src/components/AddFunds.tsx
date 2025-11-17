// AddFunds.tsx
// import { useEffect } from 'react';
import './AddFunds.css';
import { buildPath } from './Path';

interface AddFundsProps {
  isOpen: boolean;
  onClose: () => void;
  setBalance: () => void;
}

const AddFunds: React.FC<AddFundsProps> = ({ isOpen, onClose, setBalance }) => {
    if (!isOpen) return null;
    
    const addFunds = (num: number) => {
        const jwtToken = sessionStorage.getItem("jwtToken");
        
        if (jwtToken) {
            try {
            fetch(buildPath('api/addcredits'), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credits: num, jwtToken }),
            });
            setTimeout(setBalance, 50);
            
            } catch (err) {
            console.error(err);
            }
        }
    }

    return (
        <div id="addfunds-overlay" onClick={onClose}>
            <div id="addfunds-content" onClick={(e) => e.stopPropagation()}>
                <div id="addfunds-header">
                    <h2>Add Funds</h2>
                <button id="addfunds-close" onClick={onClose}>
                    &times;
                </button>
                </div>
                <div id="addfunds-body">
                    <div id="addfunds-selecter">
                        {[1, 5, 25, 100, 500, 1000].map(value => (
                            <button
                            key={value}
                            className={`addfunds-button`}
                            onClick={() => addFunds(value)}
                            >
                                ¤{value}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFunds;