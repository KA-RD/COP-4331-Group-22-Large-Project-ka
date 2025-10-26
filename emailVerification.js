const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendVerificationEmail = async (email, firstName, userId) => {
    try {
        //console.log('Creating token for user:', userId);
        
        const tokenGenerator = require('./createJWT.js');
        const tokenResult = tokenGenerator.createToken(firstName, '', userId);
        
        const verificationToken = tokenResult.accessToken;
        
        if (!verificationToken) {
            throw new Error('Token creation failed: ' + tokenResult.error);
        }
        
        const verificationLink = `https://cop433103.com:5000/api/verify-email?token=${verificationToken}`;
        
       // console.log('Verification link:', verificationLink);
        
        const msg = {
            to: email,
            from: 'k.arizaga11@proton.me', // Use your verified SendGrid sender
            subject: 'Group 21 - Project - Verify Your Email Address',
            html: `
                <h2>Welcome, ${firstName}!</h2>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            `
        };
        
       // console.log('Attempting to send email to:', email);
        await sgMail.send(msg);
      //  console.log('✅ Email sent successfully to:', email);
        
        return true;
        
    } 
    catch (error) 
    {
        console.error('❌ Error sending email:', error);

        if (error.response) 
        {
            console.error('SendGrid response:', error.response.body);
        }
        return false;
    }
}
