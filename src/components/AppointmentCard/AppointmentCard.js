import React, { useState, useEffect } from 'react';
import { array, string, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { showUser } from '../../containers/ProfilePage/ProfilePage.duck';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import css from './AppointmentCard.module.css';
import { AvatarMedium } from '..';
import biolocationIcon from '../../assets/material-location-on.svg';
import moment from 'moment';
function AppointmentCardComponent(props) {
  const { unitType, type, tx, intl, stateData } = props;
  const provider = tx && tx.provider;
  const listing = tx && tx.listing;
  const booking = tx && tx.booking;
  // const { provider, listing, booking } = tx;

  return (
    <div className={css.cardContainer}>
      <div className={css.dateInfo}>
        <span>{moment(booking?.attributes?.start).format('dddd')}</span>
        <span className={css.stday}>{moment(booking?.attributes?.start).format('DD')}</span>
        <span>{`${moment(booking?.attributes?.start).format('MMM')},${moment(
          booking?.attributes?.start
        ).format('YYYY')}`}</span>
      </div>
      <div className={css.horizontal}>
        <div className={css.statusContainer}>
          {stateData === 'pending' ? (
            <p className={css.status}>Pending Confimation</p>
          ) : stateData === 'upcoming' ? (
            <p className={`${css.status} ${css.statuspending}`}>Pending</p>
          ) : stateData === 'completed' ? (
            <p className={`${css.status} ${css.statuscom}`}>Completed</p>
          ) : (
            ''
          )}
        </div>
        <div className={css.providerAndListing}>
          <div className={css.listingDurationDeadline}>
            <div className={css.startTime}>
              <img src="/static/icons/timeicon.png" />
              {moment(booking.attributes.start).format('hh:mm a')}
            </div>

            <p className={css.listingInfo}>{listing?.attributes?.title}</p>

            <div className={css.durationDeadline}>
              {listing?.attributes?.publicData?.category !== 'customService' ? (
                <span className={css.duration}>
                  <span>Duration: </span>
                  {listing?.attributes?.publicData?.durationHour > 0
                    ? `${listing?.attributes?.publicData?.durationHour} Hour`
                    : ''}
                  {listing?.attributes?.publicData?.durationMinute > 0
                    ? `${listing?.attributes?.publicData?.durationMinute} Minute`
                    : ''}
                </span>
              ) : (
                <span className={css.deadline}>
                  <span>Deadline:</span> {listing?.attributes?.publicData?.deadline}
                </span>
              )}
            </div>
          </div>
          <div className={css.userContent}>
            <div className={css.SectionAvatarImg}>
              {/* <SectionAvatar user={listing.author} /> */}
              <AvatarMedium className={css.profileAvatar} user={provider} disableProfileLink />
            </div>
            <div className={css.userInfo}>
              <div className={css.userName}>{provider?.attributes?.profile?.displayName}</div>
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
          {stateData === 'pending' ? (
            <>
              <div className={css.cctxtp}>
                Please click on 'confirm' to confirm that you have recieved the consultation
              </div>
              <div className={css.profileBtnContainer}>
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

const AppointmentCard = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(AppointmentCardComponent);
export default AppointmentCard;
