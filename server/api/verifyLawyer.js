const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const jwt = require('jsonwebtoken');
// const { default: config } = require('../../src/config');
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});
const secretCode = 'kqtw2s_a/se0<_]it.a4h0tf+rnb!/]79q}4ib<zo6~{$@~@d*~a*<=8:vd^e2>';

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
