
const Money = require('js-money');
const {getSdk} =require("../api-util/sdk")

module.exports = async (req, response) => {
  const { username, password } = req.body;
  const sdk = getSdk(req, response);
  return new Promise((resolve, reject) => {
    sdk.login({username,password})
        .then(() => {
          sdk.currentUser.show()
            .then(res => {
              const { isLawyer } = res.data.data.attributes.profile.protectedData;
              const title = `${res.data.data.attributes.profile.firstName} ${res.data.data.attributes.profile.lastName}`;
              if (isLawyer) {
                sdk.ownListings.create({title: title,publicData: {isProviderType: true,},price: new Money(0, 'USD')})
                  .then(res => {
                    sdk.currentUser.updateProfile({publicData: {providerListing: res.data.data.id.uuid}})
                        .then(() => {
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
