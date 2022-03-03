const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});
// const { UUID } ('')
// const { v4: uuidv4 } = require('uuid');

module.exports.fetchException = async (req, response) => {
  const authorId = req.body.uuid;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  console.log(startDate, endDate);
  return new Promise((resolve, reject) => {
    integrationSdk.users
      .show({ id: authorId })
      .then(user => {
        let providerListing = user.data.data.attributes.profile.publicData.providerListing;
        // console.log(new uuidv4(providerListing));
        integrationSdk.availabilityExceptions
          .query({
            listingId: '620ba027-f0df-4593-b8bc-ac827cefc439',
            start: new Date(`${startDate}`),
            end: new Date(endDate),
          })
          .then(res => {
            return response.status(200).send(res);
          })
          .catch(e => console.log(e));
      })
      .catch(err => {
        console.log(err);
      });
  });
};
