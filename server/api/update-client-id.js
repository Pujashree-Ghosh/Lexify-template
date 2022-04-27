const moment = require('moment');
const RESULT_PAGE_SIZE = 10;
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

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
