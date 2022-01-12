const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});

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
                  console.log('listing updated');
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
