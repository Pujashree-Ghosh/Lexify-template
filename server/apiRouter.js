/**
 * This file contains server side endpoints that can be used to perform backend
 * tasks that can not be handled in the browser.
 *
 * The endpoints should not clash with the application routes. Therefore, the
 * endpoints are prefixed in the main server where this file is used.
 */

const express = require('express');
const bodyParser = require('body-parser');
const { deserialize } = require('./api-util/sdk');

const initiateLoginAs = require('./api/initiate-login-as');
const loginAs = require('./api/login-as');
const transactionLineItems = require('./api/transaction-line-items');
const initiatePrivileged = require('./api/initiate-privileged');
const transitionPrivileged = require('./api/transition-privileged');

const createUserWithIdp = require('./api/auth/createUserWithIdp');

const { authenticateFacebook, authenticateFacebookCallback } = require('./api/auth/facebook');
const { authenticateGoogle, authenticateGoogleCallback } = require('./api/auth/google');
const { sendOtp, verifyOtp } = require('./api/user');
const { fetchException, createException, deleteException } = require('./api/exception');
const {
  setBooking,
  getBooking,
  getAllBooking,
  deleteBooking,
  getProviderBooking,
  updateBooking,
  setVerification,
  updateVerification,
  fetchVerificationList,
  markAsVerified,
  fetchUserVerification,
} = require('./api/booking');

const updateProviderListing = require('./api/update-provider-listing');
const createProviderListing = require('./api/create-provider-listing');
const publishPublicListing = require('./api/publish-public-listing');
const globalAvailability = require('./api/globalAvailability');
const sortOwnListings = require('./api/sortOwnListings');
const updateClientId = require('./api/update-client-id');
const showListingsAuthor = require('./api/show-listings-author');
const { getTwilioToken } = require('./api/twilio');
const { listingExceptionCreate, listingExceptionDelete } = require('./api/unsolicitedException');
const { unsolicitedTransition } = require('./api/unsolicited-transition');
const { setAdminAvailability, getAdminAvailability } = require('./api/AdminAvailability');
const { verifyLawyer } = require('./api/verifyLawyer');
const { clientMailSendAfterPublishListing } = require('./api/clientMailAfterPublishListing');
const { getMobileNo } = require('./api/getMobileNo');

const router = express.Router();

// ================ API router middleware: ================ //

// Parse Transit body first to a string
router.use(
  bodyParser.text({
    type: 'application/transit+json',
  })
);

// Deserialize Transit body string to JS data
router.use((req, res, next) => {
  if (req.get('Content-Type') === 'application/transit+json' && typeof req.body === 'string') {
    try {
      req.body = deserialize(req.body);
    } catch (e) {
      console.error('Failed to parse request body as Transit:');
      console.error(e);
      res.status(400).send('Invalid Transit in request body.');
      return;
    }
  }
  next();
});

// ================ API router endpoints: ================ //

// custom

router.post('/user', sendOtp);
router.post('/user/verify', verifyOtp);
router.post('/booking/setBooking', setBooking);
router.patch('/booking/updateBooking', updateBooking);
router.post('/booking/getBooking', getBooking);
router.get('/booking/getBooking', getAllBooking);
router.post('/booking/getProviderBooking', getProviderBooking);
router.delete('/booking/deleteBooking', deleteBooking);
router.post('/fetchexception', fetchException);
router.post('/createException', createException);
router.delete('/deleteException', deleteException);
router.post('/sortOwnListings', sortOwnListings);
router.post('/updateClientId', updateClientId);
router.post('/getTwilioToken', getTwilioToken);
router.post('/showListingsAuthor', showListingsAuthor);
router.post('/createProviderListing', createProviderListing);
router.post('/updateProviderListing', updateProviderListing);
router.post('/publishPublicListing', publishPublicListing);
router.post('/globalAvailability', globalAvailability);
router.get('/globalAvailability', globalAvailability);
router.post('/listing/createException', listingExceptionCreate);
router.delete('/listing/exceptionDelete', listingExceptionDelete);
router.get('/unsolicitedTransition/:id', unsolicitedTransition);

router.post('/clientMailSend', clientMailSendAfterPublishListing);
router.post('/getMobileNo', getMobileNo);

// router.post('/setVerificationTime', setVerificationTime);
// router.get('/getVerification/:id', getVerification);
// router.get('/getAllVerifications', getAllVerifications);

router.post('/setVerification', setVerification);
router.post('/updateVerification', updateVerification);
router.post('/fetchVerificationList', fetchVerificationList);
router.post('/markAsVerified', markAsVerified);
router.post('/fetchUserVerification', fetchUserVerification);

router.post('/verifyLawyer', verifyLawyer);

router.post('/setAdminAvailability', setAdminAvailability);
router.get('/getAdminAvailability', getAdminAvailability);

router.get('/initiate-login-as', initiateLoginAs);
router.get('/login-as', loginAs);
router.post('/transaction-line-items', transactionLineItems);
router.post('/initiate-privileged', initiatePrivileged);
router.post('/transition-privileged', transitionPrivileged);

// Create user with identity provider (e.g. Facebook or Google)
// This endpoint is called to create a new user after user has confirmed
// they want to continue with the data fetched from IdP (e.g. name and email)
router.post('/auth/create-user-with-idp', createUserWithIdp);

// Facebook authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Facebook
router.get('/auth/facebook', authenticateFacebook);

// This is the route for callback URL the user is redirected after authenticating
// with Facebook. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Flex API to authenticate user to Flex
router.get('/auth/facebook/callback', authenticateFacebookCallback);

// Google authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Google
router.get('/auth/google', authenticateGoogle);

// This is the route for callback URL the user is redirected after authenticating
// with Google. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Flex API to authenticate user to Flex
router.get('/auth/google/callback', authenticateGoogleCallback);

module.exports = router;
