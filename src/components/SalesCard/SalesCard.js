import React, { useState, useEffect } from 'react';
import { array, string, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { showUser } from '../../containers/ProfilePage/ProfilePage.duck';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import routeConfiguration from '../../routeConfiguration';
import { createResourceLocatorString } from '../../util/routes';
import { withRouter } from 'react-router-dom';
import css from './SalesCard.module.css';
import { AvatarMedium } from '..';
import biolocationIcon from '../../assets/material-location-on.svg';
import moment from 'moment';
import jsonwebtoken from 'jsonwebtoken';
import config from '../../config';
import Button, { PrimaryButton } from '../Button/Button';
import axios from 'axios';
import { txCustomerJoined1 } from '../../util/transaction';
import { apiBaseUrl } from '../../util/api';
function SalesCardComponent(props) {
  const [countryData, setCountryData] = useState();
  const [joinMeetingProgress, setJoinMeetingProgress] = useState(false);
  useEffect(() => {
    axios
      .get('https://countriesnow.space/api/v0.1/countries/states')
      .then(res => setCountryData(res.data.data))
      .catch(err => console.log('somer error occurred', err));
  }, []);
  const {
    unitType,
    type,
    tx,
    intl,
    stateData,
    onConfirmConsultation,
    confirmConsultationInProgress,
    confirmConsultationSuccess,
    history,
    onJoinMeeting,
    txBothJoined,
    txProviderJoined1,
  } = props;
  const provider = tx && tx.provider;
  const listing = tx && tx.listing;
  const booking = tx && tx.booking;
  const category = listing?.attributes?.publicData?.category;
  const listingType = listing?.attributes?.publicData?.type;
  const city = listing?.attributes?.publicData?.city[0];
  const country = countryData?.filter(
    c =>
      c.iso3 ===
      (listing?.attributes?.publicData?.country?.length > 0
        ? listing?.attributes?.publicData?.country[0]
        : '')
  )[0]?.name;
  const state = countryData
    ?.filter(c => c.iso3 === 'USA')[0]
    ?.states?.filter(s =>
      s.state_code === listing?.attributes?.publicData?.state?.length > 0
        ? listing?.attributes?.publicData?.state[0]
        : ''
    )[0]?.name;

  const goToConference = async transaction => {
    let startTime = transaction?.booking?.attributes?.start;
    let endTime = transaction?.booking?.attributes?.end;
    let transactionId = transaction?.id?.uuid;
    let listingId = transaction?.listing?.id?.uuid;
    let listingTitle = transaction?.listing?.attributes?.title;
    let transaction_customer_id = transaction?.customer?.id?.uuid;
    let transaction_provider_id = transaction?.provider?.id?.uuid;
    let role = 'provider';

    let actualStartTime;
    let customerJoinTime;

    // [{"transition":"transition/request-payment","createdAt":"2021-06-09T08:50:22.829Z","by":"customer"},{"transition":"transition/confirm-payment","createdAt":"2021-06-09T08:50:25.122Z","by":"customer"},{"transition":"transition/accept-short-booking","createdAt":"2021-06-09T09:01:02.036Z","by":"provider"},{"transition":"transition/short-booking-provider-join-1","createdAt":"2021-06-09T09:04:02.847Z","by":"provider"},{"transition":"transition/short-booking-customer-join-2","createdAt":"2021-06-09T09:04:06.660Z","by":"customer"}]

    let { transitions } = transaction?.attributes;
    // const isShortBooking =
    //   transaction &&
    //   transaction.attributes.protectedData &&
    //   transaction.attributes.protectedData.shortBooking;

    // let findActualStartTime =
    // // isShortBooking ? [TRANSITION_SHORT_BOOKING_PROVIDER_JOIN_2, TRANSITION_SHORT_BOOKING_CUSTOMER_JOIN_2]:
    //   [TRANSITION_PROVIDER_JOIN_1, TRANSITION_PROVIDER_JOIN_2];

    // Array.isArray(transitions) &&
    //   transitions.length &&
    //   transitions.forEach(item => {
    //     if (findActualStartTime.includes(item.transition)) {
    //       actualStartTime = item.createdAt;
    //     }
    //   });

    // let findCustomerJoinTime =
    // // isShortBooking ? [TRANSITION_SHORT_BOOKING_CUSTOMER_JOIN_1, TRANSITION_SHORT_BOOKING_CUSTOMER_JOIN_2] :
    //  [TRANSITION_CUSTOMER_JOIN_1, TRANSITION_CUSTOMER_JOIN_2];

    // Array.isArray(transitions) &&
    //   transitions.length &&
    //   transitions.forEach(item => {
    //     if (findCustomerJoinTime.includes(item.transition)) {
    //       customerJoinTime = item.createdAt;
    //     }
    //   });

    // console.log({ actualStartTime, customerJoinTime });

    if (!transactionId) {
      return;
    }
    const beforeBufferTime =
      transaction?.provider?.attributes?.profile?.publicData?.beforeBufferTime || 0;
    const afterBufferTime =
      transaction?.provider?.attributes?.profile?.publicData?.afterBufferTime || 0;

    let jwtToken = jsonwebtoken.sign(
      {
        startTime,
        endTime,
        transactionId,
        listingId,
        listingTitle,
        transaction_customer_id,
        transaction_provider_id,
        role,
        beforeBufferTime,
        afterBufferTime,
      },
      config.secretCode
    );
    setJoinMeetingProgress(false);
    window.open(`/meeting-new/${jwtToken}`);
    // this.props.history.push(`/meeting-new/${jwtToken}`);
    // console.log('555 token', jwtToken);
    // console.log('555 conf URL', config.canonicalRootURL + '/meeting-new/' + jwtToken);
  };

  // console.log(stateData, tx);
  // console.log(666, txCustomerJoined1(tx));

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
            <p className={`${css.status} ${css.statuspending}`}>Accepted</p>
          ) : stateData === 'complete' ? (
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
              {category !== 'customService' ? (
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
                {true ? (
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
        </div>
        <div className={css.bookingContent}>
          {stateData === 'pending' ? (
            <>
              {/* <div className={css.cctxtp}>
                Please click on 'confirm' to confirm that you have received the consultation
              </div> */}
              {/* <div className={css.profileBtnContainer}>
                <Button
                  className={css.confirmBtn}
                  inProgress={progress}
                  // ready={ready}
                  onClick={() => {
                    setProgress(false);
                    onConfirmConsultation(tx.id.uuid).then(resp => {
                      // console.log(resp);
                      history.push(
                        createResourceLocatorString(
                          'SalesBasepage',
                          routeConfiguration(),
                          // { id: resp.data.data.id.uuid },
                          {}
                        )
                      );
                    });
                  }}
                  
                >
                  <FormattedMessage id="AppointmentCard.confirmButton" />
                </Button>
              </div> */}
            </>
          ) : stateData === 'upcoming' ? (
            <>
              <div className={css.cctxtp}>Video Join button will appear here on time.</div>
              <div className={css.profileBtnContainer}>
                {category !== 'customService' ? (
                  <div className={css.profileBtn}>
                    <PrimaryButton
                      inProgress={joinMeetingProgress}
                      className={css.joinBtn}
                      onClick={() => {
                        setJoinMeetingProgress(true);
                        if (listingType === 'unsolicited') {
                          axios
                            .get(`${apiBaseUrl()}/api/unsolicitedTransition/${listing.id.uuid}`)
                            .then(resp => {
                              if (resp.data.length > 0) {
                                resp.data.map(d => {
                                  if (d !== tx.id) {
                                    onJoinMeeting(d, false);
                                  }
                                });
                                onJoinMeeting(tx.id, false)
                                  .then(res => {
                                    goToConference(tx);
                                  })
                                  .catch(e => {
                                    console.error(e);
                                  });
                              } else {
                                goToConference(tx);
                              }
                            });
                        } else {
                          if (txBothJoined(tx) || txProviderJoined1(tx)) {
                            goToConference(tx);
                          } else {
                            onJoinMeeting(tx.id, false)
                              .then(res => {
                                goToConference(tx);
                              })
                              .catch(e => {
                                console.error(e);
                              });
                          }
                        }
                      }}
                    >
                      Join Meeting
                    </PrimaryButton>
                  </div>
                ) : (
                  ''
                )}
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

SalesCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  setActiveListing: () => null,
  // country: config.custom.country,
};

SalesCardComponent.propTypes = {
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

const SalesCard = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(SalesCardComponent);
export default SalesCard;
