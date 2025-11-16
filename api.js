require('express');
require('mongodb');

exports.setApp = function ( app, client )
{

	app.post('/api/addcredits', async (req, res, next) =>
    {
      // incoming: credits
      // outgoing: error
        
      const { credits, jwtToken } = req.body;
      var error = '';

      const token = require('./createJWT.js');

      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      try
      {
        // Decode the JWT to get user info
        const jwt = require('./createJWT.js');
        const decoded = jwt.verifyToken(jwtToken);
        const userId = decoded.userId;

        const db = client.db('COP4331Cards');
        const { ObjectId } = require('mongodb');

        const result = await db.collection('Users').updateOne({ _id: new ObjectId(userId) },
          { $inc: { Credits: parseInt(credits) } });
      }
      catch(e)
      {
        error = e.toString();
      }
    
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);
  });

  app.get('/api/leaderboard', async (req, res, next) => 
  {
    try {
      const db = client.db('COP4331Cards');
        
      const leaderboard = await db.collection('Users')
          .find({ 
            Credits: { $exists: true }
          })
          .sort({ Credits: -1 })
          .limit(10)
          .project({ 
              Login: 1,
              FirstName: 1,
             // LastName: 1,
              Credits: 1,
              _id: 0
            })
          .toArray();

      const rankedLeaderboard = leaderboard.map((user, index) => ({
          rank: index + 1,
          ...user
      }));

      res.status(200).json({
          error: '',
          leaderboard: rankedLeaderboard
      });
    } 

    catch(e) 
    {
      res.status(200).json({ 
          error: e.toString(),
          leaderboard: []
      });
    }
  });

	app.post('/api/login', async (req, res, next) => 
	{
	  // incoming: login, password
	  // outgoing: id, firstName, lastName, error
		
	 var error = '';

	  const { login, password } = req.body;

	  const db = client.db('COP4331Cards');
	  const results = await db.collection('Users').find({Login:login,Password:password}).toArray();

	  var id = -1;
	  var fn = '';
	  var ln = '';
    var status = '0';

	  var ret;

	  if( results.length > 0 )
	  {
		  id = results[0]._id.toString();
		  fn = results[0].FirstName;
		  ln = results[0].LastName;
      status = results[0].Status;

      //email check
      if( status !== '1' )
      {
        return res.status(200).json({ error: 'Please verify your email before logging in' });
      }

		  try
		  {
			  const token = require("./createJWT.js");
			  ret = token.createToken( fn, ln, id );
		  }
		  catch
		  {
			  ret = {error: e.message};
		  }
	  }
	  else
	  {
		  ret = {error: "Login/Password incorrect"};
	  }

	  res.status(200).json(ret);
	});

  //debugging purpose variables changed from "status = 0" and disabled email verification
  app.post('/api/register', async (req, res, next) => 
  {
    const { firstname, lastname, login, password, email } = req.body;
    const status = '1'; // Start as unverified
    const credits = 500;
    
    try {
        const db = client.db('COP4331Cards');
        
        // Check if email already exists
        const existingUser = await db.collection('Users').findOne({ $or: [{ Email: email }, { Login: login }] });
        
        if (existingUser) 
        {
          return res.status(200).json({ error: 'Email or username already exists' });
        }
        
        const newUser = { FirstName: firstname, LastName: lastname, Login: login, Password: password, Credits: credits, Status: status, Email: email, CreatedAt: new Date() };
        
        const result = await db.collection('Users').insertOne(newUser);
        const userId = result.insertedId.toString();
        
        // Send verification email
        /*
        const emailSent = await require('./emailVerification.js').sendVerificationEmail(email, firstname, userId);
        
        if (!emailSent) 
        {
          console.log('Failed to send verification email, but user was created');
        }
        */
        var ret = { 
            error: '', 
            message: 'Registration successful! Please check your email to verify your account.',
            id: userId,
            firstName: firstname,
            lastName: lastname,
            status: status
        };
        
        res.status(200).json(ret);
        
    } catch(e) {
        var ret = { error: e.toString() };
        res.status(200).json(ret);
    }
  });

  app.get('/api/verify-email', async (req, res, next) => {
    const { token } = req.query;
    
    //console.log('Verification token received');
    
    try {
        if (!token) 
        {
          return res.status(400).send('No token provided');
        }
        
        const jwt = require('./createJWT.js');
        const decoded = jwt.verifyToken(token);
        
       // console.log('Decoded token:', decoded);
        
        const userId = decoded.userId;
      //  console.log('Extracted user ID:', userId);
        
        if (!userId) 
        {
          return res.status(400).send('Invalid token: no user ID found');
        }
        
        const db = client.db('COP4331Cards');
        
        const { ObjectId } = require('mongodb');
        
        let result;
        try 
        {
          result = await db.collection('Users').updateOne({ _id: new ObjectId(userId) }, { $set: { Status: '1', VerifiedAt: new Date() } });
        } 
        catch (objectIdError) 
        {
          result = await db.collection('Users').updateOne( { _id: userId }, { $set: { Status: '1', VerifiedAt: new Date() } } );
        }
        
        if (result.modifiedCount === 1) 
        {
          res.send(`
                <h2>Email Verified Successfully!</h2>
                <p>Your email has been verified. You can now <a href="/">login</a> to your account.</p>
          `);
        } 
        else 
        {
          // Check if user exists and status
          let user;
          try 
          {
            user = await db.collection('Users').findOne({ _id: new ObjectId(userId) });
          } 
          catch (e) 
          {
            user = await db.collection('Users').findOne({ _id: userId });
          }
            
          if (user) 
          {
           // console.log('User found, current status:', user.Status);
            
            if (user.Status === '1') 
            {
              res.send(`
                      <h2>Already Verified</h2>
                      <p>Your email was already verified. You can <a href="/">login</a>.</p>
              `);
            } 
            else 
            {
              res.status(400).send('User found but could not update status');
            }
            } 
            else 
            {
              res.status(400).send('User not found');
            }
        }
        
    } 
    catch (error) 
    {
     // console.error('Token verification error:', error.message);
      res.status(400).send(`Invalid or expired verification token: ${error.message}`);
    }
  });

  app.post('/api/resend-verification', async (req, res, next) => {
    const { email } = req.body;
    
    try {
        const db = client.db('COP4331Cards');
        const user = await db.collection('Users').findOne({ Email: email });
        
        if (!user) {
            return res.status(200).json({ error: 'Email not found' });
        }
        
        if (user.Status === '1') {
            return res.status(200).json({ error: 'Email already verified' });
        }
        
        const emailSent = await require('./emailVerification.js').sendVerificationEmail(
            user.Email, 
            user.FirstName, 
            user._id.toString()
        );
        
        if (emailSent) {
            res.status(200).json({ message: 'Verification email sent successfully' });
        } else {
            res.status(200).json({ error: 'Failed to send verification email' });
        }
        
    } catch (error) {
        res.status(200).json({ error: error.toString() });
    }
  });

  app.post('/api/reset-password', async (req, res, next) => 
{
  const { token, newPassword } = req.body;
  var error = '';

  //TEst: shows token and size of password
  console.log('🔧 RESET PASSWORD REQUEST RECEIVED');
  console.log('   - Token received:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  console.log('   - New password length:', newPassword ? newPassword.length : 'NO PASSWORD');

  try 
  {
    const db = client.db('COP4331Cards');
        
    //Find user with valid reset token
    console.log('🔧 Searching for user with reset token...');
    const user = await db.collection('Users').findOne({
        resetToken: token,
        resetTokenExpires: { $gt: new Date() } // Token not expired
    });

    //Test: show email of user to reset password
    console.log('🔧 User found:', user ? `YES - ${user.Email}` : 'NO USER FOUND');
        
    if (!user) 
    {
      //user not found
      console.log('🔧 Debugging why token not found:');
            
      //Check if token exists but expired
      const expiredUser = await db.collection('Users').findOne({
          resetToken: token
       });
            
      if (expiredUser) 
      {//Test: token not usable
        console.log('🔧 Token exists but may be expired');
        console.log('   - Token expiry:', expiredUser.resetTokenExpires);
        console.log('   - Current time:', new Date());
        console.log('   - Is expired?', expiredUser.resetTokenExpires < new Date());
      } 
      else 
      {
        console.log('🔧 Token not found in database at all');
                
        //look for token
        const allUsersWithTokens = await db.collection('Users').find({resetToken: { $exists: true } }).toArray();
      
        //TEst: prints active tokens
        console.log('🔧 Users with reset tokens in DB:', allUsersWithTokens.length);
        allUsersWithTokens.forEach(u => {
          console.log(`   - ${u.Email}: ${u.resetToken.substring(0, 10)}... (expires: ${u.resetTokenExpires})`);
        });
      }
            
      return res.status(200).json({ 
        error: 'Invalid or expired reset token' 
        });
      }

      //TEst: updates password section 
      console.log('🔧 Token is valid, updating password...');

      // Update password and clear reset token
      const updateResult = await db.collection('Users').updateOne(
        { resetToken: token },
        { 
          $set: { 
                  Password: newPassword 
                },
          $unset: {
                  resetToken: "",
                  resetTokenExpires: ""
                }
        }
    );
    //Test: was password changed
    console.log('🔧 Password update result:', updateResult.modifiedCount === 1 ? 'SUCCESS' : 'FAILED');

    var ret = 
    { 
      error: '',
      message: 'Password has been reset successfully. You can now login with new password.'
    };
        
    } 
    catch(e) 
    {//Password changed failed
      error = e.toString();
      console.error('💥 Reset password error:', e);
    }

    res.status(200).json({ error: error });
  });

  app.get('/reset-password', async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.status(400).send(`
            <h2>Error</h2>
            <p>No reset token provided. Please use the link from your email.</p>
            <a href="/">Return to Home</a>
        `);
    }
    
    // Simple HTML form for password reset
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reset Password - Group 21 Project</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 500px; 
                    margin: 50px auto; 
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container { 
                    background: white;
                    border: 1px solid #ddd; 
                    padding: 30px; 
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h2 {
                    color: #333;
                    text-align: center;
                    margin-bottom: 20px;
                }
                input { 
                    width: 100%; 
                    padding: 12px; 
                    margin: 10px 0; 
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                }
                button { 
                    width: 100%; 
                    padding: 12px; 
                    margin: 10px 0; 
                    background-color: #007bff; 
                    color: white; 
                    border: none; 
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #0056b3;
                }
                button:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }
                #message {
                    margin-top: 20px;
                    padding: 10px;
                    border-radius: 5px;
                }
                .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Reset Your Password</h2>
                <p>Enter your new password below:</p>
                <form id="resetForm">
                    <input type="password" id="newPassword" placeholder="New Password" required minlength="6">
                    <input type="password" id="confirmPassword" placeholder="Confirm New Password" required minlength="6">
                    <button type="submit" id="submitBtn">Reset Password</button>
                </form>
                <div id="message"></div>
            </div>
            
            <script>
                const form = document.getElementById('resetForm');
                const messageDiv = document.getElementById('message');
                const submitBtn = document.getElementById('submitBtn');
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                
                console.log('Reset token:', token);
                
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    
                    // Clear previous messages
                    messageDiv.innerHTML = '';
                    messageDiv.className = '';
                    
                    // Validation
                    if (newPassword !== confirmPassword) {
                        showMessage('Passwords do not match', 'error');
                        return;
                    }
                    
                    if (newPassword.length < 6) {
                        showMessage('Password must be at least 6 characters', 'error');
                        return;
                    }
                    
                    // Disable button and show loading
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Resetting Password...';
                    
                    try {
                        const response = await fetch('/api/reset-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                token: token,
                                newPassword: newPassword
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.error) {
                            showMessage('Error: ' + result.error, 'error');
                        } else {
                            showMessage('✅ Password reset successfully! You can now <a href="http://cop433103.com/">login</a> with your new password.', 'success');
                            form.style.display = 'none';
                        }
                    } catch (error) {
                        showMessage('Network error: ' + error.message, 'error');
                    } finally {
                        // Re-enable button
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Reset Password';
                    }
                });
                
                function showMessage(text, type) {
                    messageDiv.innerHTML = text;
                    messageDiv.className = type;
                }
                
                // Show token info for debugging
                showMessage('Reset token detected. Enter your new password above.', 'info');
            </script>
        </body>
        </html>
    `);
  });

  app.post('/api/forgot-password', async (req, res, next) => 
{
    const { email } = req.body;
    var error = '';

    try 
    {
      //Test: show email
      console.log('🔧 STEP 1: Forgot password request received for:', email);
        
      const db = client.db('COP4331Cards');
      const user = await db.collection('Users').findOne({ Email: email });
        
      //Test: user found info
      console.log('🔧 STEP 2: User lookup result:', user ? `Found user: ${user.FirstName} ${user.LastName}` : 'NO USER FOUND');
        
      if (!user) 
      {
        return res.status(200).json({ 
          error: '',
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');

      //Test: fro reset token
      console.log('🔧 FULL RESET TOKEN GENERATED:', resetToken);
      console.log('🔧 Token length:', resetToken.length);
      console.log('🔧 STEP 3: Generated reset token:', resetToken);
      

      // Store reset token
      const updateResult = await db.collection('Users').updateOne(
          { Email: email },
          { 
              $set: { 
                  resetToken: resetToken,
                  resetTokenExpires: new Date(Date.now() + 3600000)
               } 
            }
      );

      //Test: did the reset token go thru
      console.log('🔧 STEP 4: Database update result:', updateResult.modifiedCount === 1 ? 'SUCCESS' : 'FAILED');

      // Send recovery email
      //Test: stablishes emailsending
      console.log('🔧 STEP 5: Importing email function...');
      const { sendPasswordResetEmail } = require('./emailVerification.js');
        
      //Test: sends email
      console.log('🔧 STEP 6: Calling sendPasswordResetEmail...');
      const emailSent = await sendPasswordResetEmail(email, user.FirstName, resetToken);
        
      //Test: was email sent
      console.log('🔧 STEP 7: Email sent result:', emailSent ? 'SUCCESS' : 'FAILED');
        
      if (emailSent)
        {
          var ret = { 
              error: '',
              message: 'Password reset instructions have been sent to your email.'
          };
          //Test: finished sending email
          console.log('✅ COMPLETE: Password reset email sent successfully');
      } 
      else 
        {//Test: sending failed
          error = 'Failed to send recovery email';
            console.log('❌ COMPLETE: Email sending failed');
        }
        
    } 
    catch(e)
     {//Test: failed forgot password call
        error = e.toString();
        console.error('💥 COMPLETE: Forgot password error:', e);
    }

    res.status(200).json({ error: error });
  });

  app.post('/api/getcredits', async (req, res, next) => {
    // incoming: jwtToken
    // outgoing: credits, error
    
    const { jwtToken } = req.body;
    var error = '';
    var credits = 0;

    try {
        // Verify JWT token
        const token = require('./createJWT.js');
        
        if (token.isExpired(jwtToken)) {
            return res.status(200).json({
                error: 'The JWT is no longer valid',
                credits: 0,
                jwtToken: ''
            });
        }

        // Decode the JWT to get user info
        const decoded = token.verifyToken(jwtToken);
        const userId = decoded.userId;

        // Get user from database
        const db = client.db('COP4331Cards');
        const { ObjectId } = require('mongodb');

        const user = await db.collection('Users').findOne(
            { _id: new ObjectId(userId) },
            { Credits: { Credits: 1 } }
        );

        if (user && user.Credits !== undefined) {
            credits = user.Credits;
        } else {
            error = 'User not found or credits not available';
        }

        // Refresh JWT token
        var refreshedToken = null;
        try {
            refreshedToken = token.refresh(jwtToken);
        } catch (e) {
            console.log('Token refresh error:', e.message);
        }

        var ret = { 
            error: error, 
            credits: credits,
            jwtToken: refreshedToken 
        };
        
        res.status(200).json(ret);

    } catch (e) {
        console.error('Get credits error:', e);
        res.status(200).json({ 
            error: e.toString(), 
            credits: 0,
            jwtToken: null 
        });
    }
});

/*Test APIs:
  *debug-email-flow: tests if email is being sent out.
  *debug-users: displays users and their variables.
  *debug-reset-tokens: refreshes the password reset tokens.
*/
  app.post('/api/debug-email-flow', async (req, res) => {
    const { email } = req.body;
    
    try {
        console.log('=== DEBUGGING EMAIL FLOW ===');
        
        // Test 1: Check if user exists
        const db = client.db('COP4331Cards');
        const user = await db.collection('Users').findOne({ Email: email });
        console.log('1. User exists:', !!user);
        
        if (!user) {
            return res.json({ error: 'User not found' });
        }
        
        // Test 2: Test the email function directly
        const { sendPasswordResetEmail } = require('./emailVerification.js');
        const testToken = 'debug-test-token-123';
        
        console.log('2. Testing email function directly...');
        const result = await sendPasswordResetEmail(email, user.FirstName, testToken);
        
        console.log('3. Email function result:', result);
        
        res.json({
            userFound: true,
            emailFunctionResult: result,
            message: result ? 'Email should have been sent' : 'Email function failed'
        });
        
    } catch (error) {
        console.error('Debug error:', error);
        res.json({ error: error.toString() });
    }
  });

  app.get('/api/debug-users', async (req, res) => {
    try {
        const db = client.db('COP4331Cards');
        const users = await db.collection('Users').find({}).toArray();
        
        const userList = users.map(user => ({
            id: user._id,
            email: user.Email,
            login: user.Login,
            firstName: user.FirstName,
            lastName: user.LastName,
            status: user.Status
        }));
        
        res.json({
            totalUsers: users.length,
            users: userList
        });
        
    } catch (error) {
        res.json({ error: error.toString() });
    }
  });

  app.get('/api/debug-reset-tokens', async (req, res) => {
    try {
        const db = client.db('COP4331Cards');
        const usersWithTokens = await db.collection('Users').find({
            resetToken: { $exists: true }
        }).toArray();
        
        const tokenInfo = usersWithTokens.map(user => ({
            email: user.Email,
            resetToken: user.resetToken,
            resetTokenShort: user.resetToken ? user.resetToken.substring(0, 20) + '...' : 'none',
            resetTokenExpires: user.resetTokenExpires,
            isExpired: user.resetTokenExpires ? user.resetTokenExpires < new Date() : true
        }));
        
        res.json({
            tokensFound: usersWithTokens.length,
            tokens: tokenInfo,
            currentTime: new Date()
        });
        
    } catch (error) {
        res.json({ error: error.toString() });
    }
  });

}
