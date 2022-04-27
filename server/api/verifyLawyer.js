const jwt = require('jsonwebtoken');
// const { default: config } = require('../../src/config');
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();
const secretCode = process.env.REACT_APP_JWT_SECRET_CODE;

module.exports.verifyLawyer = async (req, res) => {
  return new Promise((resolve, reject) => {
    const { token } = req.body;
    const decoded = jwt.verify(token, secretCode);

    integrationSdk.users
      .updateProfile(
        {
          id: decoded.lawyerId,
          protectedData: {
            isProfileVerified: true,
          },
          publicData: {
            isProfileVerified: true,
          },
        },
        {
          expand: true,
          include: ['profileImage'],
        }
      )
      .then(resp => {
        res.status(200).send('updated');
        return resolve('updated');
      })
      .catch(err => {
        res.status(401).send('updated failed');
        return reject(new Error('update failed', err));
      });
  });
};
