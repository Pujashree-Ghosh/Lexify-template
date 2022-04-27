const RESULT_PAGE_SIZE = 10;
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

module.exports = async (req, response) => {
  const { id } = req.body;
  return new Promise((resolve, reject) => {
    integrationSdk.users
      .show({
        id,
      })
      .then(res => {
        return response.status(200).send(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  });
};
