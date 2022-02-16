import React, { useState, useEffect } from 'react';
import { array, string, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { LINE_ITEM_DAY, LINE_ITEM_NIGHT, propTypes } from '../../util/types';
import { showUser } from '../../containers/ProfilePage/ProfilePage.duck';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import css from './UserResultCard.module.css';
import SectionAvatar from '../../containers/ListingPage/SectionAvatar';
import { ensureUser } from '../../util/data';
import routeConfiguration from '../../routeConfiguration';
import { AvatarMedium, NamedLink } from '..';
import biolocationIcon from '../../assets/material-location-on.svg';
import config from '../../config';
import { createResourceLocatorString } from '../../util/routes';
import axios from 'axios';
import { createSlug } from '../../util/urlHelpers';

function UserResultCardComponent(props) {
  const { listing, currentUser, onShowUser, history } = props;
  // console.log(history);
  // const [authorDetail, setAuthorDetail] = useState([]);
  const [countryData, setCountryData] = useState([]);

  useEffect(() => {
    onShowUser(listing.author.id);
    axios
      .get('https://countriesnow.space/api/v0.1/countries/states')
      .then(res => setCountryData(res.data.data))
      .catch(err => console.log('somer error occurred', err));
  }, []);

  const ensuredUser = ensureUser(listing.author);
  const state = countryData
    ?.filter(c => c.iso3 === 'USA')[0]
    ?.states?.filter(s =>
      s.state_code === listing?.attributes?.publicData?.state?.length > 0
        ? listing?.attributes?.publicData?.state[0]
        : ''
    )[0]?.name;
  const city = listing?.attributes?.publicData?.city && listing?.attributes?.publicData?.city[0];
  const country = countryData.filter(
    c =>
      c.iso3 ===
      (listing?.attributes?.publicData?.country?.length > 0
        ? listing?.attributes?.publicData?.country[0]
        : '')
  )[0]?.name;
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
  const slug = createSlug(listing?.attributes?.title);
  console.log(1,listing?.attributes?.description)
  return (
    <div className={css.cardContainer} key={listing.id.uuid}>
      <div className={css.userContent}>
      <div className={css.SectionAvatarImg}>
        {/* <SectionAvatar user={listing.author} /> */}
        <AvatarMedium className={css.profileAvatar} user={ensuredUser} disableProfileLink />
      </div>
      <div className={css.userInfo}>
        <div className={css.userName}>{listing.attributes.title}</div>
        <div className={css.userVerified}>{currentUser?.attributes?.profile?.protectedData?.isProfileVerified?'Attorney of law':null}</div>
        <div className={css.userLocation}>
          {listing?.attributes?.publicData?.country?.length ? (
            <>
              <img src={biolocationIcon} className={css.locationIcon} />

              <span>
                {`${state ? state : city ? city : ''}, 
              ${country}`}
              </span>
            </>
          ) : (
            ''
          )}
        </div>
      </div>
      </div>
      <div className={css.userBio}>
        {listing?.attributes?.description}
      </div>
      <div className={css.bookingContent}>
      <div className={css.profileBtnContainer}>
        {/* <NamedLink name="ProfilePage" params={{ id: ensuredUser.id.uuid }}>
          <FormattedMessage id="UserResultCard.ListingProfileLink" />
        </NamedLink> */}
        <button
          className={css.profileBtn}
          onClick={() =>
            {
              if(listing?.attributes?.publicData?.isProviderType){
                history.push(
                  createResourceLocatorString(
                    'ProfilePage',
                    routeConfiguration(),
                    { id: ensuredUser.id.uuid },
                    {}
                  )
                )
              }else{
                history.push(
                  createResourceLocatorString(
                    'ListingPage',
                    routeConfiguration(),
                    { id: listing.id.uuid,slug },
                    {}
                  )
                )
              }
              
            }
          }
        >
          <FormattedMessage id="UserResultCard.ListingProfileLink" />
        </button>
      </div>
      </div>
    </div>
  );
}

UserResultCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
  // country: config.custom.country,
};

UserResultCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  certificateConfig: array,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,

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
const UserResultCard = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(UserResultCardComponent);
export default UserResultCard;
// export default UserResultCardComponent;
