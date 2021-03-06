import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import { storableError } from '../../util/errors';
import { parse } from '../../util/urlHelpers';
import { TRANSITIONS } from '../../util/transaction';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';

const sortedTransactions = txs =>
  reverse(
    sortBy(txs, tx => {
      return tx.attributes ? tx.attributes.lastTransitionedAt : null;
    })
  );

// ================ Action types ================ //

export const FETCH_ORDERS_OR_SALES_REQUEST = 'app/InboxPage/FETCH_ORDERS_OR_SALES_REQUEST';
export const FETCH_ORDERS_OR_SALES_SUCCESS = 'app/InboxPage/FETCH_ORDERS_OR_SALES_SUCCESS';
export const FETCH_ORDERS_OR_SALES_ERROR = 'app/InboxPage/FETCH_ORDERS_OR_SALES_ERROR';

// ================ Reducer ================ //

const entityRefs = entities =>
  entities.map(entity => ({
    id: entity.id,
    type: entity.type,
  }));

const initialState = {
  fetchInProgress: false,
  fetchOrdersOrSalesError: null,
  pagination: null,
  transactionRefs: [],
};

export default function checkoutPageReducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_ORDERS_OR_SALES_REQUEST:
      return { ...state, fetchInProgress: true, fetchOrdersOrSalesError: null };
    case FETCH_ORDERS_OR_SALES_SUCCESS: {
      const transactions = sortedTransactions(payload.data.data);
      return {
        ...state,
        fetchInProgress: false,
        transactionRefs: entityRefs(transactions),
        pagination: payload.data.meta,
      };
    }
    case FETCH_ORDERS_OR_SALES_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, fetchInProgress: false, fetchOrdersOrSalesError: payload };

    default:
      return state;
  }
}

// ================ Action creators ================ //

const fetchOrdersOrSalesRequest = () => ({ type: FETCH_ORDERS_OR_SALES_REQUEST });
const fetchOrdersOrSalesSuccess = response => ({
  type: FETCH_ORDERS_OR_SALES_SUCCESS,
  payload: response,
});
const fetchOrdersOrSalesError = e => ({
  type: FETCH_ORDERS_OR_SALES_ERROR,
  error: true,
  payload: e,
});

// ================ Thunks ================ //

const INBOX_PAGE_SIZE = 5;

export const loadData = (params, search) => (dispatch, getState, sdk) => {
  const { tab } = params;
  const transitionParam =
    tab === 'pending'
      ? [
          'transition/pending-confirmation',
          'transition/pending-confirmation-oral',
          'transition/service-delivered',
        ]
      : tab === 'upcoming'
      ? [
          'transition/reschedule-customer',
          'transition/reschedule-provider',
          'transition/accept',
          'transition/accept-oral',
          // 'transition/customer-join-1',
          // 'transition/provider-join-1',
          // 'transition/provider-join-2',
          // 'transition/customer-join-2',
        ]
      : [
          'transition/complete',
          'transition/expire-review-period',
          'transition/review-1-by-customer',
          'transition/review-1-by-provider',
          'transition/review-2-by-provider',
          'transition/expire-provider-review-period',
          'transition/review-2-by-customer',
          'transition/expire-customer-review-period',
        ];

  const onlyFilterValues = {
    pending: 'pending',
    upcoming: 'upcoming',
    complete: 'complete',
    verification: 'verification',
  };

  const onlyFilter = onlyFilterValues[tab];
  if (!onlyFilter) {
    return Promise.reject(new Error(`Invalid tab for Salespage: ${tab}`));
  }

  dispatch(fetchOrdersOrSalesRequest());
  const { page = 1 } = parse(search);
  const apiQueryParams = {
    only: 'sale',
    lastTransitions: transitionParam,
    include: [
      'provider',
      'provider.profileImage',
      'customer',
      'customer.profileImage',
      'booking',
      'listing',
    ],
    'fields.transaction': [
      'lastTransition',
      'lastTransitionedAt',
      'transitions',
      'payinTotal',
      'payoutTotal',
    ],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': ['variants.square-small', 'variants.square-small2x'],
    page,
    per_page: INBOX_PAGE_SIZE,
  };

  return sdk.transactions
    .query(apiQueryParams)
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      dispatch(fetchOrdersOrSalesSuccess(response));
      return response;
    })
    .catch(e => {
      dispatch(fetchOrdersOrSalesError(storableError(e)));
      throw e;
    });
};
