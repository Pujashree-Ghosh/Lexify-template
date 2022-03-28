import React from 'react';
import { arrayOf, bool, number, oneOf, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  txIsAccepted,
  txIsCanceled,
  txIsDeclined,
  txIsEnquired,
  txIsRescheduled,
  txIsRequested,
  txHasBeenDelivered,
  txIsPaymentExpired,
  txIsPaymentPending,
  txIsPendingConfirmation,
} from '../../util/transaction';
import { propTypes, DATE_TYPE_DATETIME } from '../../util/types';
import { createSlug, stringify } from '../../util/urlHelpers';
import { ensureCurrentUser, ensureListing } from '../../util/data';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  Avatar,
  BookingTimeInfo,
  NamedLink,
  NotificationBadge,
  Page,
  PaginationLinks,
  TabNav,
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  Footer,
  IconSpinner,
  UserDisplayName,
  UserNav,
} from '../../components';
import { TopbarContainer, NotFoundPage } from '..';
import config from '../../config';

import css from './MyAppointmentPage.module.css';
import AppointmentCard from '../../components/AppointmentCard/AppointmentCard';
import { confirmConsultation } from '../TransactionPage/TransactionPage.duck';

const formatDate = (intl, date) => {
  return {
    short: intl.formatDate(date, {
      month: 'short',
      day: 'numeric',
    }),
    long: `${intl.formatDate(date)} ${intl.formatTime(date)}`,
  };
};

// Translated name of the state of the given transaction
export const txState = (intl, tx, type) => {
  const isOrder = type === 'order';

  if (txIsAccepted(tx)) {
    return 'upcoming';
  } else if (txIsPendingConfirmation(tx)) {
    return 'pending';
  } else if (txHasBeenDelivered(tx)) {
    return 'complete';
  } else if (txIsRescheduled(tx)) {
    return 'complete';
  } else {
    console.warn('This transition is unknown:', tx.attributes.lastTransition);
    return null;
  }
};

// Functional component as internal helper to print BookingTimeInfo if that is needed
const BookingInfoMaybe = props => {
  const { bookingClassName, isOrder, intl, tx, unitType } = props;
  const isEnquiry = txIsEnquired(tx);

  if (isEnquiry) {
    return null;
  }
  const listingAttributes = ensureListing(tx.listing).attributes;
  const timeZone = listingAttributes.availabilityPlan
    ? listingAttributes.availabilityPlan.timezone
    : 'Etc/UTC';

  // If you want to show the booking price after the booking time on InboxPage you can
  // add the price after the BookingTimeInfo component. You can get the price by uncommenting
  // sthe following lines:

  // const bookingPrice = isOrder ? tx.attributes.payinTotal : tx.attributes.payoutTotal;
  // const price = bookingPrice ? formatMoney(intl, bookingPrice) : null;

  // Remember to also add formatMoney function from 'util/currency.js' and add this after BookingTimeInfo:
  // <div className={css.itemPrice}>{price}</div>

  return (
    <div className={classNames(css.bookingInfoWrapper, bookingClassName)}>
      <BookingTimeInfo
        bookingClassName={bookingClassName}
        isOrder={isOrder}
        intl={intl}
        tx={tx}
        unitType={unitType}
        dateType={DATE_TYPE_DATETIME}
        timeZone={timeZone}
      />
    </div>
  );
};

BookingInfoMaybe.propTypes = {
  intl: intlShape.isRequired,
  isOrder: bool.isRequired,
  tx: propTypes.transaction.isRequired,
  unitType: propTypes.bookingUnitType.isRequired,
};

export const MyAppointmentPageComponent = props => {
  const {
    unitType,
    currentUser,
    currentUserListing,
    fetchInProgress,
    fetchOrdersOrSalesError,
    intl,
    pagination,
    params,
    providerNotificationCount,
    scrollingDisabled,
    transactions,
    onConfirmConsultation,
    confirmConsultationInProgress,
    confirmConsultationSuccess,
    confirmConsultationError,
  } = props;

  // console.log(confirmConsultationSuccess);
  const { tab } = params;
  const ensuredCurrentUser = ensureCurrentUser(currentUser);

  const validTab = tab === 'pending' || tab === 'upcoming' || tab === 'complete';
  if (!validTab) {
    return <NotFoundPage />;
  }

  const isPending = tab === 'pending';
  const isUpcoming = tab === 'upcoming';

  const pendingTitle = 'Pending'; // intl.formatMessage({ id: 'InboxPage.ordersTitle' });
  const upcomingTitle = 'Upcoming'; // intl.formatMessage({ id: 'InboxPage.salesTitle' });
  const completeTitle = 'Complete';
  const title = isPending ? pendingTitle : isUpcoming ? upcomingTitle : completeTitle;

  const toTxItem = tx => {
    const type = isPending ? 'pending' : isUpcoming ? 'upcoming' : 'complete';
    const stateData = txState(intl, tx, type);
    console.log(tx);

    // Render InboxItem only if the latest transition of the transaction is handled in the `txState` function.
    return stateData ? (
      <div className={css.AppointmentCardContainer} key={tx?.id?.uuid}>
        <AppointmentCard
          unitType={unitType}
          type={type}
          tx={tx}
          intl={intl}
          stateData={stateData}
          onConfirmConsultation={onConfirmConsultation}
          confirmConsultationInProgress={confirmConsultationInProgress}
          confirmConsultationSuccess={confirmConsultationSuccess}
        />
      </div>
    ) : null;
  };

  const error = fetchOrdersOrSalesError ? (
    <p className={css.error}>
      <FormattedMessage id="InboxPage.fetchFailed" />
    </p>
  ) : null;

  const noResults =
    !fetchInProgress && transactions.length === 0 && !fetchOrdersOrSalesError ? (
      <FormattedMessage id={'MyAppointmentPage.noBookingFound'} />
    ) : null;

  //   const hasOrderOrSaleTransactions = (tx, isOrdersTab, user) => {
  //     return isOrdersTab==='pending'
  //       ? user.id && tx && tx.length > 0 && tx[0].customer.id.uuid === user.id.uuid
  //       : user.id && tx && tx.length > 0 && tx[0].provider.id.uuid === user.id.uuid;
  //   };
  //   const hasTransactions =
  //     !fetchInProgress && hasOrderOrSaleTransactions(transactions, tab, ensuredCurrentUser);
  const pagingLinks =
    pagination && pagination.totalPages > 1 ? (
      <PaginationLinks
        className={css.pagination}
        pageName="MyAppointmentPage"
        pagePathParams={params}
        pagination={pagination}
      />
    ) : null;

  const providerNotificationBadge =
    providerNotificationCount > 0 ? <NotificationBadge count={providerNotificationCount} /> : null;

  const tabs = [
    {
      text: (
        <span>
          <FormattedMessage id="MyAppointmentPage.pendingTabTitle" />
        </span>
      ),
      selected: isPending,
      linkProps: {
        name: 'MyAppointmentPage',
        params: { tab: 'pending' },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="MyAppointmentPage.upcomingTabTitle" />
        </span>
      ),
      selected: isUpcoming,
      linkProps: {
        name: 'MyAppointmentPage',
        params: { tab: 'upcoming' },
      },
    },
    {
      text: (
        <span>
          <FormattedMessage id="MyAppointmentPage.completeTabTitle" />
          {/* {providerNotificationBadge} */}
        </span>
      ),
      selected: !isPending && !isUpcoming,
      linkProps: {
        name: 'MyAppointmentPage',
        params: { tab: 'complete' },
      },
    },
  ];
  const nav = <TabNav rootClassName={css.tabs} tabRootClassName={css.tab} tabs={tabs} />;

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer
            className={css.topbar}
            mobileRootClassName={css.mobileTopbar}
            desktopClassName={css.desktopTopbar}
            currentPage="MyAppointmentPage"
          />
          <UserNav selectedPageName="MyAppoinmentBasePage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperSideNav className={css.navigation}>{nav}</LayoutWrapperSideNav>
        <LayoutWrapperMain>
          {error}
          {/* <ul className={css.itemList}>
            {!fetchInProgress ? (
              transactions.map(toTxItem)
            ) : (
              <li className={css.listItemsLoading}>
                <IconSpinner />
              </li>
            )}
            {noResults}
          </ul> */}
          {!fetchInProgress ? transactions.map(toTxItem) : <IconSpinner />}
          {noResults}
          {pagingLinks}
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

MyAppointmentPageComponent.defaultProps = {
  unitType: config.bookingUnitType,
  currentUser: null,
  currentUserListing: null,
  currentUserHasOrders: null,
  fetchOrdersOrSalesError: null,
  pagination: null,
  providerNotificationCount: 0,
  sendVerificationEmailError: null,
};

MyAppointmentPageComponent.propTypes = {
  params: shape({
    tab: string.isRequired,
  }).isRequired,

  unitType: propTypes.bookingUnitType,
  currentUser: propTypes.currentUser,
  currentUserListing: propTypes.ownListing,
  fetchInProgress: bool.isRequired,
  fetchOrdersOrSalesError: propTypes.error,
  pagination: propTypes.pagination,
  providerNotificationCount: number,
  scrollingDisabled: bool.isRequired,
  transactions: arrayOf(propTypes.transaction).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { fetchInProgress, fetchOrdersOrSalesError, pagination, transactionRefs } = state.InboxPage;
  const {
    currentUser,
    currentUserListing,
    currentUserNotificationCount: providerNotificationCount,
  } = state.user;
  const {
    confirmConsultationInProgress,
    confirmConsultationSuccess,
    confirmConsultationError,
  } = state.TransactionPage;
  return {
    currentUser,
    currentUserListing,
    fetchInProgress,
    fetchOrdersOrSalesError,
    pagination,
    providerNotificationCount,
    scrollingDisabled: isScrollingDisabled(state),
    transactions: getMarketplaceEntities(state, transactionRefs),
    confirmConsultationInProgress,
    confirmConsultationSuccess,
    confirmConsultationError,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onConfirmConsultation: transactionId => dispatch(confirmConsultation(transactionId)),
  };
};

const MyAppointmentPage = compose(
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(MyAppointmentPageComponent);

export default MyAppointmentPage;
