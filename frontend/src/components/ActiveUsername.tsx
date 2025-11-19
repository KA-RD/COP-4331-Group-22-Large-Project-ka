import { useState, useEffect } from "react";

function ActiveUsername()
{
    const [username, setUsername] = useState('')

    useEffect(() => {
        const userData = localStorage.getItem("user_data")
        if (userData)
        {
            const user = JSON.parse(userData)
            setUsername(user.firstName + ' ' + user.lastName)
        }
    }, []);

    return(
      <div id="username-div">
        <span id="user-name">{username}</span>
      </div>
    );
};

export default ActiveUsername;