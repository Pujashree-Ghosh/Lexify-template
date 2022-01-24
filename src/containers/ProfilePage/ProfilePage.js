import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';
import { REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes } from '../../util/types';
import { ensureCurrentUser, ensureUser } from '../../util/data';
import { withViewport } from '../../util/contextHelpers';
import classNames from 'classnames';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  Page,
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  ListingCard,
  Footer,
  AvatarLarge,
  NamedLink,
  Reviews,
  ButtonTabNavHorizontal,
} from '../../components';
import { MdEmail, MdLocalPhone } from 'react-icons/md';
import { TopbarContainer, NotFoundPage } from '../../containers';
import config from '../../config';
import locationIcon from '../../assets/locationicon.svg';

import biolocationIcon from '../../assets/material-location-on.svg';
import biowebsite from '../../assets/feather-globe.svg';
import biophone from '../../assets/zocial-call.svg';
import biolinkedin from '../../assets/awesome-linkedin-in.svg';

import css from './ProfilePage.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 768;

export class ProfilePageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // keep track of which reviews tab to show in desktop viewport
      showReviewsType: REVIEW_TYPE_OF_PROVIDER,
      showProfileDetail: false,
      countryData: [],
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

  componentDidMount() {
    axios
      .get('https://countriesnow.space/api/v0.1/countries/states')
      .then(res => {
        this.setState({ countryData: res.data.data });
      })
      .catch(err => console.log('Error occurred', err));
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
      listings,
      areaOfLawOptions,
    } = this.props;
    //console.log(user);

    const ensuredCurrentUser = ensureCurrentUser(currentUser);
    const profileUser = ensureUser(user);
    const isCurrentUser =
      ensuredCurrentUser.id && profileUser.id && ensuredCurrentUser.id.uuid === profileUser.id.uuid;
    const displayName = profileUser.attributes.profile.displayName;
    const bio = profileUser.attributes.profile.bio;
    const hasBio = !!bio;
    const isMobileLayout = viewport.width < MAX_MOBILE_SCREEN_WIDTH;
    const publicData = user?.attributes?.profile?.publicData;

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
    const listingsContainerClasses = classNames(css.listingsContainer, {
      [css.withBioMissingAbove]: !hasBio,
    });
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
    const panelWidth = 62.5;

    const renderSizes = [
      `(max-width: 767px) 100vw`,
      `(max-width: 1920px) ${panelWidth / 2}vw`,
      `${panelWidth / 3}vw`,
    ].join(', ');
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
        {/* <LayoutWrapperSideNav className={css.aside}>{asideContent}</LayoutWrapperSideNav>*/}
        {/* <LayoutWrapperMain>{content}</LayoutWrapperMain> */}

        <div className={css.sectionContent}>
          {publicData?.isLawyer ? (
            <div className={css.lawyerProfile}>
              <div className={css.profileCard}>
                <div className={css.profileImage}>
                  <AvatarLarge className={css.avatar} user={user} disableProfileLink />
                  <span
                    className={css.profileViewLink}
                    onClick={() =>
                      this.setState({ showProfileDetail: !this.state.showProfileDetail })
                    }
                  >
                    {this.state.showProfileDetail ? 'View Listings' : 'View Profile'}
                  </span>
                </div>

                <div className={css.nameBio}>
                  <div className={css.profileName}>{user?.attributes?.profile?.displayName}</div>
                  <div className={css.locationBio}>
                    {/* <span>Licensed for 6 years</span> */}
                    <span>
                      <img src={locationIcon} /> New Jersey, USA
                    </span>
                    <p className={css.infotxtp}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua. Bibendum est ultricies integer
                      quis. Iaculis urna id volutpat lacus laoreet. Mauris vitae ultricies leo
                      integer malesuada. Ac odio tempor orci dapibus ultrices in. Egestas diam in
                      arcu cursus euismod. Dictum fusce ut
                    </p>
                  </div>
                </div>
              </div>

              {this.state.showProfileDetail ? (
                <div className={css.lawyerDetail}>
                  <hr />
                  <div className={css.sectionprofin}>
                    <div className={css.ClientId}>
                      <span>Lawyer ID</span>
                      <span>{user?.attributes?.profile?.publicData?.email}</span>
                    </div>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfilePage.practiceAre" />
                    </h3>
                    <div className={css.practiceArea}>
                      {publicData?.practice
                        ? publicData.practice.map(m => (
                            <span className={css.areaElement}>
                              {areaOfLawOptions.filter(o => o.key === m)[0]?.label}
                            </span>
                          ))
                        : '-'}
                    </div>
                  </div>
                  <div className={css.sectionprofin}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfilePage.language" />
                    </h3>
                    <div className={css.language}>
                      {publicData &&
                        publicData.languages &&
                        JSON.parse(publicData?.languages).map(l => (
                          <span className={css.areaElement}>{l.label}</span>
                        ))}
                    </div>
                  </div>
                  <div className={css.sectionprofin}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfilePage.contactInfo" />
                    </h3>
                    <div className={css.contact}>
                      <div className={css.cncol1}>
                        <div className={css.contacttag}>
                          <p>Office address</p>
                        </div>
                        <div className={css.contactinfo}>
                          <img src={biolocationIcon} />
                          <span>
                            <p>33 N Main St,</p>
                            <p>Law Office of Elliott J. Brown,</p>
                            <p>Marlboro, NJ,</p>
                            <p>USA 07746</p>
                          </span>
                        </div>
                      </div>

                      <div className={css.cncol1}>
                        <div className={css.contacttag}>
                          <p>Website</p>
                        </div>
                        <div className={css.contactinfo}>
                          <img className={css.mdalign} src={biowebsite} />

                          <span>
                            <a href="">www.scottbrown.com</a>
                          </span>
                        </div>
                      </div>

                      <div className={css.cncol1}>
                        <div className={css.contacttag}>
                          <p>Public phone number</p>
                        </div>
                        <div className={css.contactinfo}>
                          <img src={biophone} />

                          <span>
                            <p>{publicData?.phoneNumber}</p>
                          </span>
                        </div>
                      </div>

                      <div className={css.cncol1}>
                        <div className={css.contacttag}>
                          <p>Social</p>
                        </div>
                        <div className={css.contactinfo}>
                          <span>
                            <p>
                              <img src={biolinkedin} />
                              Linkedin
                            </p>
                            <p>
                              <img src={biolinkedin} />
                              Twitter
                            </p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={css.sectionprofin}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfilePage.professionalDetail" />
                    </h3>
                    <label>Jurisdiction</label>
                    <div className={css.profDetail}>
                      <table>
                        <th className={css.state}>Country</th>
                        <th className={css.status}>Status</th>
                        <th className={css.ao}>Acquired on</th>
                        {publicData?.jurisdictionPractice?.map(m => (
                          <tr>
                            <td className={css.state}>
                              {this.state.countryData.filter(c => c.iso3 === m.country)[0].name}
                            </td>
                            <td className={css.status}>{m.status}</td>
                            <td className={css.ao}>{m.date}</td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  </div>
                  <div className={css.sectionprofin}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfilePage.workExp" />
                    </h3>

                    <div className={`${css.profDetail} ${css.workexp}`}>
                      <table>
                        <th className={css.state}>Industry</th>
                        <th className={css.status}>Recent Work</th>
                        <th className={css.ao}>Year</th>
                        {publicData?.jurisdictionPractice?.map(m => (
                          <tr>
                            <td className={css.state}>Transportation</td>
                            <td className={css.status}>
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            </td>
                            <td className={css.ao}>2020</td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  </div>
                  <div className={css.sectionprofin}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfilePage.education" />
                    </h3>

                    <div className={`${css.profDetail} ${css.education}`}>
                      <table>
                        <th className={css.state}>Institute</th>
                        <th className={css.status}>Degree</th>
                        <th className={css.ao}>Graduated</th>
                        {publicData?.education?.map(m => (
                          <tr>
                            <td className={css.state}>{m.instituteName}</td>
                            <td className={css.status}>{m.degree}</td>
                            <td className={css.ao}>{m.graduationYear}</td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={listingsContainerClasses}>
                  <h2 className={css.listingsTitle}>
                    {/* <FormattedMessage
                      id="ProfilePage.listingsTitle"
                      values={{ count: listings.length }}
                    /> */}
                    Consultations provided by {user?.attributes?.profile?.displayName}
                  </h2>
                  <ul className={css.listings}>
                    {listings
                      .filter(li => li?.attributes?.publicData?.category === 'publicOral')
                      ?.map(l => (
                        <li className={css.listing} key={l.id.uuid}>
                          <ListingCard listing={l} renderSizes={renderSizes} />
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          ) : publicData?.clientType === 'privateIndividual' ? (
            <div className={css.privateIndividual}>
              <div className={css.ClientId}>
                <span>#Client email</span>
                <span>{user?.attributes?.profile?.publicData?.email}</span>
              </div>
              <div className={css.cdrowclnt}>
                <div className={css.coDetail}>Client Details</div>
                <div className={css.profileCard}>
                  <div className={css.profileImage}>
                    <AvatarLarge className={css.avatar} user={user} disableProfileLink />
                  </div>
                  <div className={css.nameBio}>
                    <div className={css.profileName}>{user?.attributes?.profile?.displayName}</div>
                    <div className={css.locationBio}>
                      <p>
                        <MdLocalPhone />
                        <span>{publicData?.phoneNumber}</span>
                      </p>
                      <p>
                        <MdEmail />
                        <span>{publicData?.email}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`${css.coInfo} ${css.pInfo}`}>
                  <div className={css.infoclnrow}>
                    <span className={css.coleftrow}>Country </span>
                    <span>{publicData?.privateIndividual?.country}</span>
                  </div>
                  <div className={css.infoclnrow}>
                    <span className={css.coleftrow}>Street </span>
                    <span>{publicData?.privateIndividual?.street}</span>
                  </div>
                  <div className={css.infoclnrow}>
                    <span className={css.coleftrow}>City </span>
                    <span>{publicData?.privateIndividual?.city}</span>
                  </div>
                  <div className={css.infoclnrow}>
                    <span className={css.coleftrow}>State </span>
                    <span>{publicData?.privateIndividual?.state}</span>
                  </div>
                  <div className={css.infoclnrow}>
                    <span className={css.coleftrow}>ZIP Code/Postal Code </span>
                    <span>{publicData?.privateIndividual?.zipCode}</span>
                  </div>
                  <div className={css.infoclnrow}>
                    <span className={css.coleftrow}>Languages </span>
                    <div className={css.lan}>
                      {publicData &&
                        publicData.languages &&
                        JSON.parse(publicData?.languages).map(l => (
                          <span className={css.language}>{l.label},</span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={css.legal}>
              <div className={css.ClientId}>
                <span>#Client email</span>
                <span>{user?.attributes?.profile?.publicData?.email}</span>
                {/*<span>{user?.id?.uuid}</span>*/}
              </div>

              <div className={css.cdrowclnt}>
                <div className={css.coDetail}>Company Details</div>
                <div className={css.profileCard}>
                  <div className={css.coInfo}>
                    <div className={css.infoclnrow}>
                      <span className={css.coleftrow}>Company name </span>
                      <span>
                        <strong>{publicData?.legalEntity?.companyName}</strong>
                      </span>
                    </div>
                    <div className={css.infoclnrow}>
                      <span className={css.coleftrow}>Country </span>

                      <span>
                        {
                          /*publicData?.legalEntity?.country*/
                          this.state.countryData.filter(
                            c => c.iso3 === publicData?.legalEntity?.country
                          )[0]?.name
                        }
                      </span>
                    </div>
                    <div className={css.infoclnrow}>
                      <span className={css.coleftrow}>Street </span>
                      <span>{publicData?.legalEntity?.street}</span>
                    </div>
                    <div className={css.infoclnrow}>
                      <span className={css.coleftrow}>City </span>
                      <span>{publicData?.legalEntity?.city}</span>
                    </div>
                    <div className={css.infoclnrow}>
                      <span className={css.coleftrow}>State </span>
                      <span>{publicData?.legalEntity?.state}</span>
                    </div>
                    <div className={css.infoclnrow}>
                      <span className={css.coleftrow}>ZIP Code/Postal Code </span>
                      <span>{publicData?.legalEntity?.zipCode}</span>
                    </div>
                    <div className={css.infoclnrow}>
                      <span className={css.coleftrow}>Languages </span>
                      <div className={css.lan}>
                        {publicData &&
                          publicData.languages &&
                          JSON.parse(publicData?.languages).map(l => (
                            <span className={css.language}>{l.label},</span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={css.cdrowclnt}>
                <div className={css.coDetail}>Company Manager Details</div>
                <div className={css.profileCard}>
                  <div className={css.profileImage}>
                    <AvatarLarge className={css.avatar} user={user} disableProfileLink />
                  </div>
                  <div className={css.nameBio}>
                    <div className={css.profileName}>{user?.attributes?.profile?.displayName}</div>
                    <div className={css.locationBio}>
                      <p>
                        <MdLocalPhone />
                        <span>{publicData?.phoneNumber}</span>
                      </p>

                      <p>
                        <MdEmail />
                        <span>{publicData?.email}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
  areaOfLawOptions: config.custom.areaOfLaw.options,
};

const { bool, arrayOf, number, shape } = PropTypes;

ProfilePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUser: propTypes.currentUser,
  user: propTypes.user,
  userShowError: propTypes.error,
  reviews: arrayOf(propTypes.review),
  queryReviewsError: propTypes.error,
  areaOfLawOptions: propTypes.areaOfLawOptions,

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
  const { userId, userShowError, reviews, queryReviewsError, userListingRefs } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{ type: 'user', id: userId }]);
  const listings = getMarketplaceEntities(state, userListingRefs);
  const user = userMatches.length === 1 ? userMatches[0] : null;

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    user,
    userShowError,
    reviews,
    listings,
    queryReviewsError,
  };
};

const ProfilePage = compose(
  connect(mapStateToProps),
  withViewport,
  injectIntl
)(ProfilePageComponent);

export default ProfilePage;
