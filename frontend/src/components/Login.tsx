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

type PageState = 'login' | 'signup' | 'reset' | 'verify'

function Login()
{
    const navigate = useNavigate();
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = React.useState('');
    const [loginPassword,setPassword] = React.useState('');
    const [userFirstName, setFirstName] = React.useState('');
    const [userLastName, setLastName] = React.useState('');
    const [userEmail, setEmail] = React.useState('');

    // const [isLogin, setIsLogin] = useState(true);

    const [pageState, setPageState] = useState<PageState>('login');

    function clearMessage() {
        setMessage('');
    }

    function clearFields() {
        setLoginName('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setEmail('');
        // setVerificationCode('');
        // setMessage('');
    }

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

                
                if (res.error === 'Please verify your email before logging in') {
                    setPageState('verify')
                }

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
            
            sessionStorage.setItem('jwtToken', accessToken);
            
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
            if (res.error && res.error !== '') {
                setMessage(res.error);
                return;
            }

            // show registration sucess
            setMessage(res.message);
            setPageState('verify')
            // clearFields()

        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }    
    }

    async function sendResetEmail(event:any) : Promise<void> {
        event.preventDefault();

        var obj = {
            email:userEmail
        };
        var js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(buildPath('api/forgot-password'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
    
            if (!response.ok) {
                throw new Error('Registration failed, Try again later')
            }

            // var res = JSON.parse(await response.text());
            var res = await response.json();

            // check if api returned an error
            if (res.error && res.error !== '') {
                setMessage(res.error);
                return;
            }

            // show registration sucess
            setMessage(res.message);
            clearFields()
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }

    }

    async function sendVerifyEmail(event:any) : Promise<void> {
        event.preventDefault();

        var obj = {
            email:userEmail
        };
        var js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(buildPath('api/resend-verification'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
    
            if (!response.ok) {
                throw new Error('Registration failed, Try again later')
            }

            // var res = JSON.parse(await response.text());
            var res = await response.json();

            // check if api returned an error
            if (res.error && res.error !== '') {
                setMessage(res.error);
                return;
            }

            // show registration sucess
            setMessage(res.message);
            clearFields()

            
            // setTimeout(() => {
            // setPageState('login');
            // }, 1000);

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
            {pageState === 'login' && (
                <>
                <h3 id="inner-title">Login</h3>
                <span id="loginResult">{message}</span>
                <input className='auth-field' type="text" id="loginName" placeholder="Username" value={loginName} onChange={handleSetLoginName} />
                <input className='auth-field' type="password" id="loginPassword" placeholder="Password" value={loginPassword} onChange={handleSetPassword} />
                <p id='forgot-password-toggle'>
                    <a  className='link' onClick={() => { clearFields(); setPageState('reset'); }}>
                        Forgot Password?
                    </a>
                </p>
                <input type="submit" id="loginButton" className="signup-buttons" value = "Login" onClick={doLogin} />
                <p className='login-toggle'>
                    Don't have an account? &nbsp;
                    <a className='login-toggle-link link' onClick={() => {clearFields(); clearMessage(); setPageState('signup')}}>Register</a>
                </p>
                </>
            )}

            {pageState === 'signup' && (
                <>
                <h3 id="inner-title">Register</h3>
                <span id="loginResult">{message}</span>
                <input className='auth-field' type='text' id='signupFirstName' placeholder='First Name' value={userFirstName} onChange={handleSetFirstName} />
                <input className='auth-field' type='text' id='signupLastName' placeholder='Last Name' value={userLastName} onChange={handleSetLastName} />
                <input className='auth-field' type='email' id='signupEmail' placeholder='Email' value={userEmail} onChange={handleSetEmail} />
                <input className='auth-field' type="text" id="signupName" placeholder="Username" value={loginName} onChange={handleSetLoginName} />
                <input className='auth-field' type="password" id="signupPassword" placeholder="Password" value={loginPassword} onChange={handleSetPassword} />
                <input type="submit" id="signupButton" className="signup-buttons" value = "Register" onClick={doRegister} />
                <p className='login-toggle'>
                    Already have an account? &nbsp;
                    <a className='login-toggle-link link' onClick={() => {clearFields(); clearMessage(); setPageState('login')}}>Login</a>
                </p>
                </>
            )}

            {pageState === 'reset' && (
                <>
                <h3 id="inner-title">Reset Password</h3>
                <p id='reset-password-description'>
                    To reset your password, enter your email to recieve a reset link
                </p>
                <span className="result">{message}</span>
                <input
                    className='auth-field'
                    type='email'
                    placeholder='Email'
                    value={userEmail}
                    onChange={handleSetEmail}
                />
                <input
                    type='submit'
                    id='reset-button'
                    className='signup-buttons'
                    value='Send Reset Email'
                    onClick={sendResetEmail}
                />
                <p className='login-toggle'>
                    <a className='login-toggle-link link' onClick={() => {clearFields(); clearMessage(); setPageState('login')}}>Back to Login</a>
                </p>
                </>
            )}

            {pageState === 'verify' && (
                <>
                <h3 id="inner-title">Verify Your Email</h3>
                <p id='verify-email-description'>
                    Please check your email and click the verification link to activate your account.
                </p>
                <input
                    type='submit'
                    id='resend-button'
                    className='signup-buttons'
                    value='Resend Email'
                    onClick={sendVerifyEmail}
                />
                <p className='login-toggle'>
                    <a className='login-toggle-link link' onClick={() => {clearFields(); clearMessage(); setPageState('login')}}>Back to Login</a>
                </p>
                </>
            )}

        </div>
    );
};

export default Login;
