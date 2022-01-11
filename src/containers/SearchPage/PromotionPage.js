import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { searchMapListings, setActiveListing } from './SearchPage.duck';
import { array, bool, func, oneOf, object, shape, string } from 'prop-types';
import routeConfiguration from '../../routeConfiguration';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { createResourceLocatorString } from '../../util/routes';
import config from '../../config';
import { parse, stringify } from '../../util/urlHelpers';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { ensureCurrentUser } from '../../util/data';
import {
  pickSearchParamsOnly,
  validURLParamsForExtendedData,
  validFilterParams,
  createSearchResultSchema,
} from './SearchPage.helpers';

import {
  Page,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  ListingCard,
  Footer,
} from '../../components';
import { TopbarContainer } from '../../containers';
import css from './PromotionPage.module.css';

function PromotionPageComponent(props) {
  // console.log(props);
  const {
    history,
    scrollingDisabled,
    intl,
    currentUser,
    filterConfig,
    listings,
    onActivateListing,
    location,
  } = props;
  const ensuredCurrentUser = ensureCurrentUser(currentUser);
  const panelMediumWidth = 50;
  const panelLargeWidth = 62.5;
  const cardRenderSizes = [
    '(max-width: 767px) 100vw',
    `(max-width: 1023px) ${panelMediumWidth}vw`,
    `(max-width: 1920px) ${panelLargeWidth / 2}vw`,
    `${panelLargeWidth / 3}vw`,
  ].join(', ');
  const { mapSearch, page, ...searchInURL } = parse(location.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  const validQueryParams = validURLParamsForExtendedData(searchInURL, filterConfig);
  const [loading, setLoading] = useState(true);

  console.log(listings);
  const routes = routeConfiguration();
  const title = intl.formatMessage({ id: 'PromotionPage.title' });
  useEffect(() => {
    const type = validQueryParams && validQueryParams?.pub_type;
    const clientId = validQueryParams && validQueryParams.pub_clientId;
    const uuid = ensuredCurrentUser && ensuredCurrentUser.id && ensuredCurrentUser.id.uuid;
    if (type !== 'unsolicited' || clientId !== uuid) {
      // setLoading(true);
      setTimeout(() => {
        history.push(
          createResourceLocatorString(
            'PromotionPage',
            routes,
            {},
            { pub_type: 'unsolicited', pub_clientId: uuid }
          )
        );
        setLoading(false);
      }, 2000);
    }
  });
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="Promotion" />
          <UserNav selectedPageName="PromotionPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          {loading && <div>Loading Result..</div>}
          {!loading &&
            validQueryParams &&
            ensuredCurrentUser &&
            ensuredCurrentUser.id &&
            ensuredCurrentUser.id.uuid &&
            validQueryParams.pub_clientId === ensuredCurrentUser.id.uuid &&
            validQueryParams.pub_type === 'unsolicited' && (
              <div className={css.content}>
                {listings.map(l => (
                  <ListingCard
                    className={css.listingCard}
                    key={l.id.uuid}
                    listing={l}
                    renderSizes={cardRenderSizes}
                    setActiveListing={onActivateListing}
                  />
                ))}
              </div>
            )}
          {!loading && !listings.length && <div>No result found</div>}
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
}

PromotionPageComponent.defaultProps = {
  listings: [],
  // mapListings: [],
  // pagination: null,
  // searchListingsError: null,
  // searchParams: {},
  // tab: 'listings',
  filterConfig: config.custom.filters,
  // sortConfig: config.custom.sortConfig,
  // activeListingId: null,
};

PromotionPageComponent.propTypes = {
  listings: array,
  // mapListings: array,
  // onActivateListing: func.isRequired,
  // onManageDisableScrolling: func.isRequired,
  // onSearchMapListings: func.isRequired,
  // pagination: propTypes.pagination,
  // scrollingDisabled: bool.isRequired,
  // searchInProgress: bool.isRequired,
  // searchListingsError: propTypes.error,
  // searchParams: object,
  // tab: oneOf(['filters', 'listings', 'map']).isRequired,
  filterConfig: propTypes.filterConfig,
  // sortConfig: propTypes.sortConfig,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string.isRequired,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};
const mapStateToProps = state => {
  const {
    currentPageResultIds,
    //   pagination,
    //   searchInProgress,
    //   searchListingsError,
    //   searchParams,
    //   searchMapListingIds,
    //   activeListingId,
  } = state.SearchPage;
  const { currentUser } = state.user;
  const pageListings = getListingsById(state, currentPageResultIds);
  // const mapListings = getListingsById(
  //   state,
  //   unionWith(currentPageResultIds, searchMapListingIds, (id1, id2) => id1.uuid === id2.uuid)
  // );

  return {
    listings: pageListings,
    currentUser,
    //   mapListings,
    //   pagination,
    scrollingDisabled: isScrollingDisabled(state),
    //   searchInProgress,
    //   searchListingsError,
    //   searchParams,
    //   activeListingId,
  };
};

const mapDispatchToProps = dispatch => ({
  // onManageDisableScrolling: (componentId, disableScrolling) =>
  //   dispatch(manageDisableScrolling(componentId, disableScrolling)),
  // onSearchMapListings: searchParams => dispatch(searchMapListings(searchParams)),
  onActivateListing: listingId => dispatch(setActiveListing(listingId)),
});
const PromotionPage = compose(
  withRouter,
  connect(mapStateToProps),
  injectIntl
)(PromotionPageComponent);

export default PromotionPage;
