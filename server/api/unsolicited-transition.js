const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});

module.exports.unsolicitedTransition = async (req, response) => {
  const listingId = req.body.id;

  return new Promise((resolve, reject) => {
    integrationSdk.transactions
      .query({ listingId: '624aa0cb-5f36-49ba-bb44-a3187dfeed33' })
      .then(res => {
        console.log(
          res.data.data.map(t => {
            if (t.attributes.lastTransition === 'transition/accept-oral') {
              return t.id.uuid;
            }
            // return t.attrbutes;
          })
          // res.data.data
        );

        response
          .send
          // res.data.data.map(t => {
          //   if (t.attrbutes.lastTransition === 'transition/accept-oral') {
          //     return t.id.uuid;
          //   }
          // })
          ();
        return resolve('success');
      });
  });
};
