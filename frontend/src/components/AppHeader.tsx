import "./AppHeader.css"

import ActiveUsername from "./ActiveUsername";
import {useLocation, Link } from "react-router-dom";

function AppHeader()
{

    function doLogout(event:any) : void
    {
        event.preventDefault();
        
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };    

    const location = useLocation()

    return (
        <div id="app-header">
            <header id="roulette-header">
                <ActiveUsername />
                <div id="header-actions">
                    
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
    )
}

export default AppHeader;