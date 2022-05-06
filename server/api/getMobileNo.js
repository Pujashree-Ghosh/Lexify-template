const { getIntegrationSdk } = require('../api-util/sdk');

const integrationSdk = getIntegrationSdk();

const findUser = async (email, integrationSdk) => {
  try {
    const user = await integrationSdk.users.query({ pub_email: email });
    console.log(user.data.data);
    return user.data.data;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};
module.exports.getMobileNo = (req, response) => {
  const email = req.body.email;
  if (!email) {
    response.status(400).send({
      error: 'Email is required',
    });
  }

  return new Promise(async (resolve, reject) => {
    const user = await findUser(email, integrationSdk);
    if (user.length) {
      const phoneNumber = user[0]?.attributes?.profile?.protectedData?.phoneNumber;
      console.log(phoneNumber);
      if (phoneNumber) {
        return response.status(200).send({ phoneNumber });
      } else {
        return response.status(404).send('no phone number found');
      }
    } else {
      return response.status(404).send('invalid email');
    }
  });
};
