import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';
import VideoBackground from '../components/VideoBackground.tsx';

import './LoginPage.css'

const LoginPage = () =>
{

    return(
      <div>
        <VideoBackground />
        <div className='login-container vh-centered-div'>
          <PageTitle />
          <Login />
        </div>
      </div>
    );
};

export default LoginPage;