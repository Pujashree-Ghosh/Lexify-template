const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});
// const { UUID } ('')
// const { v4: uuidv4 } = require('uuid');

// module.exports.fetchException = async (req, response) => {
//   const authorId = req.body.uuid;
//   const startDate = req.body.startDate;
//   const endDate = req.body.endDate;
//   console.log(startDate, endDate);
//   return new Promise((resolve, reject) => {
//     integrationSdk.users
//       .show({ id: authorId })
//       .then(user => {
//         let providerListing = user.data.data.attributes.profile.publicData.providerListing;
//         // console.log(new uuidv4(providerListing));
//         integrationSdk.availabilityExceptions
//           .query({
//             listingId: providerListing,
//             start: new Date(startDate),
//             end: new Date(endDate),
//           })
//           .then(res => {
//             return response.status(200).send(res);
//           })
//           .catch(e => console.log(e));
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   });
// };

module.exports.listingExceptionCreate = async (req, response) => {
  const listingId = req.body.id;

  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const seats = req.body.seats;
  return new Promise((resolve, reject) => {
    if (!listingId) {
      return reject(new Error('listing id required'));
    }
    if (!startDate) {
      return reject(new Error('start date required'));
    }
    if (!endDate) {
      return reject(new Error('end date required'));
    }
    if (!seats) {
      return reject(new Error('seats required'));
    }

    integrationSdk.listings
      .show({
        id: listingId, //id needs to replaced later by authorId
      })
      .then(res => {
        const availId = res.data.data.attributes.publicData.availId;
        console.log(availId);
        if (availId) {
          integrationSdk.availabilityExceptions
            .delete(
              {
                id: availId,
              },
              {
                expand: false,
              }
            )
            .then(() => {
              if (res.data.data.attributes.publicData.type === 'unsolicited') {
                // const seats = res.data.data.attributes.publicData.clientId.length;
                integrationSdk.availabilityExceptions
                  .create(
                    {
                      listingId,
                      start: new Date(startDate),
                      end: new Date(endDate),
                      seats: seats,
                    },
                    {
                      expand: true,
                    }
                  )
                  .then(exceptionResp => {
                    integrationSdk.listings
                      .update({
                        id: listingId,
                        publicData: {
                          availId: exceptionResp.data.data.id.uuid,
                        },
                      })
                      .then()
                      .catch();
                  });
                // .catch(err => console.log(err));
              }
            });
        } else {
          if (res.data.data.attributes.publicData.type === 'unsolicited') {
            const seats = res.data.data.attributes.publicData.clientId.length;
            integrationSdk.availabilityExceptions
              .create(
                {
                  listingId,
                  start: new Date(
                    moment(`${startDate} ${startTime}`, 'DD/MM/YYYY HH:mm:ss').format()
                  ),
                  end: new Date(moment(`${endDate} ${endTime}`, 'DD/MM/YYYY HH:mm:ss').format()),
                  seats: seats,
                },
                {
                  expand: true,
                }
              )
              .then(exceptionResp => {
                integrationSdk.listings
                  .update({
                    id: listingId,
                    publicData: {
                      availId: exceptionResp.data.data.id.uuid,
                    },
                  })
                  .then()
                  .catch();
              });
            // .catch(err => console.log(err));
          }
        }

        // console.log(
        //   moment(`${startDate} ${startTime}`, 'DD/MM/YYYY HH:mm:ss').format(),
        //   moment(`${endDate} ${endTime}`, 'DD/MM/YYYY HH:mm:ss').format(),
        //   endTime
        // );

        return response.status(200).send('updated');
      })
      .catch(e => console.log(e));
  });
};

module.exports.listingExceptionDelete = async (req, response) => {
  const listingId = req.body.id;

  return new Promise((resolve, reject) => {
    if (!listingId) {
      return reject(new Error('listing id required', err));
    }

    integrationSdk.listings
      .show({
        id: listingId, //id needs to replaced later by authorId
      })
      .then(res => {
        const availId = res.data.data.attributes.publicData.availId;
        if (availId) {
          integrationSdk.availabilityExceptions
            .delete(
              {
                id: availId,
              },
              {
                expand: false,
              }
            )
            .then(() => {
              console.log('deleted');
            });
        }

        return response.status(200).send('updated');
      })
      .catch(e => console.log(e));
  });
};
