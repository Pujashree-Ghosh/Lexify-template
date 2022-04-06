const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});

module.exports.unsolicitedTransition = async (req, response) => {
  const listingId = req.params.id;
  // console.log(listingId);

  return new Promise((resolve, reject) => {
    integrationSdk.transactions.query({ listingId }).then(res => {
      const tId = res.data.data
        .filter(t => {
          return (
            t.attributes.lastTransition === 'transition/accept-oral' ||
            t.attributes.lastTransition === 'transition/customer-join-1'
          );
        })
        .map(ft => ft.id.uuid);
      console.log(
        res.data.data
          .filter(t => {
            return (
              t.attributes.lastTransition === 'transition/accept-oral' ||
              t.attributes.lastTransition === 'transition/customer-join-1'
            );
          })
          .map(ft => ft.id.uuid)
      );

      response.send(tId);
      return resolve('success');
    });
  });
};
