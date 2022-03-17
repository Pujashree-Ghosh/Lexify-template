const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});
module.exports = async (req, response) => {
  const { authorId, states, pub_category, pub_areaOfLaw } = req.body;
  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .query({
        authorId,
        states,
        pub_category,
        pub_areaOfLaw,
      })
      .then(res => {
        const length = res.data.data.length;
        return response.status(200).send(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  });
};
