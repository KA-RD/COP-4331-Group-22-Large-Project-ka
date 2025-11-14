import './Logout.css'

function Logout()
{
    function doLogout(event:any) : void
    {
        event.preventDefault();
        
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };    

    return(
        <div id="logout-div">
            <input type="submit" id="logout-button" value = "Log Out" onClick={doLogout} /><br />
        </div>
    );
};

export default Logout;
