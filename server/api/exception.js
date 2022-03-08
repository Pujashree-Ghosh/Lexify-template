const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});
// const { UUID } ('')
// const { v4: uuidv4 } = require('uuid');

module.exports.fetchException = async (req, response) => {
  const authorId = req.body.authorId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  // console.log(startDate, endDate);
  return new Promise((resolve, reject) => {
    integrationSdk.users
      .show({ id: authorId })
      .then(user => {
        let providerListing = user.data.data.attributes.profile.publicData.providerListing;
        // console.log(new uuidv4(providerListing));
        integrationSdk.availabilityExceptions
          .query({
            listingId: providerListing,
            start: new Date(startDate),
            end: new Date(endDate),
          })
          .then(res => {
            return response.status(200).send(res);
          })
          .catch(e => console.log(e));
      })
      .catch(err => {
        console.log(err);
      });
  });
};

module.exports.createException = async (req, response) => {
  const authorId = req.body.authorId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const seats = req.body.seats;
  console.log(authorId);
  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .query({
        authorId, //id needs to replaced later by authorId
      })
      .then(res => {
        // console.log(res.data.data.length)
        const publishedListings = res.data.data.filter(
          l =>
            (l.attributes.state === 'published' &&
              l.attributes.publicData.type !== 'unsolicited') ||
            l.attributes.publicData.isProviderType
        );

        publishedListings.map(l => {
          integrationSdk.availabilityExceptions
            .create(
              {
                listingId: l.id.uuid,
                start: new Date(startDate),
                end: new Date(endDate),
                seats: seats,
              },
              {
                expand: true,
              }
            )
            .then(res => {
              console.log(res);
            })
            .catch();
        });
        return response.status(200).send('updated');
      })
      .catch(e => console.log(e));
  });
};

module.exports.deleteException = async (req, response) => {
  const authorId = req.body.authorId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  // const seats = req.body.seats;
  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .query({
        authorId,
      })
      .then(resp => {
        // console.log(resp.data.data);

        const listings = resp.data.data.filter(
          l =>
            (l.attributes.state === 'published' &&
              l.attributes.publicData.type !== 'unsolicited') ||
            l.attributes.publicData.isProviderType
        );
        listings.map(l => {
          integrationSdk.availabilityExceptions
            .query({
              listingId: l.id.uuid,
              start: new Date(startDate),
              end: new Date(endDate),
            })
            .then(res => {
              integrationSdk.availabilityExceptions
                .delete(
                  {
                    id: res?.data?.data[0]?.id?.uuid,
                  },
                  {
                    expand: false,
                  }
                )
                .then(res => {
                  // console.log(res);
                });
            });
        });
        return response.status(200).send('deleted');
      })
      .catch(e => console.log(e));
  });
};
