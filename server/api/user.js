const { User } = require('../models/UserModel');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports.sendOtp = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    console.log(req.body);
    if (!email) return res.status(404).send('email is required');
    if (!mobile) return res.status(404).send('mobile is required');
    let digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    const user = await User.findOne({ mobile });
    const r = await client.messages.create({
      body: `Your otp for lexify is ${OTP}`,
      from: process.env.TWILLIO_PHONE_NUMBER,
      to: mobile,
    });
    // console.log(22, r);
    if (!user) await User.create({ email, mobile, otp: OTP });
    else {
      user.otp = OTP;
      user.email = email;
      await user.save();
    }
    res.status(200).send('Otp sent');
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile) return res.status(404).send('mobile is required');

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).send('User not found!');
    } else {
      if (user.otp !== otp) {
        return res.status(401).send('Otp incorrect!');
      }
    }
    res.status(200).send('Ok');
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};
