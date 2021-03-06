import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { MdModeEditOutline } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';
import { withRouter } from 'react-router-dom';

import config from '../../config';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes, LISTING_STATE_DRAFT, LISTING_STATE_CLOSED } from '../../util/types';
import { ensureListing } from '../../util/data';
import { createResourceLocatorString } from '../../util/routes';
import { ensureUser } from '../../util/data';
import routeConfiguration from '../../routeConfiguration';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  InlineTextButton,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  ManageListingCard,
  Page,
  PaginationLinks,
  UserNav,
  NamedLink,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import MenuIcon from '../../components/ManageListingCard/MenuIcon';
import Overlay from '../../components/ManageListingCard/Overlay';
import { TopbarContainer } from '../../containers';
import { formatMoney } from '../../util/currency';
import {
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../util/urlHelpers';

import {
  closeListing,
  openListing,
  getOwnListingsById,
} from './../../containers/ManageListingsPage/ManageListingsPage.duck';
import css from './AppointmentPage.module.css';
import AppointmentCard from '../AppointmentCard/AppointmentCard';
import { data } from 'sharetribe-flex-integration-sdk';
// import ReadmoreButton from '../ReadmoreButton/ReadmoreButton';

const MENU_CONTENT_OFFSET = -12;

const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};
// const isControlledMenu = (isOpenProp, onToggleActiveProp) => {
//   return isOpenProp !== null && onToggleActiveProp !== null;
// };

export class AppointmentPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listingMenuOpen: null,
      appointmentStatus: 'all',
    };
    this.onToggleMenu = this.onToggleMenu.bind(this);
  }

  onToggleMenu(listing) {
    this.setState({ listingMenuOpen: listing });
  }

  render() {
    const {
      closingListing,
      closingListingError,
      listings,
      isMenuOpen,
      actionsInProgressListingId,
      onCloseListing,
      onOpenListing,
      openingListing,
      openingListingError,
      pagination,
      history,
      queryInProgress,
      queryListingsError,
      queryParams,
      scrollingDisabled,
      intl,
    } = this.props;
    console.log('sate', this.state.appointmentStatus);
    const demoData = [
      {
        index: 1,
        startDate: {
          dayOfWeek: 'Monday',
          day: 10,
          month: 'May',
          year: 2022,
        },
        listingTitle: 'Consultation with Lawyer',
        duration: 1,
        authorName: 'Dibya Mondal',
        pending: true,
        upcoming: false,
        completed: false,
      },
      {
        index: 2,
        startDate: {
          dayOfWeek: 'Tuesday',
          day: 11,
          month: 'May',
          year: 2022,
        },
        listingTitle: 'Consultation program time',
        duration: 2,
        authorName: 'Aybid ladnom',
        pending: false,
        upcoming: true,
        completed: false,
      },
      {
        index: 3,
        startDate: {
          dayOfWeek: 'Wednesday',
          day: 13,
          month: 'June',
          year: 2022,
        },
        listingTitle: 'Test Test Consultation',
        duration: 2,
        authorName: 'Test Lawyer',
        pending: false,
        upcoming: false,
        completed: true,
      },
    ];
    const yourAppointments = <FormattedMessage id="AppointmentPage.yourAppointments" />;

    const hasPaginationInfo = !!pagination && pagination.totalItems != null;
    const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

    const loadingResults = (
      <h2>
        <FormattedMessage id="ManageListingsPage.loadingOwnListings" />
      </h2>
    );

    const queryError = (
      <h2 className={css.error}>
        <FormattedMessage id="ManageListingsPage.queryError" />
      </h2>
    );

    const noResults =
      listingsAreLoaded && pagination.totalItems <= 1 ? (
        <h1 className={css.title}>
          <FormattedMessage id="ManageListingsPage.noResults" />
        </h1>
      ) : null;

    const heading =
      listingsAreLoaded && pagination.totalItems > 1 ? (
        <h1 className={css.title}>
          <FormattedMessage
            id="AppointmentPage.youHaveListings"
            values={{ count: pagination.totalItems - 1 }}
          />
        </h1>
      ) : (
        noResults
      );

    const page = queryParams ? queryParams.page : 1;
    const paginationLinks =
      listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
        <PaginationLinks
          className={css.pagination}
          pageName="AppointmentPage"
          pageSearchParams={{ page }}
          pagination={pagination}
        />
      ) : null;

    const listingMenuOpen = this.state.listingMenuOpen;
    const closingErrorListingId = !!closingListingError && closingListingError.listingId;
    const openingErrorListingId = !!openingListingError && openingListingError.listingId;

    const title = intl.formatMessage({ id: 'AppointmentPage.title' });

    const panelWidth = 62.5;
    // Render hints for responsive image
    const renderSizes = [
      `(max-width: 767px) 100vw`,
      `(max-width: 1920px) ${panelWidth / 2}vw`,
      `${panelWidth / 3}vw`,
    ].join(', ');
    const menuItemClasses = classNames(css.menuItem, {
      [css.menuItemDisabled]: !!actionsInProgressListingId,
    });
    const option = 'select an option';
    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="AppointmentPage" />
            <UserNav selectedPageName="AppointmentPage" />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            {queryInProgress ? loadingResults : null}
            {queryListingsError ? queryError : null}
            <div className={css.listingPanel}>
              <div className={css.heading}>{yourAppointments}</div>
              <div className={css.appointmentFilter}>
                <select
                  value={this.state.appointmentStatus}
                  onChange={e => this.setState({ appointmentStatus: e.target.value })}
                >
                  <option value="all">Select an option</option>
                  <option value="completed">Completed</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              {demoData.map(d => {
                <AppointmentCard key={d.index} data={d} />;
              })}
              <div>
                {this.state.appointmentStatus === 'all'
                  ? demoData.map(d => <AppointmentCard key={d.index} data={d} />)
                  : ''}
                {this.state.appointmentStatus === 'completed'
                  ? demoData
                      .filter(dd => dd.completed === true)
                      .map(d => <AppointmentCard key={d.index} data={d} />)
                  : ''}

                {this.state.appointmentStatus === 'upcoming'
                  ? demoData
                      .filter(dd => dd.upcoming === true)
                      .map(d => <AppointmentCard key={d.index} data={d} />)
                  : ''}

                {this.state.appointmentStatus === 'pending'
                  ? demoData
                      .filter(dd => dd.pending === true)
                      .map(d => <AppointmentCard key={d.index} data={d} />)
                  : ''}
              </div>

              {/* {demoData.map(d => {
                this.state.appointmentStatus === '' ? (
                  <AppointmentCard key={d.index} data={d} />
                ) : null;
                this.state.appointmentStatus === '' ?
              })} */}

              {/* <div className={css.listingCards}>
                {listings
                  .filter(f => f?.attributes?.publicData?.isProviderType !== true)
                  .map(l => (
                    <ManageListingCard
                      className={css.listingCard}
                      key={l.id.uuid}
                      listing={l}
                      isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                      actionsInProgressListingId={openingListing || closingListing}
                      onToggleMenu={this.onToggleMenu}
                      onCloseListing={onCloseListing}
                      onOpenListing={onOpenListing}
                      hasOpeningError={openingErrorListingId.uuid === l.id.uuid}
                      hasClosingError={closingErrorListingId.uuid === l.id.uuid}
                      renderSizes={renderSizes}
                    />
                  ))}
              </div> */}
              <div>
                {/* <div>
                  {listings.map((m, i) => {
                    const { price, state } = m.attributes;
                    const isDraft = state === LISTING_STATE_DRAFT;
                    const isClosed = state === LISTING_STATE_CLOSED;
                    const editListingLinkType = isDraft
                      ? LISTING_PAGE_PARAM_TYPE_DRAFT
                      : LISTING_PAGE_PARAM_TYPE_EDIT;

                    const { formattedPrice } = priceData(price, intl);
                    const id = m.id.uuid;
                    const slug = createSlug(m?.attributes?.title);
                    let listingOpen = null;
                    const ensuredUser = ensureUser(m.author);

                    return (
                      <div className={css.horizontalcard} key={id}>
                        {/* leftdiv */}
                {/* <div className={css.lefthorizontal}>
                          {isDraft ? (
                            <div className={css.lefttitle}>{m?.attributes?.title}</div>
                          ) : (
                            <NamedLink
                              className={css.manageLink}
                              name="ListingPage"
                              params={{ id, slug }}
                            >
                              <div className={css.lefttitle}> {m?.attributes?.title}</div>
                            </NamedLink>
                          )}

                          <ReadmoreButton */}
                {/* // className={css.description}
                            description={m?.attributes?.description}
                          /> */}
              </div>
              {/* rightdiv */}
              {/* <div className={css.righthorizontal}> */}
              {/* rightlowerdiv */}
              {/* <div>
                            {isDraft ? (
                              <span className={css.span}>UNPUBLISHED</span>
                            ) : (
                              <span className={css.span}> PUBLISHED</span>
                            )}
                          </div>
                          <span className={css.price}> {formattedPrice} </span>
                          <button
                            className={css.editbutton}
                            onClick={() =>
                              history.push(
                                createResourceLocatorString(
                                  'EditListingPage',
                                  routeConfiguration(),
                                  { id, slug, type: editListingLinkType, tab: 'description' },
                                  {} */}
              {/* )
                              )
                            }
                          >
                            <MdModeEditOutline />{' '}
                            <FormattedMessage id="ManageListingCard.editListing" /> */}
              {/* <NamedLink
                              // className={css.manageLink}
                              className={css.linkcolor}
                              name="EditListingPage"
                              params={{ id, slug, type: editListingLinkType, tab: 'description' }}
                            >
                              <MdModeEditOutline />{' '}
                              <FormattedMessage id="ManageListingCard.editListing" />
                            </NamedLink> */}
              {/* </button>
                        </div>
                        {!isDraft ? (
                          <Menu
                            className={classNames(css.menu, css.togglemenu, {
                              [css.cardIsOpen]: !isClosed,
                            })}
                            contentPlacementOffset={MENU_CONTENT_OFFSET}
                            contentPosition="left"
                            useArrow={false}
                            onToggleActive={isOpen => {
                              listingOpen = isOpen ? m : null;
                              console.log(listingOpen);
                              this.onToggleMenu(listingOpen);
                            }} */}
              {/* // isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                            // onToggleMenu={listingOpen}
                            isOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === m.id.uuid}
                          >
                            <MenuLabel
                              className={css.menuLabel}
                              isOpenClassName={css.listingMenuIsOpen}
                            >
                              <div className={css.iconWrapper}>
                                <MenuIcon className={css.menuIcon} isActive={isMenuOpen} />
                              </div>
                            </MenuLabel>
                            <MenuContent rootClassName={css.menuContent}>
                              <MenuItem key="close-listing">
                                <div className={css.inlinebutton}> */}
              {/* <IoMdClose />
                                  <InlineTextButton
                                    className={css.buttontext}
                                    // rootClassName={menuItemClasses}
                                    onClick={event => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      if (!actionsInProgressListingId) {
                                        this.onToggleMenu(null);
                                        onCloseListing(m.id);
                                      }
                                    }}
                                  >
                                    <FormattedMessage id="ManageListingCard.closeListing" />
                                  </InlineTextButton>
                                </div>
                              </MenuItem>
                            </MenuContent>
                          </Menu>
                        ) : null} */}
              {/* {isClosed ? (
                          <Overlay
                            message={intl.formatMessage(
                              { id: 'ManageListingCard.closedListing' },
                              { listingTitle: title }
                            )}
                          >
                            <button
                              className={css.openListingButton}
                              disabled={!!actionsInProgressListingId}
                              onClick={event => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (!actionsInProgressListingId) {
                                  onOpenListing(m.id);
                                }
                              }}
                            >
                              <FormattedMessage id="ManageListingCard.openListing" /> */}
              {/* </button>
                          </Overlay>
                        ) : null}
                      </div>
                    );
                  })}
                </div> */}
              {/* </div> */}
              {/* {paginationLinks} */}
            </div>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer />
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

AppointmentPageComponent.defaultProps = {
  listings: [],
  pagination: null,
  queryListingsError: null,
  queryParams: null,
  closingListing: null,
  closingListingError: null,
  openingListing: null,
  openingListingError: null,
};

const { arrayOf, bool, func, object, shape, string } = PropTypes;

AppointmentPageComponent.propTypes = {
  closingListing: shape({ uuid: string.isRequired }),
  closingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  listings: arrayOf(propTypes.ownListing),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  openingListing: shape({ uuid: string.isRequired }),
  openingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  pagination: propTypes.pagination,
  queryInProgress: bool.isRequired,
  queryListingsError: propTypes.error,
  queryParams: object,
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  } = state.ManageListingsPage;
  const listings = getOwnListingsById(state, currentPageResultIds);
  return {
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  };
};

// const mapStateToProps = state => state

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
});

const AppointmentPage = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(AppointmentPageComponent);

export default AppointmentPage;
