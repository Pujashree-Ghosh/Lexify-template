const express = require('express');
const router = express.Router();
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const IpMessagingGrant = AccessToken.IpMessagingGrant;

// Used when generating any kind of Access Token
const twilioAccountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.REACT_APP_TWILIO_ACCOUNT_API_SID;
const twilioApiSecret = process.env.REACT_APP_TWILIO_ACCOUNT_API_SECRET;
const serviceSid = process.env.REACT_APP_TWILIO_ACCOUNT_SERVICE_SID;

router.post('/getTwilioToken', (req, res) => {
  console.log("received")
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
  token.identity = req.body.identity;
  console.log('data', req.body);
  // Create a Video grant which enables a client to use Video
  // and limits access to the specified Room (DailyStandup)
  const videoGrant = new VideoGrant({
    room: req.body.room,
  });

  // Add the grant to the token
  token.addGrant(videoGrant);

  // Serialize the token to a JWT string
  console.log(token.toJwt());
  res.send(token.toJwt());
});
router.post('/getTwilioChatToken', (req, res) => {
  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
  token.identity = req.body.identity;
  console.log('data', req.body);
  // Create a Video grant which enables a client to use Video
  // and limits access to the specified Room (DailyStandup)
  const ipmGrant = new IpMessagingGrant({
    serviceSid: serviceSid,
  });

  // Add the grant to the token
  token.addGrant(ipmGrant);

  // Serialize the token to a JWT string
  console.log(token.toJwt());
  res.send(token.toJwt());
});
module.exports = router;
