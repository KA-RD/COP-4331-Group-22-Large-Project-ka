import React, { useState } from 'react';
import { buildPath } from './Path';
import { storeToken } from '../tokenStorage';
//import { jwtDecode } from 'jwt-decode';

import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode'; // Add 'type' keyword

import { useNavigate } from 'react-router-dom';

import './Login.css'

// Add this interface
interface CustomJwtPayload extends JwtPayload {
    userId: string;
    firstName: string;
    lastName: string;
}

function Login()
{
    const navigate = useNavigate();
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');
    const [userFirstName, setFirstName] = React.useState('');
    const [userLastName, setLastName] = React.useState('');
    const [userEmail, setEmail] = React.useState('');

    const [isLogin, setIsLogin] = useState(true);

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();

        var obj = {login:loginName,password:loginPassword};
        var js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(buildPath('api/login'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
            
            //var res = JSON.parse(await response.text());
            var res = await response.json();
            
            // check if api returned an error
            if (res.error && res.error !== '') {
                setMessage(res.error);
                return;
            }
            
            //Checks if login was successful (accessToken exists)
            if (!res.accessToken) {
                // No token means login failed
                setMessage('User/Password combination incorrect');
                return;
            }

            const { accessToken } = res;
            storeToken( accessToken );

            //Uses the custom type
            const decoded = jwtDecode<CustomJwtPayload>(accessToken);


        try
        {
          var ud = decoded;
          var userId = parseInt(ud.userId);
          var firstName = ud.firstName;
          var lastName = ud.lastName;

          if( userId <= 0 )
          {
            setMessage('User/Password combination incorrect');
          }
          else
          {
            var user = {firstName:firstName,lastName:lastName,id:userId}
            localStorage.setItem('user_data', JSON.stringify(user));
            
            setMessage('');
            navigate('/roulette');
          }
          }
          catch(e)
          {
            console.log( e );
            return;
          }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }    
    };

    async function doRegister(event:any) : Promise<void>
    {
        event.preventDefault();

        var obj = {
            firstname:userFirstName, 
            lastname:userLastName, 
            login:loginName, 
            password:loginPassword, 
            email:userEmail
        };
        var js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(buildPath('api/register'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
    
            if (!response.ok) {
                throw new Error('Registration failed, Try again later')
            }

            // var res = JSON.parse(await response.text());
            var res = await response.json();

            // check if api returned an error
            if (res.error !== '') {
                setMessage(res.error);
                return;
            }

            // show registration sucess
            setMessage(res.message);
            setFirstName('');
            setLastName('');
            setLoginName('');
            setPassword('');
            setEmail('');
            setIsLogin(true);

        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }    
    }

    function handleSetLoginName( e: any ) : void
    {
      setLoginName( e.target.value );
    }

    function handleSetPassword( e: any ) : void
    {
      setPassword( e.target.value );
    }

    function handleSetFirstName( e: any ) : void
    {
      setFirstName( e.target.value);
    }

    function handleSetLastName( e: any ) : void
    {
      setLastName( e.target.value);
    }

    function handleSetEmail( e: any ) : void
    {
      setEmail( e.target.value);
    }

    return(
      <div id="loginDiv">
        {isLogin ? (
          <>
          <h3 id="inner-title">Login</h3>
          <span id="loginResult">{message}</span>
          <input className='auth-field' type="text" id="loginName" placeholder="Username" value={loginName} onChange={handleSetLoginName} />
          <input className='auth-field' type="password" id="loginPassword" placeholder="Password" value={loginPassword} onChange={handleSetPassword} />
          <input type="submit" id="loginButton" className="signup-buttons" value = "Login" onClick={doLogin} />
          <p className='login-toggle'>
            Don't have an account? &nbsp;
            <a className='login-toggle-link' onClick={() => {
                setIsLogin(false);
                setLoginName('');
                setPassword('');
                setFirstName('');
                setLastName('');
                setEmail('');
                setMessage('');
            }}>Sign Up</a>
          </p>
          </>
        ) : (
          <>
          <h3 id="inner-title">Sign Up</h3>
          <span id="loginResult">{message}</span>
          <input className='auth-field' type='text' id='signupFirstName' placeholder='First Name' value={userFirstName} onChange={handleSetFirstName} />
          <input className='auth-field' type='text' id='signupLastName' placeholder='Last Name' value={userLastName} onChange={handleSetLastName} />
          <input className='auth-field' type='text' id='signupEmail' placeholder='Email' value={userEmail} onChange={handleSetEmail} />
          <input className='auth-field' type="text" id="signupName" placeholder="Username" value={loginName} onChange={handleSetLoginName} />
          <input className='auth-field' type="password" id="signupPassword" placeholder="Password" value={loginPassword} onChange={handleSetPassword} />
          <input type="submit" id="signupButton" className="signup-buttons" value = "Sign Up" onClick={doRegister} />
          <p className='login-toggle'>
            Already have an account? &nbsp;
            <a className='login-toggle-link' onClick={() => {
                setIsLogin(true);
                setLoginName('');
                setPassword('');
                setFirstName('');
                setLastName('');
                setEmail('');
                setMessage('');
            }}>Login</a>
          </p>
          </>
        )}
      </div>
    );
};

export default Login;
