
const moment = require('moment');
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

const PAGE_SIZE=100;

const createAvailablityQueryParams=(perPage,page,authorId)=>{
  return {
    authorId,
    states: 'published',
    pub_category: 'publicOral,customOral',
    perPage,
    page,
  }
}

const updateListingAvailablity=async(res,availabilityPlan,integrationSdk)=>{
  const publishedListings = res.data.data.filter(
    l => l.attributes.publicData.type !== 'unsolicited'
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
      
      integrationSdk.listings.update({
        id: l.id.uuid,
        availabilityPlan: {
          entries: newEntreis,
          timezone: availabilityPlan.timezone,
          type: availabilityPlan.type,
        },
      });
    });
  });
}

module.exports = async (req, response) => {
  const { authorId } = req.body;
  let page=1;
  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .query(createAvailablityQueryParams(PAGE_SIZE,page,authorId))
      .then(res => {
        const {totalPages}=res.data.meta;
        integrationSdk.users
          .show({ id: authorId })
          .then(async(user) => {
            let resp=res;
            let availabilityPlan = user.data.data.attributes.profile.protectedData.availabilityPlan;
            while(true){
              await updateListingAvailablity(resp,availabilityPlan,integrationSdk)
              if(page === totalPages) break;
              else{
                page++;
                resp=await integrationSdk.listings.query(createAvailablityQueryParams(PAGE_SIZE,page,authorId))
              }
              
            }
            //final response
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
