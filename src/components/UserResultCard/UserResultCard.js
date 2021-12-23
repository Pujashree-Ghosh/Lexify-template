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
import { AvatarMedium, NamedLink } from '..';

function UserResultCardComponent(props) {
  const { listing, currentUser, onShowUser } = props;
  const [authorDetail, setAuthorDetail] = useState([]);
  useEffect(() => {
    const authorData = onShowUser(listing.author.id);
    // authorData.then(data => {
    //   setAuthorDetail(data.data);
    // });
  }, []);
  // console.log(authorDetail);
  const ensuredUser = ensureUser(listing.author);
  console.log(ensuredUser);

  return (
    <div className={css.cardContainer}>
      <div className={css.SectionAvatarImg}>
        {/* <SectionAvatar user={listing.author} /> */}
        <AvatarMedium className={css.profileAvatar} user={ensuredUser} />
      </div>
      <div>{listing.attributes.title}</div>
      <div>
        <NamedLink
          // className={css.profileLink}
          name="ProfilePage"
          params={{ id: ensuredUser.id.uuid }}
        >
          <FormattedMessage id="UserResultCard.ListingProfileLink" />
        </NamedLink>
      </div>
    </div>
  );
}

UserResultCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
};

UserResultCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  certificateConfig: array,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,

  // Responsive image sizes hint
  renderSizes: string,

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
