const sharetribeSdk = require('sharetribe-flex-sdk');
const Money = require('js-money');
const sdk = sharetribeSdk.createInstance({
  clientId: 'e3daa030-b2f4-46f9-906f-e386c16017ed',
  clientSecret: 'fde811d26f8bfa55007c3b9852fd65c0fba03249',
});

module.exports = async (req, response) => {
  const { username, password } = req.body;
  return new Promise((resolve, reject) => {
    sdk
      .login({
        username,
        password,
      })
      .then(() => {
        console.log('Login successful.');
        sdk.currentUser
          .show()
          .then(res => {
            const { isLawyer } = res.data.data.attributes.profile.protectedData;
            const title = `${res.data.data.attributes.profile.firstName} ${res.data.data.attributes.profile.lastName}`;
            if (isLawyer) {
              sdk.ownListings
                .create({
                  title: title,
                  publicData: {
                    isProviderType: true,
                  },
                  price: new Money(0, 'USD'),
                })
                .then(res => {
                  console.log(`listing created with id ${res.data.data.id.uuid}`);
                  sdk.currentUser
                    .updateProfile({
                      publicData: {
                        providerListing: res.data.data.id.uuid,
                      },
                    })
                    .then(() => {
                      console.log('profile updated');
                      response.send('success');
                      return resolve('success');
                    })
                    .catch(err => {
                      return reject(new Error('profile update with lisiting id failed', err));
                    });
                })
                .catch(err => {
                  return reject(new Error('listing creation failed', err));
                });
            } else {
              console.log('Client Account');
              response.send('success');
              return resolve('success');
            }
          })
          .catch(err => {
            return reject(new Error('currrent user fetch failed', err));
          });
      })
      .catch(err => {
        return reject(new Error('login failed', err));
      });
  });
};
