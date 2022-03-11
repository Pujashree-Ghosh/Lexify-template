import React, { useState, useEffect } from 'react';
import { array, string, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { LINE_ITEM_DAY, LINE_ITEM_NIGHT, propTypes } from '../../util/types';
import { showUser } from '../../containers/ProfilePage/ProfilePage.duck';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import css from './AppointmentCard.module.css';
import SectionAvatar from '../../containers/ListingPage/SectionAvatar';
import { ensureUser } from '../../util/data';
import routeConfiguration from '../../routeConfiguration';
import { AvatarMedium, NamedLink } from '..';
import biolocationIcon from '../../assets/material-location-on.svg';
import config from '../../config';
import { createResourceLocatorString } from '../../util/routes';
import axios from 'axios';
import { createSlug } from '../../util/urlHelpers';
import ReadmoreButton from '../../containers/ReadmoreButton/ReadmoreButton';

function AppointmentCardComponent(props) {
  //   const { listing, currentUser, onShowUser, history } = props;
  // const [authorDetail, setAuthorDetail] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const { data } = props;
  console.log('first');

  //   useEffect(() => {
  //     onShowUser(listing.author.id);
  //     axios
  //       .get('https://countriesnow.space/api/v0.1/countries/states')
  //       .then(res => setCountryData(res.data.data))
  //       .catch(err => console.log('somer error occurred', err));
  //     console.log('in here');
  //   }, []);

  //   const ensuredUser = ensureUser(listing.author);
  //   const state = countryData
  //     ?.filter(c => c.iso3 === 'USA')[0]
  //     ?.states?.filter(s =>
  //       s.state_code === listing?.attributes?.publicData?.state?.length > 0
  //         ? listing?.attributes?.publicData?.state[0]
  //         : ''
  //     )[0]?.name;
  //   const city = listing?.attributes?.publicData?.city && listing?.attributes?.publicData?.city[0];
  //   const country = countryData.filter(
  //     c =>
  //       c.iso3 ===
  //       (listing?.attributes?.publicData?.country?.length > 0
  //         ? listing?.attributes?.publicData?.country[0]
  //         : '')
  //   )[0]?.name;
  // console.log(
  //   666,
  //   listing?.attributes?.publicData?.country?.length
  //     ? listing?.attributes?.publicData?.country[0]
  //     : '',
  //   listing?.attributes?.publicData?.country,
  //   // countryData.map(m => m),
  //   countryData.filter(
  //     c =>
  //       c.iso3 ===
  //       (listing?.attributes?.publicData?.country?.length
  //         ? listing?.attributes?.publicData?.country[0]
  //         : '')
  //   )[0]?.name
  // );
  //   const slug = createSlug(listing?.attributes?.title);
  //   console.log('first');
  return (
    <div className={css.cardContainer} key={1}>
      <div className={css.dateInfo}>
        <span>{data.startDate.dayOfWeek}</span>
        <span className={css.stday}>{data.startDate.day}</span>
        <span>{`${data.startDate.month},${data.startDate.year}`}</span>
      </div>
      <div className={css.horizontal}>
        <div className={css.statusContainer}>
          {data.pending ? (
            <p className={css.status}>Pending Confimation</p>
          ) : data.upcoming ? (
            <p className={`${css.status} ${css.statuspending}`}>Pending</p>
          ) : data.completed ? (
            <p className={`${css.status} ${css.statuscom}`}>Completed</p>
          ) : (
            ''
          )}
        </div>
        <div className={css.providerAndListing}>
          <div className={css.listingDurationDeadline}>
            <div className={css.startTime}>
              <img src="/static/icons/timeicon.png" />
              6.00 PM
            </div>

            <p className={css.listingInfo}>{data.listingTitle}</p>
            {/* <p className={css.listingDescription}>
                {listing.attributes.description.length > 150
                    ? listing.attributes.description.slice(0, 150) + '...'
                    : listing.attributes.description}
                </p> */}
            {/* <ReadmoreButton
                description={
                    'This is a consultation This is a consultation This is a consultation This is a consultation This is a consultation This is a consultation'
                }
                /> */}

            <div className={css.durationDeadline}>
              <span className={css.duration}>
                <span>Duration: </span>
                {`${data.duration} Hour`}
              </span>
              <span className={css.deadline}>
                <span>Deadline:</span> 12/12/1212
              </span>
            </div>
          </div>
          <div className={css.userContent}>
            <div className={css.SectionAvatarImg}>
              {/* <SectionAvatar user={listing.author} /> */}
              <AvatarMedium
                className={css.profileAvatar}
                // user={listing.providerName}
                disableProfileLink
              />
            </div>
            <div className={css.userInfo}>
              <div className={css.userName}>{data.authorName}</div>
              {/* <div className={css.userLisence}>{listing.attributes.title}</div> */}
              <div className={css.userLocation}>
                {false ? (
                  <>
                    <img src={biolocationIcon} className={css.locationIcon} />

                    <span>
                      {`${state ? state : city ? city : ''}, 
                ${country}`}
                    </span>
                  </>
                ) : (
                  'Kolkata,India'
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={css.bookingContent}>
          {/* <div className={css.price}>${listing.attributes?.price?.amount / 100}.00</div> */}
          {data.pending ? (
            <>
              <div className={css.cctxtp}>
                Please click on 'confirm' to confirm that you have recieved the consultation
              </div>
              <div className={css.profileBtnContainer}>
                {/* <NamedLink name="ProfilePage" params={{ id: ensuredUser.id.uuid }}>
            <FormattedMessage id="UserResultCard.ListingProfileLink" />
            </NamedLink> */}
                <button
                  className={css.profileBtn}
                  // onClick={() => {
                  //   if (listing?.attributes?.publicData?.isProviderType) {
                  //     history.push(
                  //       createResourceLocatorString(
                  //         'ProfilePage',
                  //         routeConfiguration(),
                  //         { id: ensuredUser.id.uuid },
                  //         {}
                  //       )
                  //     );
                  //   } else {
                  //     history.push(
                  //       createResourceLocatorString(
                  //         'ListingPage',
                  //         routeConfiguration(),
                  //         { id: listing.id.uuid, slug },
                  //         {}
                  //       )
                  //     );
                  //   }
                  // }}
                >
                  <FormattedMessage id="AppointmentCard.confirmButton" />
                </button>
              </div>
            </>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
}

AppointmentCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
  // country: config.custom.country,
};

AppointmentCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  certificateConfig: array,
  intl: intlShape.isRequired,
  //   listing: propTypes.listing.isRequired,

  // Responsive image sizes hint
  renderSizes: string,
  // country: array,

  setActiveListing: func,
};

const mapStateToProps = state => {
  // console.log("state in listingcard",state)
  const { currentUser } = state.user;

  return {
    currentUser,
  };
};
const mapDispatchToProps = dispatch => ({
  // onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
  onShowUser: data => dispatch(showUser(data)),
  onShowListing: data => dispatch(showListing(data)),
});

// export default injectIntl(UserResultCardComponent);
const AppointmentCard = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(AppointmentCardComponent);
export default AppointmentCard;
// export default UserResultCardComponent;
