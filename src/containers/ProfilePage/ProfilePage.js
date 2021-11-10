import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes } from '../../util/types';
import { ensureCurrentUser, ensureUser } from '../../util/data';
import { withViewport } from '../../util/contextHelpers';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  Page,
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  AvatarLarge,
  NamedLink,
  Reviews,
  ButtonTabNavHorizontal,
} from '../../components';
import { MdEmail, MdLocalPhone } from 'react-icons/md';
import { TopbarContainer, NotFoundPage } from '../../containers';
import config from '../../config';

import css from './ProfilePage.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 768;

export class ProfilePageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // keep track of which reviews tab to show in desktop viewport
      showReviewsType: REVIEW_TYPE_OF_PROVIDER,
    };

    this.showOfProviderReviews = this.showOfProviderReviews.bind(this);
    this.showOfCustomerReviews = this.showOfCustomerReviews.bind(this);
  }

  showOfProviderReviews() {
    this.setState({
      showReviewsType: REVIEW_TYPE_OF_PROVIDER,
    });
  }

  showOfCustomerReviews() {
    this.setState({
      showReviewsType: REVIEW_TYPE_OF_CUSTOMER,
    });
  }

  render() {
    const {
      scrollingDisabled,
      currentUser,
      user,
      userShowError,
      reviews,
      queryReviewsError,
      viewport,
      intl,
    } = this.props;
    // console.log(user);

    const ensuredCurrentUser = ensureCurrentUser(currentUser);
    const profileUser = ensureUser(user);
    const isCurrentUser =
      ensuredCurrentUser.id && profileUser.id && ensuredCurrentUser.id.uuid === profileUser.id.uuid;
    const displayName = profileUser.attributes.profile.displayName;
    const bio = profileUser.attributes.profile.bio;
    const hasBio = !!bio;
    const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;
    const publicData = user?.attributes?.profile?.publicData;
    console.log(publicData, user?.attributes?.profile);

    // console.log(profileUser, currentUser);

    const editLinkMobile = isCurrentUser ? (
      <NamedLink className={css.editLinkMobile} name="ProfileSettingsPage">
        <FormattedMessage id="ProfilePage.editProfileLinkMobile" />
      </NamedLink>
    ) : null;
    const editLinkDesktop = isCurrentUser ? (
      <NamedLink className={css.editLinkDesktop} name="ProfileSettingsPage">
        <FormattedMessage id="ProfilePage.editProfileLinkDesktop" />
      </NamedLink>
    ) : null;

    const asideContent = (
      <div className={css.asideContent}>
        <AvatarLarge className={css.avatar} user={user} disableProfileLink />
        <h1 className={css.mobileHeading}>
          {displayName ? (
            <FormattedMessage id="ProfilePage.mobileHeading" values={{ name: displayName }} />
          ) : null}
        </h1>
        {editLinkMobile}
        {editLinkDesktop}
      </div>
    );

    const reviewsError = (
      <p className={css.error}>
        <FormattedMessage id="ProfilePage.loadingReviewsFailed" />
      </p>
    );

    const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);

    const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);

    const mobileReviews = (
      <div className={css.mobileReviews}>
        <h2 className={css.mobileReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsOfProviderTitle"
            values={{ count: reviewsOfProvider.length }}
          />
        </h2>
        {queryReviewsError ? reviewsError : null}
        <Reviews reviews={reviewsOfProvider} />
        <h2 className={css.mobileReviewsTitle}>
          <FormattedMessage
            id="ProfilePage.reviewsOfCustomerTitle"
            values={{ count: reviewsOfCustomer.length }}
          />
        </h2>
        {queryReviewsError ? reviewsError : null}
        <Reviews reviews={reviewsOfCustomer} />
      </div>
    );

    const desktopReviewTabs = [
      {
        text: (
          <h3 className={css.desktopReviewsTitle}>
            <FormattedMessage
              id="ProfilePage.reviewsOfProviderTitle"
              values={{ count: reviewsOfProvider.length }}
            />
          </h3>
        ),
        selected: this.state.showReviewsType === REVIEW_TYPE_OF_PROVIDER,
        onClick: this.showOfProviderReviews,
      },
      {
        text: (
          <h3 className={css.desktopReviewsTitle}>
            <FormattedMessage
              id="ProfilePage.reviewsOfCustomerTitle"
              values={{ count: reviewsOfCustomer.length }}
            />
          </h3>
        ),
        selected: this.state.showReviewsType === REVIEW_TYPE_OF_CUSTOMER,
        onClick: this.showOfCustomerReviews,
      },
    ];

    const desktopReviews = (
      <div className={css.desktopReviews}>
        <ButtonTabNavHorizontal className={css.desktopReviewsTabNav} tabs={desktopReviewTabs} />

        {queryReviewsError ? reviewsError : null}

        {this.state.showReviewsType === REVIEW_TYPE_OF_PROVIDER ? (
          <Reviews reviews={reviewsOfProvider} />
        ) : (
          <Reviews reviews={reviewsOfCustomer} />
        )}
      </div>
    );

    const mainContent = (
      <div>
        <h1 className={css.desktopHeading}>
          <FormattedMessage id="ProfilePage.desktopHeading" values={{ name: displayName }} />
        </h1>
        {hasBio ? <p className={css.bio}>{bio}</p> : null}
        {isMobileLayout ? mobileReviews : desktopReviews}
      </div>
    );

    let content;

    if (userShowError && userShowError.status === 404) {
      return <NotFoundPage />;
    } else if (userShowError) {
      content = (
        <p className={css.error}>
          <FormattedMessage id="ProfilePage.loadingDataFailed" />
        </p>
      );
    } else {
      content = mainContent;
    }

    const schemaTitle = intl.formatMessage(
      {
        id: 'ProfilePage.schemaTitle',
      },
      {
        name: displayName,
        siteTitle: config.siteTitle,
      }
    );

    return (
      <Page
        scrollingDisabled={scrollingDisabled}
        title={schemaTitle}
        schema={{
          '@context': 'http://schema.org',
          '@type': 'ProfilePage',
          name: schemaTitle,
        }}
      >
        {/* <LayoutSideNavigation> */}
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ProfilePage" />
        </LayoutWrapperTopbar>
        {/* <LayoutWrapperSideNav className={css.aside}>{asideContent}</LayoutWrapperSideNav>
          <LayoutWrapperMain>{content}</LayoutWrapperMain> */}
        {publicData?.isLawyer ? (
          <div className={css.lawyerProfile}>
            <div className={css.profileCard}>
              <div className={css.profileImage}>
                <AvatarLarge className={css.avatar} user={user} disableProfileLink />
              </div>
              <div className={css.nameBio}>
                <div className={css.profileName}>{user?.attributes?.profile?.displayName}</div>
                <div className={css.locationBio}>
                  <span>Certificate Year</span>
                  <span>Location</span>
                  <span>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Bibendum est ultricies integer
                    quis. Iaculis urna id volutpat lacus laoreet. Mauris vitae ultricies leo integer
                    malesuada. Ac odio tempor orci dapibus ultrices in. Egestas diam in arcu cursus
                    euismod. Dictum fusce ut
                  </span>
                </div>
              </div>
            </div>

            <div className={css.lawyerDetail}>
              <hr />
              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfilePage.practiceAre" />
                </h3>
                <div className={css.practiceArea}>
                  {publicData?.practice.map(m => (
                    <span className={css.areaElement}>{m.area}</span>
                  ))}
                </div>
              </div>
              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfilePage.language" />
                </h3>
                <div className={css.language}>
                  {/* {publicData?.language.map(m => (
                <span className={css.areaElement}>{m.area}</span>
              ))} */}
                  {publicData &&
                    publicData.languages &&
                    JSON.parse(publicData?.languages).map(l => (
                      <span className={css.language}>{l.label}</span>
                    ))}
                </div>
              </div>
              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfilePage.contactInfo" />
                </h3>
                <div className={css.contact}>
                  {/* {publicData?.practice.map(m => (
                <span className={css.areaElement}>{m.area}</span>
              ))} */}
                </div>
              </div>
              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfilePage.professionalDetail" />
                </h3>
                <div className={css.profDetail}>
                  <label>Jurisdiction</label>
                  <table>
                    <th>State</th>
                    <th>Status</th>
                    <th>Acquired on</th>
                    {publicData?.jurisdictionPractice.map(m => (
                      <tr>
                        <td>{m.country}</td>
                        <td>{m.status}</td>
                        <td>{m.date}</td>
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfilePage.workExp" />
                </h3>
                <div className={css.workExp}>
                  {/* {publicData?.practice.map(m => (
                <span className={css.areaElement}>{m.area}</span>
              ))} */}
                </div>
              </div>
              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfilePage.education" />
                </h3>
                <div className={css.education}>
                  <table>
                    <th>Institute</th>
                    <th>Degree</th>
                    <th>Graduated</th>
                    {publicData?.education.map(m => (
                      <tr>
                        <td>{m.instituteName}</td>
                        <td>{m.degree}</td>
                        <td>{m.graduationYear}</td>
                      </tr>
                    ))}
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : publicData?.clientType === 'privateIndividual' ? (
          <div className={css.privateIndividual}>
            <div className={css.ClientId}>
              <span>#Client Id</span>
              <span>{'12345678'}</span>
            </div>
            <div className={css.clDetail}>Client Details</div>
            <div className={css.profileCard}>
              <hr />
              <div className={css.profileImage}>
                <AvatarLarge className={css.avatar} user={user} disableProfileLink />
              </div>
              <div className={css.nameBio}>
                <div className={css.profileName}>{user?.attributes?.profile?.displayName}</div>
                <div className={css.locationBio}>
                  <MdLocalPhone />
                  <span>{publicData?.phoneNumber}</span>
                  <br />
                  <MdEmail />
                  <span>{publicData?.email}</span>
                  <div className={css.pInfo}>
                    <span>Country </span>
                    <span>{publicData?.privateIndividual?.country}</span>
                    <br />
                    <span>Street </span>
                    <span>{publicData?.privateIndividual?.street}</span>
                    <br />
                    <span>City </span>
                    <span>{publicData?.privateIndividual?.city}</span>
                    <br />
                    <span>State </span>
                    <span>{publicData?.privateIndividual?.state}</span>
                    <br />
                    <span>ZIP Code/Postal Code </span>
                    <span>{publicData?.privateIndividual?.zipCode}</span>
                    <br />
                    <span>Languages </span>
                    {publicData &&
                      publicData.languages &&
                      JSON.parse(publicData?.languages).map(l => (
                        <span className={css.language}>{l.label}</span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={css.legal}>
            <div className={css.ClientId}>
              <span>#Client Id</span>
              <span>{'12345678'}</span>
            </div>
            <div className={css.coDetail}>Company Details</div>
            <div className={css.profileCard}>
              <hr />
              <div className={css.coInfo}>
                <span>Company name </span>
                <span>{publicData?.legalEntity?.country}</span>
                <br />
                <span>Country </span>
                <span>{publicData?.legalEntity?.country}</span>
                <br />
                <span>Street </span>
                <span>{publicData?.legalEntity?.street}</span>
                <br />
                <span>City </span>
                <span>{publicData?.legalEntity?.city}</span>
                <br />
                <span>State </span>
                <span>{publicData?.legalEntity?.state}</span>
                <br />
                <span>ZIP Code/Postal Code </span>
                <span>{publicData?.legalEntity?.zipCode}</span>
                <br />
                <span>Languages </span>
                {publicData &&
                  publicData.languages &&
                  JSON.parse(publicData?.languages).map(l => (
                    <span className={css.language}>{l.label}</span>
                  ))}
              </div>
            </div>
            <div className={css.managerDetail}>Company Manager Details</div>
            <div className={css.profileCard}>
              <hr />
              <div className={css.profileImage}>
                <AvatarLarge className={css.avatar} user={user} disableProfileLink />
              </div>
              <div className={css.nameBio}>
                <div className={css.profileName}>{user?.attributes?.profile?.displayName}</div>
                <div className={css.locationBio}>
                  <MdLocalPhone />
                  <span>{publicData?.phoneNumber}</span>
                  <br />
                  <MdEmail />
                  <span>{publicData?.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
        {/* </LayoutSideNavigation> */}
      </Page>
    );
  }
}

ProfilePageComponent.defaultProps = {
  currentUser: null,
  user: null,
  userShowError: null,
  reviews: [],
  queryReviewsError: null,
};

const { bool, arrayOf, number, shape } = PropTypes;

ProfilePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  user: propTypes.user,
  userShowError: propTypes.error,
  reviews: arrayOf(propTypes.review),
  queryReviewsError: propTypes.error,

  // form withViewport
  viewport: shape({
    width: number.isRequired,
    height: number.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const { userId, userShowError, reviews, queryReviewsError } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{ type: 'user', id: userId }]);
  const user = userMatches.length === 1 ? userMatches[0] : null;
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    user,
    userShowError,
    reviews,
    queryReviewsError,
  };
};

const ProfilePage = compose(
  connect(mapStateToProps),
  withViewport,
  injectIntl
)(ProfilePageComponent);

export default ProfilePage;
