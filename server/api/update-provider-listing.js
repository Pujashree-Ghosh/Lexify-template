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
        if (isLawyer === true) {
          const languages = JSON.parse(res.data.data.attributes.profile.publicData.languages).map(
            m => m.value
          );
          const country = res.data.data.attributes.profile.publicData?.jurisdictionPractice?.map(
            m => m.country
          );
          const state = res.data.data.attributes.profile.publicData?.jurisdictionPractice
            ?.map(s => s.state)
            ?.filter(f => f !== undefined);
          const city = res.data.data.attributes.profile.publicData?.jurisdictionPractice
            ?.map(m => m.city?.toLowerCase())
            ?.filter(f => f !== undefined);
          const zip = res.data.data.attributes.profile.publicData?.jurisdictionPractice
            ?.map(m => m.postalCode)
            ?.filter(f => f !== undefined);
          const industry = res.data.data.attributes.profile.publicData?.industry
            ?.map(m => m.industryName)
            ?.filter(f => f !== undefined);
          const description = res.data.data.attributes.profile?.bio;
          const practiceArea = res.data.data.attributes.profile.publicData?.practice?.map(m => m);
          integrationSdk.listings
            .update({
              id: res.data.data.attributes.profile.publicData.providerListing,
              description,
              publicData: {
                languages,
                country,
                practiceArea,
                state: state.length ? state : null,
                city: city.length ? city : null,
                postalCode: zip.length ? zip : null,
                industry: industry.length ? industry : null,
              },
            })
            .then(res => {
              // console.log('listing updated');
              response.send('success');
              return resolve('success');
            })
            .catch(err => {
              return reject(new Error('Update failed', err));
            });
        } else {
          console.log('Client Account');
          response.send('success');
          return resolve('success');
        }
      })
      .catch(err => {
        return reject(new Error('login failed', err));
      });
  });
};
