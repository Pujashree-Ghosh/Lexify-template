const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');
const RESULT_PAGE_SIZE = 10;
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});
module.exports = async (req, response) => {
  const { id, alreadyBooked, clientId } = req.body;
  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .update({
        id,
        publicData: {
          alreadyBooked,
          clientId,
        },
      })
      .then(res => {
        return response.status(200).send('updated');
      })
      .catch(err => {
        console.log(err);
      });
  });
};
