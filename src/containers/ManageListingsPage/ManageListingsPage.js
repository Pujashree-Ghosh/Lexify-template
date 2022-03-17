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
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';
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
import Select from 'react-select';
import { closeListing, openListing, getOwnListingsById } from './ManageListingsPage.duck';
import css from './ManageListingsPage.module.css';
import ReadmoreButton from '../ReadmoreButton/ReadmoreButton';

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

export class ManageListingsPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listingMenuOpen: null,
      statusSort: '',
      practiceAreaSort: '',
      typeSort: '',
      listingsFromApi: [],
      listingsFromApiLoaded: false,
    };
    this.onToggleMenu = this.onToggleMenu.bind(this);
  }
  componentDidMount() {
    // console.log(112, this.state.listingsFromApi);
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
      currentUser,
    } = this.props;

    console.log(444, this.state);

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
      listingsAreLoaded && this.state.listingsFromApi.length > 1 ? (
        <h1 className={css.title}>
          <FormattedMessage
            id="ManageListingsPage.youHaveListings"
            values={{ count: this.state.listingsFromApi.length }}
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
          pageName="ManageListingsPage"
          pageSearchParams={{ page }}
          pagination={pagination}
        />
      ) : null;

    const listingMenuOpen = this.state.listingMenuOpen;
    const closingErrorListingId = !!closingListingError && closingListingError.listingId;
    const openingErrorListingId = !!openingListingError && openingListingError.listingId;

    const listingssss = params => {
      const { states, category, areaOfLaw } = params;
      axios
        .post(`${apiBaseUrl()}/api/sortOwnListings`, {
          authorId: this.props.currentUser?.id?.uuid,
          states: states,
          pub_category: category,
          pub_areaOfLaw: areaOfLaw,
        })
        .then(res => {
          console.log(114, res.data);
          if (JSON.stringify(this.state.listingsFromApi) !== JSON.stringify(res?.data?.data)) {
            this.setState({
              listingsFromApi: res?.data?.data,
            });
          }
        })
        .catch();
    };
    const statusOptions = [
      { key: 'published', value: 'published', label: 'Published' },
      { key: 'draft', value: 'draft', label: 'Unpublished' },
      { key: 'closed', value: 'closed', label: 'Closed' },
    ];
    const typeOptions = [
      { key: 'publicOral', value: 'publicOral', label: 'Public Oral' },
      { key: 'customOral', value: 'customOral', label: 'Customer Oral' },
      { key: 'customService', value: 'customService', label: 'Custom Service' },
    ];
    const practiceAreaOptions = [
      {
        key: 'contractsAndAgreements',
        value: 'contractsAndAgreements',
        label: 'Contract And Agreements',
      },
      { key: 'employeeBenefits', value: 'employeeBenefits', label: 'Employee Benefits' },
      { key: 'employmentAndLabour', value: 'employmentAndLabor', label: 'Employment And Labor' },
    ];
    const sortSection = (
      <div className={css.lformrow}>
        <div className={css.lformcol}>
          <label>Category</label>
          <Select
            value={this.state.typeSort?.key}
            isClearable={true}
            options={typeOptions}
            className={css.formcontrol}
            onChange={e => {
              e === null ? this.setState({ typeSort: '' }) : this.setState({ typeSort: e?.key });
              listingssss({
                category: e?.key,
                states: this.state.statusSort,
                areaOfLaw: this.state.practiceAreaSort,
              });
            }}
          />
        </div>
        <div className={css.lformcol}>
          <label>Status</label>
          <Select
            value={this.state.statusSort?.key}
            isClearable={true}
            options={statusOptions}
            className={css.formcontrol}
            onChange={e => {
              e === null
                ? this.setState({ statusSort: '' })
                : this.setState({ statusSort: e?.key });
              listingssss({
                category: this.state.typeSort,
                states: e?.key,
                areaOfLaw: this.state.practiceAreaSort,
              });
            }}
          />
        </div>
        {/* <div className={css.lformcol}>
          <label>Practice Area</label>
          <Select
            value={this.state.practiceAreaSort?.key}
            isClearable={true}
            options={practiceAreaOptions}
            className={css.formcontrol}
            onChange={e => {
              e === null
                ? this.setState({ practiceAreaSort: '' })
                : this.setState({ practiceAreaSort: e?.key });
            }}
          />
        </div> */}
      </div>
    );

    const title = intl.formatMessage({ id: 'ManageListingsPage.title' });

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

    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="ManageListingsPage" />
            <UserNav selectedPageName="ManageListingsPage" />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div>{sortSection}</div>
            {this.state.typeSort === 'publicOral' ? (
              <div className={css.lformcol}>
                <label>Area of Law</label>
                <Select
                  value={this.state.practiceAreaSort?.key}
                  isClearable={true}
                  options={practiceAreaOptions}
                  className={css.formcontrol}
                  onChange={e => {
                    e === null
                      ? this.setState({ practiceAreaSort: '' })
                      : this.setState({ practiceAreaSort: e?.key });
                    listingssss({
                      category: this.state.typeSort,
                      states: this.state.statusSort,
                      areaOfLaw: e?.key,
                    });
                  }}
                />
              </div>
            ) : null}
            {queryInProgress ? loadingResults : null}
            {queryListingsError ? queryError : null}

            <div className={css.listingPanel}>
              <div className={css.heading}>{heading}</div>
              {/*  */}
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
                <div className={css.listingrow}>
                  {this.state.listingsFromApi.map((m, i) => {
                    const { price, state } = m.attributes;
                    const isDraft = state === LISTING_STATE_DRAFT;
                    const isClosed = state === LISTING_STATE_CLOSED;
                    const editListingLinkType = isDraft
                      ? LISTING_PAGE_PARAM_TYPE_DRAFT
                      : LISTING_PAGE_PARAM_TYPE_EDIT;

                    // const { formattedPrice } = priceData(price, intl);
                    const id = m.id.uuid;
                    const slug = createSlug(m?.attributes?.title);
                    let listingOpen = null;
                    const ensuredUser = ensureUser(m.author);

                    return (
                      <div className={css.horizontalcard} key={id}>
                        {/* leftdiv */}
                        <div className={css.lefthorizontal}>
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

                          <ReadmoreButton
                            // className={css.description}
                            description={m?.attributes?.description}
                          />
                        </div>
                        {/* rightdiv */}
                        <div className={css.righthorizontal}>
                          {/* rightlowerdiv */}

                          <div>
                            {isDraft ? (
                              <span className={css.span}>UNPUBLISHED</span>
                            ) : (
                              <span className={css.span}> PUBLISHED</span>
                            )}
                          </div>
                          {/* <span className={css.price}> {formattedPrice} </span> */}
                          <button
                            className={css.editbutton}
                            onClick={() =>
                              history.push(
                                createResourceLocatorString(
                                  'EditListingPage',
                                  routeConfiguration(),
                                  { id, slug, type: editListingLinkType, tab: 'description' },
                                  {}
                                )
                              )
                            }
                          >
                            <MdModeEditOutline />{' '}
                            <FormattedMessage id="ManageListingCard.editListing" />
                            {/* <NamedLink
                              // className={css.manageLink}
                              className={css.linkcolor}
                              name="EditListingPage"
                              params={{ id, slug, type: editListingLinkType, tab: 'description' }}
                            >
                              <MdModeEditOutline />{' '}
                              <FormattedMessage id="ManageListingCard.editListing" />
                            </NamedLink> */}
                          </button>
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
                            }}
                            // isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
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
                                <div className={css.inlinebutton}>
                                  <IoMdClose />
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
                        ) : null}
                        {isClosed ? (
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
                              <FormattedMessage id="ManageListingCard.openListing" />
                            </button>
                          </Overlay>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              {paginationLinks}
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

ManageListingsPageComponent.defaultProps = {
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

ManageListingsPageComponent.propTypes = {
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
  const { currentUser } = state.user;
  return {
    currentPageResultIds,
    listings,
    currentUser,
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

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
});

const ManageListingsPage = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(ManageListingsPageComponent);

export default ManageListingsPage;
