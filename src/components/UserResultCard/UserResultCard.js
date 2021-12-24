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

function UserResultCardComponent(props) {
  const { listing, currentUser, onShowUser, history, country } = props;
  // const [authorDetail, setAuthorDetail] = useState([]);

  useEffect(() => {
    onShowUser(listing.author.id);
  }, []);

  const ensuredUser = ensureUser(listing.author);

  return (
    <div className={css.cardContainer} key={listing.id.uuid}>
      <div className={css.SectionAvatarImg}>
        {/* <SectionAvatar user={listing.author} /> */}
        <AvatarMedium className={css.profileAvatar} user={ensuredUser} />
      </div>
      <div className={css.userInfo}>
        <div className={css.userName}>{listing.attributes.title}</div>
        {/* <div className={css.userLisence}>{listing.attributes.title}</div> */}
        <div className={css.userLocation}>
          {listing?.attributes?.publicData?.country?.length ? (
            <>
              <span className={css.locationIconContainer}>
                <img src={biolocationIcon} className={css.locationIcon} />
              </span>
              {country.filter(c => c.code === listing?.attributes?.publicData?.country[0])[0].name}
            </>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className={css.profileBtnContainer}>
        {/* <NamedLink name="ProfilePage" params={{ id: ensuredUser.id.uuid }}>
          <FormattedMessage id="UserResultCard.ListingProfileLink" />
        </NamedLink> */}
        <button
          className={css.profileBtn}
          onClick={() =>
            history.push(
              createResourceLocatorString(
                'ProfilePage',
                routeConfiguration(),
                { id: ensuredUser.id.uuid },
                {}
              )
            )
          }
        >
          <FormattedMessage id="UserResultCard.ListingProfileLink" />
        </button>
      </div>
    </div>
  );
}

UserResultCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
  country: config.custom.country,
};

UserResultCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  certificateConfig: array,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,

  // Responsive image sizes hint
  renderSizes: string,
  country: array,

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
