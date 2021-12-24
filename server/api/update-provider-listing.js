const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});

module.exports = async (req, response) => {
  const { id } = req.body;
  return new Promise((resolve, reject) => {
    integrationSdk.users.show({ id: id }).then(res => {
      const { isLawyer } = res.data.data.attributes.profile.protectedData;
      if (isLawyer) {
        const languages = JSON.parse(res.data.data.attributes.profile.publicData.languages).map(
          m => m.value
        );
        const country = res.data.data.attributes.profile.publicData.jurisdictionPractice.map(
          m => m.country
        );
        const practiceArea = res.data.data.attributes.profile.publicData.practice.map(m => m);
        integrationSdk.listings
          .update({
            id: res.data.data.attributes.profile.publicData.providerListing,
            publicData: {
              languages,
              country,
              practiceArea,
            },
          })
          .then(res => {
            console.log(res);
          });
      } else {
        console.log('Client Account');
        response.send('success');
        return resolve('success');
      }
    });
  });
};
