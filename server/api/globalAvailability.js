// const sharetribeSdk = require('sharetribe-flex-sdk');
// const Money = require('js-money');
// const sdk = sharetribeSdk.createInstance({
//   clientId: 'e3daa030-b2f4-46f9-906f-e386c16017ed',
//   clientSecret: 'fde811d26f8bfa55007c3b9852fd65c0fba03249',
// });

// module.exports = async (req, response) => {
//   //   const { username, password } = req.body;
//   const username = 'test@lawyer.com';
//   const password = '123456789';
//   return new Promise((resolve, reject) => {
//     sdk
//       .login({
//         username,
//         password,
//       })
//       .then(res => {
//         console.log('Login successful.');
//         let availabilityPlan;
//         sdk.currentUser.show().then(res => {
//           availabilityPlan = res.data.data.attributes.profile.protectedData.availabilityPlan;

//           // response
//           //   .status(200)
//           //   .send(res.data.data.attributes.profile.protectedData.availabilityPlan);
//         });

//         sdk.ownListings.query({}).then(res => {
//           // res.data contains the response data
//           const ownPublishedListings = res.data.data.filter(
//             l =>
//               l.attributes.state === 'published' && l.attributes.publicData.type !== 'unsolicited'
//           );
//           ownPublishedListings.map(l => {
//             console.log(l);
//             sdk.ownListings.update({
//               id: l.id.uuid,
//               availabilityPlan,
//             });
//             // .then(res => {
//             //   console.log('listing updated');
//             //   // response.send('success');
//             //   // return resolve('success');
//             // })
//             // .catch(err => {
//             //   return reject(new Error('Update failed', err));
//             // });
//           });
//           response.status(200).send(ownPublishedListings);
//         });
//         // sdk.ownListings
//         //   .update({
//         //     id: '61e502ad-0128-415f-9675-38c72a127b73',
//         //     description: 'test desc',
//         //     availabilityPlan: {
//         //       type: 'availability-plan/time',
//         //       timezone: 'Asia/Calcutta',
//         //       entries: [
//         //         {
//         //           dayOfWeek: 'mon',
//         //           seats: 1,
//         //           startTime: '00:00',
//         //           endTime: '21:45',
//         //         },
//         //         {
//         //           dayOfWeek: 'wed',
//         //           seats: 1,
//         //           startTime: '00:00',
//         //           endTime: '21:45',
//         //         },
//         //       ],
//         //     },
//         //   })
//         //   .then(res => {
//         //     console.log('listing updated');
//         //     response.send('success');
//         //     return resolve('success');
//         //   })
//         //   .catch(err => {
//         //     return reject(new Error('Update failed', err));
//         //   });
//       })
//       .catch(err => {
//         return reject(new Error('login failed', err));
//       });
//   });
// };

const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const moment = require('moment');

const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});
module.exports = async (req, response) => {
  const { authorId } = req.body;
  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .query({
        authorId,
      })
      .then(res => {
        integrationSdk.users
          .show({ id: authorId })
          .then(user => {
            let availabilityPlan = user.data.data.attributes.profile.protectedData.availabilityPlan;
            const publishedListings = res.data.data.filter(
              l =>
                l.attributes.state === 'published' && l.attributes.publicData.type !== 'unsolicited'
            );
            publishedListings.map(l => {
              const durationHour = l.attributes.publicData.durationHour;
              const durationMinute = l.attributes.publicData.durationMinute;
              const totalDurationMinute =
                durationHour && durationMinute
                  ? parseInt(durationHour) * 60 + parseInt(durationMinute)
                  : 60;
              // const bufferTime = 15;
              // console.log(totalDurationMinute);
              let newEntreis = [];
              availabilityPlan.entries.map(e => {
                let start = moment(e.startTime, 'HH:mm').clone();
                let end = moment(e.endTime, 'HH:mm').clone();
                newEntreis.push({
                  dayOfWeek: e.dayOfWeek,
                  seats: 1,
                  startTime: start.format('HH:mm'),
                  endTime: end.format('HH:mm'),
                });

                console.log(newEntreis);

                //   while (
                //     start.isSameOrBefore(end) &&
                //     start
                //       .clone()
                //       .add(totalDurationMinute, 'm')
                //       // .add(totalDurationMinute + bufferTime, 'm')
                //       .isSameOrBefore(end)
                //   ) {
                //     // console.log(
                //     //   start
                //     //     .clone()
                //     //     .add(totalDurationMinute, 'm')
                //     //     // .add(totalDurationMinute + bufferTime, 'm')
                //     //     .format('HH:mm'),
                //     //   end.format('HH:mm'),
                //     //   totalDurationMinute,
                //     //   // bufferTime,
                //     //   start
                //     //     .clone()
                //     //     .add(totalDurationMinute, 'm')
                //     //     // .add(totalDurationMinute + bufferTime, 'm')
                //     //     .isSameOrBefore(end)
                //     // );
                //     newEntreis.push({
                //       dayOfWeek: e.dayOfWeek,
                //       seats: 1,
                //       startTime: start.format('HH:mm'),
                //       endTime: start
                //         .clone()
                //         .add(totalDurationMinute, 'm')
                //         .format('HH:mm'),
                //     });
                //     start = start.add(totalDurationMinute, 'm');
                //     // start = start.add(totalDurationMinute + bufferTime, 'm');
                //   }
                // });
                // console.log(
                //   // durationHour,
                //   // durationMinute,
                //   // durationHour && durationMinute
                //   //   ? parseInt(durationHour) * 60 + parseInt(durationMinute)
                //   //   : 1,
                //   newEntreis
                // );
                // integrationSdk.listings.update({
                //   id: l.id.uuid,
                //   availabilityPlan: {
                //     entries: newEntreis,
                //     timezone: availabilityPlan.timezone,
                //     type: availabilityPlan.type,
                //   },
              });
            });
            return response.status(200).send(availabilityPlan);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });
};
