import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import { compose } from 'redux';
import { connect } from 'react-redux';
import config from '../../config';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes, LISTING_STATE_DRAFT } from '../../util/types';
import { ensureListing } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
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

import { closeListing, openListing, getOwnListingsById } from './ManageListingsPage.duck';
import css from './ManageListingsPage.module.css';

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

export class ManageListingsPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = { listingMenuOpen: null };
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
      onCloseListing,
      onOpenListing,
      openingListing,
      openingListingError,
      pagination,
      queryInProgress,
      queryListingsError,
      queryParams,
      scrollingDisabled,
      intl,
    } = this.props;

    // console.log(listings);

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
            id="ManageListingsPage.youHaveListings"
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
          pageName="ManageListingsPage"
          pageSearchParams={{ page }}
          pagination={pagination}
        />
      ) : null;

    const listingMenuOpen = this.state.listingMenuOpen;
    const closingErrorListingId = !!closingListingError && closingListingError.listingId;
    const openingErrorListingId = !!openingListingError && openingListingError.listingId;

    const title = intl.formatMessage({ id: 'ManageListingsPage.title' });

    const panelWidth = 62.5;
    // Render hints for responsive image
    const renderSizes = [
      `(max-width: 767px) 100vw`,
      `(max-width: 1920px) ${panelWidth / 2}vw`,
      `${panelWidth / 3}vw`,
    ].join(', ');

    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer currentPage="ManageListingsPage" />
            <UserNav selectedPageName="ManageListingsPage" />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            {queryInProgress ? loadingResults : null}
            {queryListingsError ? queryError : null}

            <div className={css.listingPanel}>
              <div className={css.heading}>Manage Your User</div>
              {/* {heading} */}
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
              <div className={css.tablesclmob}>
                <table className={css.table}>
                  {/* <th>Name</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Edit</th>
                  <th>draft</th> */}
                  {listings.map((m, i) => {
                    const { price, state } = m.attributes;
                    const isDraft = state === LISTING_STATE_DRAFT;
                    const editListingLinkType = isDraft
                      ? LISTING_PAGE_PARAM_TYPE_DRAFT
                      : LISTING_PAGE_PARAM_TYPE_EDIT;

                    const { formattedPrice } = priceData(price, intl);
                    const id = m.id.uuid;
                    const slug = createSlug(m?.attributes?.title);

                    return (
                      <tr>
                        <td>
                          <NamedLink
                            className={css.manageLink}
                            name="ListingPage"
                            params={{ id, slug }}
                          >
                            {m?.attributes?.title}
                          </NamedLink>
                          <div>{m?.attributes?.publicData?.category}</div>
                        </td>

                        <td>
                          <a
                            // class="btn btn-primary"
                            data-bs-toggle="collapse"
                            href={`#descriptionExample${i}`}
                            role="button"
                            aria-expanded="false"
                            aria-controls="collapseExample"
                          >
                            Description
                          </a>
                          <div class="collapse" id={`descriptionExample${i}`}>
                            <div class="card card-body">{m?.attributes?.description}</div>
                          </div>
                        </td>

                        <td>
                          {' '}
                          <a
                            // class="btn btn-primary"
                            data-bs-toggle="collapse"
                            href={`#disclaimerExample${i}`}
                            role="button"
                            aria-expanded="false"
                            aria-controls="collapseExample"
                          >
                            Disclaimer
                          </a>
                          <div class="collapse" id={`disclaimerExample${i}`}>
                            <div class="card card-body">
                              {m?.attributes?.publicData?.disclaimer}
                            </div>
                          </div>
                        </td>

                        <td>{formattedPrice}</td>
                        <td>
                          <NamedLink
                            className={css.manageLink}
                            name="EditListingPage"
                            params={{ id, slug, type: editListingLinkType, tab: 'description' }}
                          >
                            <FormattedMessage id="ManageListingCard.editListing" />
                          </NamedLink>
                        </td>
                        <td>
                          {isDraft ? (
                            <React.Fragment>
                              {/* <div className={classNames({ [css.draftNoImage]: !displayImage })} /> */}
                              {/* <Overlay
                                message={intl.formatMessage(
                                  { id: 'ManageListingCard.draftOverlayText' },
                                  { listingTitle: m?.attributes?.title }
                                )}
                              > */}
                              <NamedLink
                                className={css.finishListingDraftLink}
                                name="EditListingPage"
                                params={{
                                  id,
                                  slug,
                                  type: LISTING_PAGE_PARAM_TYPE_DRAFT,
                                  tab: 'photos',
                                }}
                              >
                                <FormattedMessage id="ManageListingCard.finishListingDraft" />
                              </NamedLink>
                              {/* </Overlay> */}
                            </React.Fragment>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </table>
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

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
});

const ManageListingsPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(ManageListingsPageComponent);

export default ManageListingsPage;
