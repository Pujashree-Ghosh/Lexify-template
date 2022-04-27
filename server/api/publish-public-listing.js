const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

module.exports = async (req, response) => {
  const { id } = req.body;
  return new Promise((resolve, reject) => {
    integrationSdk.users
      .show({ id: id })
      .then(res => {
        const { isLawyer } = res.data.data.attributes.profile.protectedData;
        integrationSdk.listings
          .show({
            id: res.data.data.attributes.profile.publicData.providerListing,
          })
          .then(resp => {
            const { hasPublicListing } = resp.data.data.attributes.publicData;
            if (isLawyer === true && !hasPublicListing) {
              integrationSdk.listings
                .update({
                  id: res.data.data.attributes.profile.publicData.providerListing,
                  publicData: {
                    hasPublicListing: true,
                  },
                })
                .then(res => {
                  response.send('success');
                  return resolve('success');
                })
                .catch(err => {
                  return reject(new Error('Update failed', err));
                });
            } else {
              //   console.log('Client Account');
              response.send('success');
              return resolve('success');
            }
          })
          .catch(err => {
            return reject(new Error('listing fetch failed', err));
          });
      })
      .catch(err => {
        return reject(new Error('login failed', err));
      });
  });
};
