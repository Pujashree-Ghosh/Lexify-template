import React, { useState, useEffect } from 'react';
import { apiBaseUrl } from '../../util/api';
import { array, string, func } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import config from '../../config';
import jsonwebtoken from 'jsonwebtoken';
import { withRouter } from 'react-router-dom';
import css from './VerificationCard.module.css';
import { ensureUser } from '../../util/data';
import { types as sdkTypes } from '../../util/sdkLoader';
const { UUID } = sdkTypes;
import { showUser } from '../../containers/ProfilePage/ProfilePage.duck';
import moment from 'moment';
import { AvatarMedium } from '../Avatar/Avatar';
import { PrimaryButton } from '../Button/Button';
import { createResourceLocatorString } from '../../util/routes';
import routeConfiguration from '../../routeConfiguration';
import axios from 'axios';

function VerificationCardComponent(props) {
  const { _id, start, customerId, end, meetingLink } = props.detail;
  const { onShowUser, history } = props;
  const [user, setUser] = useState();
  const [verificationProgress, setVerificationProgress] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      const resp = await onShowUser(new UUID(customerId));
      setUser({
        ...resp.data.data,
        profileImage: resp.data.included?.find(f => f.type === 'image'),
      });
    };
    fetchUser();
  }, []);

  const ensuredUser = ensureUser(user);

  return (
    <div key={_id}>
      <div className={css.cardContainer}>
        <div className={css.dateInfo}>
          <span>{moment(start).format('dddd')}</span>
          <span className={css.stday}>{moment(start).format('DD')}</span>
          <span>{`${moment(start).format('MMM')},${moment(start).format('YYYY')}`}</span>
        </div>
        <div className={css.horizontal}>
          <div className={css.statusContainer}>
            <p className={`${css.status} ${css.statuspending}`}>Verification</p>
          </div>

          <div className={css.providerAndListing}>
            <div className={css.listingDurationDeadline}>
              <div className={css.startTime}>
                <img src="/static/icons/timeicon.png" />
                {moment(start).format('hh:mm a')}
              </div>
            </div>

            <div className={css.userContent}>
              <div className={css.SectionAvatarImg}>
                <AvatarMedium className={css.profileAvatar} user={user} disableProfileLink />
              </div>
              <div className={css.userInfo}>
                <div className={css.userName}>{user?.attributes?.profile?.displayName}</div>
              </div>
            </div>
          </div>
          {moment().isAfter(end) ? (
            <div className={css.bookingContent}>
              <div className={css.cctxtp}>Click verify to verify the user</div>
              <div className={css.profileBtnContainer}>
                <PrimaryButton
                  inProgress={verificationProgress}
                  className={css.joinBtn}
                  onClick={() => {
                    setVerificationProgress(true);
                    let jwtToken = jsonwebtoken.sign(
                      {
                        lawyerId: customerId,
                      },
                      config.secretCode
                    );
                    axios
                      .post(`${apiBaseUrl()}/api/verifyLawyer`, {
                        token: jwtToken,
                      })
                      .then(() => {
                        axios
                          .post(`${apiBaseUrl()}/api/markAsVerified`, {
                            id: _id,
                          })
                          .then(() => {
                            history.push(
                              createResourceLocatorString(
                                'Salespage',
                                routeConfiguration(),
                                { tab: 'verification' },
                                {}
                              )
                            );
                          });
                      });
                  }}
                >
                  Verify User
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className={css.bookingContent}>
              <div className={css.cctxtp}>Video Join button will appear here on time.</div>
              <div className={css.profileBtnContainer}>
                <PrimaryButton
                  // inProgress={joinMeetingProgress}
                  className={css.joinBtn}
                  onClick={() => {
                    window.open(`/meeting-new/${meetingLink}`);
                  }}
                >
                  Join Meeting
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  const { currentUser } = state.user;

  return {
    currentUser,
  };
};
const mapDispatchToProps = dispatch => ({
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfile: data => dispatch(updateProfile(data)),
  onShowUser: data => dispatch(showUser(data)),
  onShowListing: data => dispatch(showListing(data)),
});

const VerificationCard = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(VerificationCardComponent);

export default VerificationCard;
