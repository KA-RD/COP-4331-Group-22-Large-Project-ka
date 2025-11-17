import "./AppHeader.css"
import { useState } from "react";
import ActiveUsername from "./ActiveUsername";
import {useLocation, Link } from "react-router-dom";
import AddFunds from "./AddFunds";

interface AppHeaderProps {
  setBalance: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ setBalance }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation()

    function doLogout(event:any) : void
    {
        event.preventDefault();
        
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };    


    return (
        <>
            <div id="app-header">
                <header id="roulette-header">
                    <ActiveUsername />
                    <div id="header-actions">

                        {location.pathname === '/roulette' && (
                            <div className="header-button-div">
                                <input 
                                    type="button" 
                                    className="header-button" 
                                    value="Add Funds" 
                                    onClick={() => setIsModalOpen(true)} 
                                    />
                            </div>
                        )}
                        
                        {location.pathname !== '/leaderboard' && (
                            <div className="header-button-div">
                                <Link to="/leaderboard">
                                    <input type="button" className="header-button" value="Leaderboard" />
                                </Link>
                            </div>
                        )}
                        
                        {location.pathname !== '/roulette' && (
                            <div className="header-button-div">
                                <Link to="/roulette">
                                    <input type="button" className="header-button" value="Roulette" />
                                </Link>
                            </div>
                        )}

                        <div className="header-button-div">
                            <input type="submit" className="header-button" value = "Log Out" onClick={doLogout} /><br />
                        </div>
                    </div>
                </header>
            </div>

            <AddFunds 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                setBalance={setBalance}
            />
        </>

    )
}

export default AppHeader;