const moment = require('moment');
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

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
        id: listingId, //id needs to replaced later by listingId
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
                      .then(resp => console.log('updated'))
                      .catch(er => console.log(err));
                  })
                  .catch(err => console.log('if create error', err));
              }
            })
            .catch(e => {
              console.log('first delete err', e);
            });
        } else {
          if (res.data.data.attributes.publicData.type === 'unsolicited') {
            const seats = res.data.data.attributes.publicData.clientId.length;
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
                  .then(resp => console.log(resp))
                  .catch(err => console.log(err));
              })
              .catch(err => console.log('else create error', err));
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
            })
            .catch(e => console.log('delete error', e));
        }

        return response.status(200).send('updated');
      })
      .catch(e => console.log(e));
  });
};
