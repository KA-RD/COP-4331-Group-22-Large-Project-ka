import "./AppHeader.css"

import ActiveUsername from "./ActiveUsername";
import Logout from "./Logout"


function AppHeader()
{
    return (
        <div id="app-header">
            <header id="roulette-header">
                <ActiveUsername />
                <Logout />
            </header>
        </div>
    )
}

export default AppHeader;