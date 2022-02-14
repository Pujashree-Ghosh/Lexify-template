import React, { useState, useEffect } from 'react';
import { array, string, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { LINE_ITEM_DAY, LINE_ITEM_NIGHT, propTypes } from '../../util/types';
import { showUser } from '../../containers/ProfilePage/ProfilePage.duck';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import css from './ListingResultCard.module.css';
import SectionAvatar from '../../containers/ListingPage/SectionAvatar';
import { ensureUser } from '../../util/data';
import routeConfiguration from '../../routeConfiguration';
import { AvatarMedium, NamedLink } from '..';
import biolocationIcon from '../../assets/material-location-on.svg';
import config from '../../config';
import { createResourceLocatorString } from '../../util/routes';
import axios from 'axios';
import { createSlug } from '../../util/urlHelpers';

function ListingResultCardComponent(props) {
  const { listing, currentUser, onShowUser, history } = props;
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
  return (
    <div className={css.cardContainer} key={listing.id.uuid}>
      <div className={css.userContent}>
        <div className={css.SectionAvatarImg}>
            {/* <SectionAvatar user={listing.author} /> */}
            <AvatarMedium className={css.profileAvatar} user={ensuredUser} disableProfileLink />
        </div>
        <div className={css.userInfo}>
            <div className={css.userName}>{listing.attributes.title}</div>
            {/* <div className={css.userLisence}>{listing.attributes.title}</div> */}
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
      <div className={css.listingInfo}>
          <p className={css.listingTitle}>{listing.attributes.title}</p><p className={css.listingDescription}>{listing.attributes.description}</p>
      </div>
      <div className={css.bookingContent}>
          <div className={css.price}>${(listing.attributes?.price?.amount/100)}.00</div>
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

ListingResultCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
  // country: config.custom.country,
};

ListingResultCardComponent.propTypes = {
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
const ListingResultCard = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(ListingResultCardComponent);
export default ListingResultCard;
// export default UserResultCardComponent;
