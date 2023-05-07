const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;


// Function for getting an access token using OAuth2
async function getAccessToken() {
  const oauth2Client = new OAuth2(
    process.env.clientId,
    process.env.secret,
    'https://developers.google.com/oauthplayground' // Redirect URL
  );

  await oauth2Client.setCredentials({
    refresh_token:process.env.refreshToken
  });

  try {
    const { tokens } = await oauth2Client.refreshAccessToken();
    if(tokens) return tokens.access_token;
  } catch (err) {
    console.error('Error refreshing access token:', err);
  }
}

// Send email function
async function sendEmail(email,subject,link) {
  const accessToken = await getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      accessToken: accessToken,
      clientId: process.env.clientId,
      clientSecret: process.env.secret,
      refreshToken: process.env.refreshToken
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text: 'This is a verification mail',
    html:`please click this mail to confirm:<a href = ${link}>${link}</a>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (info) {
        console.log('Email sent:', info.response);   
    } else {
        console.error('Error sending email:', error);
    }
  });
}


module.exports=sendEmail;