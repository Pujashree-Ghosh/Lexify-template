const moment = require('moment');
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

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
