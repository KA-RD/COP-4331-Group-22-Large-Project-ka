import "./AppHeader.css"

import ActiveUsername from "./ActiveUsername";
import Logout from "./Logout"
import { Link } from "react-router-dom";


function AppHeader()
{
    return (
        <div id="app-header">
            <header id="roulette-header">
                <ActiveUsername />
                <div id="header-actions">
                  <div id="leaderboard-div">
                    <Link to="/leaderboard">
                      <input type="button" id="leaderboard-button" value="Leaderboard" />
                    </Link>
                  </div>
                  <Logout />
                </div>
            </header>
        </div>
    )
}

export default AppHeader;