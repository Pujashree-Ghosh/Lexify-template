const RESULT_PAGE_SIZE = 10;
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

module.exports = async (req, response) => {
  const { authorId, states, pub_category, pub_areaOfLaw, page,pub_clientId } = req.body;
  console.log("req body",req.body);

  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .query({
        authorId,
        states,
        // states: 'draft,closed',
        pub_category,
        pub_areaOfLaw,
        // pub_areaOfLaw: 'has_Any: contractsAndAgreements,employmentAndLabor',
        perPage: RESULT_PAGE_SIZE,
        pub_clientId,
        page,
      })
      .then(res => {
        return response.status(200).send(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  });
};
