
const moment = require('moment');
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk = getIntegrationSdk();
// const { UUID } ('')
// const { v4: uuidv4 } = require('uuid');

const PAGE_SIZE=100;

const updateListingException=async (res,integrationSdk,startDate,endDate,seats)=>{
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
      .catch(err=>console.log(err));
  });
}

const deleteListingException=async (resp,integrationSdk,startDate,endDate)=>{
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
}


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
  let page=1;
  return new Promise((resolve, reject) => {
    integrationSdk.listings
      .query({
        authorId, //id needs to replaced later by authorId
        perPage:PAGE_SIZE,
        page,
      })
      .then(async(res) => {
        let resp=res;
        const {totalPages}=res.data.meta;
        while(true){
          await updateListingException(resp,integrationSdk,startDate,endDate,seats)
          if(page===totalPages) break;
          else{
            page++;
            resp=await integrationSdk.listings.query({authorId,perPage:PAGE_SIZE,page})
          }
        }
        //final response
        return response.status(200).send('updated');
      })
      .catch(e => console.log(e));
  });
};

module.exports.deleteException = async (req, response) => {
  const authorId = req.body.authorId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  let page=1;
  // const seats = req.body.seats;
  return new Promise((resolve, reject) => {
    integrationSdk.listings.query({authorId,perPage:PAGE_SIZE,page})
      .then(async (res) => {
        let resp=res;
        const {totalPages}=res.data.meta;
        while(true){
          await deleteListingException(resp,integrationSdk,startDate,endDate)
          if(page===totalPages) break;
          else{
            page++;
            resp=await integrationSdk.listings.query({authorId,perPage:PAGE_SIZE,page})
          }
        }
        //final response
        return response.status(200).send('deleted');
      })
      .catch(e => console.log(e));
  });
};
