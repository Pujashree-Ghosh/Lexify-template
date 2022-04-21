import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { array, func, object, shape, string } from 'prop-types';
import routeConfiguration from '../../routeConfiguration';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { createResourceLocatorString } from '../../util/routes';
import config from '../../config';
import { parse } from '../../util/urlHelpers';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { ensureCurrentUser } from '../../util/data';
import { validURLParamsForExtendedData } from './SearchPage.helpers';

import {
  Page,
  UserNav,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  LayoutSideNavigation,
  LayoutWrapperSideNav,
  TabNav,
  PaginationLinks,
  IconSpinner,
} from '../../components';
import { TopbarContainer } from '../../containers';
import css from './PromotionPage.module.css';
import ListingResultCard from '../../components/ListingResultCard/ListingResultCard';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

function PromotionPageComponent(props) {
  const {
    history,
    scrollingDisabled,
    intl,
    currentUser,
    filterConfig,
    listings,
    location,
    searchInProgress,
    searchListingsError,
    searchParams,
    pagination,
    params,
  } = props;
  const ensuredCurrentUser = ensureCurrentUser(currentUser);

  const { mapSearch, page, ...searchInURL } = parse(location.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  const validQueryParams = validURLParamsForExtendedData(searchInURL, filterConfig);
  const routes = routeConfiguration();
  const clientId = validQueryParams && validQueryParams.pub_clientId;
  const email =
    ensuredCurrentUser && ensuredCurrentUser.attributes && ensuredCurrentUser.attributes.email;
  const title = intl.formatMessage({ id: 'PromotionPage.title' });
  useEffect(() => {
    if (clientId !== email) {
      history.push(createResourceLocatorString('PromotionBasePage', routes, {}, {}));
    }
  });

  const { tab } = params;

  const validTab = tab === 'One_N_One' || tab === 'event' || tab === 'service';

  if (!validTab) {
    return <NotFoundPage />;
  }
  const isOne_N_One = tab === 'One_N_One';
  const isEvent = tab === 'event';

  const tabs = [
    {
      text: (
        <span>
          <FormattedMessage id="PromotionPage.one_N_oneTabTitle" />
        </span>
      ),
      selected: isOne_N_One,
      linkProps: {
        name: 'PromotionPage',
        params: { tab: 'One_N_One' },
        to: { search: `?pub_clientId=${email}` },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="PromotionPage.eventTabTitle" />
        </span>
      ),
      selected: isEvent,
      linkProps: {
        name: 'PromotionPage',
        params: { tab: 'event' },
        to: { search: `?pub_clientId=${email}` },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="PromotionPage.serviceTabTitle" />
          {/* {providerNotificationBadge} */}
        </span>
      ),
      selected: !isOne_N_One && !isEvent,
      linkProps: {
        name: 'PromotionPage',
        params: { tab: 'service' },
        to: { search: `?pub_clientId=${email}` },
      },
    },
  ];
  const nav = <TabNav rootClassName={css.tabs} tabRootClassName={css.tab} tabs={tabs} />;

  const pagingLinks =
    !searchInProgress && pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="PromotionPage"
        pagePathParams={params}
        pageSearchParams={{ pub_clientId: `${email}` }}
        pagination={pagination}
      />
    ) : null;

  const noResults =
    !searchInProgress &&
    listings.length === 0 &&
    searchParams.pub_clientId === email &&
    !searchListingsError ? (
      <p className={css.nrftxt}>
        <FormattedMessage id={'PromotionPage.noResultFound'} />
      </p>
    ) : null;
  const error = searchListingsError ? (
    <p className={css.nrftxt}>
      <FormattedMessage id="PromotionPage.fetchFailed" />
    </p>
  ) : null;

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer
            className={css.topbar}
            mobileRootClassName={css.mobileTopbar}
            desktopClassName={css.desktopTopbar}
            currentPage="PromotionBasePage"
          />
          <UserNav selectedPageName="PromotionBasePage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperSideNav className={css.navigation}>{nav}</LayoutWrapperSideNav>

        <LayoutWrapperMain className={css.wrapperMain}>
          {error}

          {!searchInProgress ? (
            <div className={css.listingCards}>
              {listings.map(l => (
                <ListingResultCard listing={l} history={history} key={l.id.uuid} />
              ))}
            </div>
          ) : (
            <IconSpinner />
          )}

          {noResults}
          {pagingLinks}
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
}

PromotionPageComponent.defaultProps = {
  listings: [],
  pagination: null,
  searchListingsError: null,
  searchParams: {},
  // tab: 'listings',
  filterConfig: config.custom.filters,
  // sortConfig: config.custom.sortConfig,
  // activeListingId: null,
};

PromotionPageComponent.propTypes = {
  listings: array,
  pagination: propTypes.pagination,
  searchListingsError: propTypes.error,
  searchParams: object,
  filterConfig: propTypes.filterConfig,
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
    pagination,
    searchInProgress,
    searchListingsError,
    searchParams,
    //   searchMapListingIds,
    //   activeListingId,
  } = state.SearchPage;
  const { currentUser } = state.user;
  const pageListings = getListingsById(state, currentPageResultIds);

  return {
    listings: pageListings,
    currentUser,
    pagination,
    scrollingDisabled: isScrollingDisabled(state),
    searchInProgress,
    searchListingsError,
    searchParams,
  };
};

const PromotionPage = compose(
  withRouter,
  connect(mapStateToProps),
  injectIntl
)(PromotionPageComponent);

export default PromotionPage;
