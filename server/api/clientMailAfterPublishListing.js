const { getIntegrationSdk } = require('../api-util/sdk');
const moment = require('moment');

const integrationSdk = getIntegrationSdk();

//sendgrid mail send
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendExistingUsesrMail = (clientId, listing, author) => {
  const listingCategory = listing.attributes.publicData.category;
  const listingTitle = listing.attributes.title;
  const listingExpiry = listing.attributes.publicData.expiry;
  const authorName = author.attributes.profile.displayName;
  const slug = listingTitle.replace(/\s+/g, '-').toLowerCase();
  const msg = {
    to: clientId,
    from: 'support@em175.lexify.me',
    subject: `${listingTitle} raised for you`,
    html: `<strong>${authorName}</strong> has raised <strong>${listingTitle}</strong> for you. You can view the listing <a href="https://lexify-dev-bitcanny.herokuapp.com/l/${slug}/${
      listing.id.uuid
    }">here</a>.<br> And book it by clicking on the book button on or before ${moment(
      listingExpiry
    ).format('ddd, LL')}.<br>`,
  };
  sgMail
    .send(msg)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err.response.body);
    });
};
const sendNewUserMail = (clientId, listing, author) => {
  const listingCategory = listing.attributes.publicData.category;
  const listingTitle = listing.attributes.title;
  const listingExpiry = listing.attributes.publicData.expiry;
  const authorName = author.attributes.profile.displayName;
  const slug = listingTitle.replace(/\s+/g, '-').toLowerCase();

  const msg = {
    to: clientId,
    from: 'support@em175.lexify.me',
    subject: `${listingTitle} raised for you`,
    html: `<strong>${authorName}</strong> has raised <strong>${listingTitle}</strong> for you. And invited you to join <a href="https://lexify-dev-bitcanny.herokuapp.com>Lexify.me</a>.<br/> You can view the listing <a href="https://lexify-dev-bitcanny.herokuapp.com/l/${slug}/${
      listing.id.uuid
    }">here</a>.<br> And book it by clicking on the book button on or before ${moment(
      listingExpiry
    ).format('ddd, LL')}.<br>`,
  };
  sgMail
    .send(msg)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err.response.body);
    });
};

// const fetchListing = async (listingId, integrationSdk) => {
//   // return new Promise(async (resolve, reject) => {
//   integrationSdk.listings
//     .show({
//       id: listingId,
//       include: ['author'],
//     })
//     .then(listing => {
//       return listing.data.data;
//     })
//     .catch(err => {
//       console.log(err);
//       return 0;
//     });
// };

const findUser = async (email, integrationSdk) => {
  try {
    const user = await integrationSdk.users.query({ pub_email: email });
    return user.data.data;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};

const fetchAuthor = async (authorId, integrationSdk) => {
  try {
    const author = await integrationSdk.users.show({ id: authorId });
    return author.data.data;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};

module.exports.clientMailSendAfterPublishListing = (req, response) => {
  const listingId = req.body.listingId;

  return new Promise(async (resolve, reject) => {
    try {
      let listing = [];
      if (!listingId) {
        // return reject(new Error('listing Id required'));
        return response.status(404).send('error');
      }
      // fetchListing(listingId, integrationSdk);
      // const listing = await fetchListing(listingId, integrationSdk);
      integrationSdk.listings
        .show({
          id: listingId,
          include: ['author'],
        })
        .then(async listing => {
          console.log(listing.data.data);
          listing = listing.data.data;
          if (listing.length === 0) {
            return response.status(404).send('listing id error1');
          }

          const author = await fetchAuthor(
            listing.relationships.author.data.id.uuid,
            integrationSdk
          );

          const clientId = listing.attributes.publicData.clientId;
          clientId.map(async clientId => {
            const user = await findUser(clientId, integrationSdk);

            if (user.length !== 0) {
              sendExistingUsesrMail(clientId, listing, author);
            } else {
              sendNewUserMail(clientId, listing, author);
            }
          });
          return resolve(response.status(200).send('success'));
        })
        .catch(err => {
          console.log(err);
        });
    } catch (error) {
      return reject(response.status(404).send('error'));
    }
  });
};
