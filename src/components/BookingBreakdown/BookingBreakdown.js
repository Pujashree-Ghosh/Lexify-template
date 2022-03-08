/**
 * This component will show the booking info and calculated total price.
 * I.e. dates and other details related to payment decision in receipt format.
 */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { oneOf, string } from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  propTypes,
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
} from '../../util/types';

import LineItemBookingPeriod from './LineItemBookingPeriod';
import LineItemBasePriceMaybe from './LineItemBasePriceMaybe';
import LineItemUnitPriceMaybe from './LineItemUnitPriceMaybe';
import LineItemSubTotalMaybe from './LineItemSubTotalMaybe';
import LineItemCustomerCommissionMaybe from './LineItemCustomerCommissionMaybe';
import LineItemCustomerCommissionRefundMaybe from './LineItemCustomerCommissionRefundMaybe';
import LineItemProviderCommissionMaybe from './LineItemProviderCommissionMaybe';
import LineItemProviderCommissionRefundMaybe from './LineItemProviderCommissionRefundMaybe';
import LineItemRefundMaybe from './LineItemRefundMaybe';
import LineItemTotalPrice from './LineItemTotalPrice';
import LineItemUnknownItemsMaybe from './LineItemUnknownItemsMaybe';
import Button from '../Button/Button';
import {
  cancelSaleCustomer,
  cancelSaleProvider,
} from '../../containers/TransactionPage/TransactionPage.duck';

import css from './BookingBreakdown.module.css';
import LineItemTaxMaybe from './LineItemTaxMaybe';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';

export const BookingBreakdownComponent = props => {
  const {
    rootClassName,
    className,
    userRole,
    unitType,
    transaction,
    booking,
    intl,
    dateType,
    timeZone,
    onCancelSaleCustomer,
    onCancelSaleProvider,
  } = props;
  // console.log(666, transaction);
  const isCustomer = userRole === 'customer';
  const isProvider = userRole === 'provider';

  const hasCommissionLineItem = transaction.attributes.lineItems.find(item => {
    const hasCustomerCommission = isCustomer && item.code === LINE_ITEM_CUSTOMER_COMMISSION;
    const hasProviderCommission = isProvider && item.code === LINE_ITEM_PROVIDER_COMMISSION;
    return (hasCustomerCommission || hasProviderCommission) && !item.reversal;
  });

  const classes = classNames(rootClassName || css.root, className);

  /**
   * BookingBreakdown contains different line items:
   *
   * LineItemBookingPeriod: prints booking start and booking end types. Prop dateType
   * determines if the date and time or only the date is shown
   *
   * LineItemUnitsMaybe: if he unitType is line-item/unit print the name and
   * quantity of the unit
   * This line item is not used by default in the BookingBreakdown.
   *
   * LineItemUnitPriceMaybe: prints just the unit price, e.g. "Price per night $32.00".
   *
   * LineItemBasePriceMaybe: prints the base price calculation for the listing, e.g.
   * "$150.00 * 2 nights $300"
   *
   *
   * LineItemUnknownItemsMaybe: prints the line items that are unknown. In ideal case there
   * should not be unknown line items. If you are using custom pricing, you should create
   * new custom line items if you need them.
   *
   * LineItemSubTotalMaybe: prints subtotal of line items before possible
   * commission or refunds
   *
   * LineItemRefundMaybe: prints the amount of refund
   *
   * LineItemCustomerCommissionMaybe: prints the amount of customer commission
   * The default transaction process used by FTW doesn't include the customer commission.
   *
   * LineItemCustomerCommissionRefundMaybe: prints the amount of refunded customer commission
   *
   * LineItemProviderCommissionMaybe: prints the amount of provider commission
   *
   * LineItemProviderCommissionRefundMaybe: prints the amount of refunded provider commission
   *
   * LineItemTotalPrice: prints total price of the transaction
   *
   */

  return (
    <div className={classes}>
      <LineItemBookingPeriod
        booking={booking}
        unitType={unitType}
        dateType={dateType}
        timeZone={timeZone}
      />
      {/* <LineItemUnitPriceMaybe transaction={transaction} unitType={unitType} intl={intl} /> */}

      {/* <LineItemBasePriceMaybe transaction={transaction} unitType={unitType} intl={intl} /> */}
      <LineItemUnknownItemsMaybe transaction={transaction} isProvider={isProvider} intl={intl} />

      <LineItemSubTotalMaybe
        transaction={transaction}
        unitType={unitType}
        userRole={userRole}
        intl={intl}
      />
      <LineItemRefundMaybe transaction={transaction} intl={intl} />

      <LineItemCustomerCommissionMaybe
        transaction={transaction}
        isCustomer={isCustomer}
        intl={intl}
      />
      <LineItemCustomerCommissionRefundMaybe
        transaction={transaction}
        isCustomer={isCustomer}
        intl={intl}
      />

      <LineItemProviderCommissionMaybe
        transaction={transaction}
        isProvider={isProvider}
        intl={intl}
      />
      <LineItemProviderCommissionRefundMaybe
        transaction={transaction}
        isProvider={isProvider}
        intl={intl}
      />

      {/* <LineItemTaxMaybe transaction={transaction} unitType={unitType} intl={intl} /> */}
      {/* <LineItemTaxMaybe transaction={transaction} unitType={unitType} intl={intl} /> */}

      <LineItemTotalPrice transaction={transaction} isProvider={isProvider} intl={intl} />

      {hasCommissionLineItem ? (
        <span className={css.feeInfo}>
          <FormattedMessage id="BookingBreakdown.commissionFeeNote" />
        </span>
      ) : null}
      {transaction?.attributes?.lastTransition === 'transition/accept' ? (
        isCustomer ? (
          <Button className={css.bkcnclbtn} onClick={() => onCancelSaleCustomer(transaction.id)}>
            {' '}
            Cancel
          </Button>
        ) : (
          <Button className={css.bkcnclbtn} onClick={() => onCancelSaleProvider(transaction.id)}>
            {' '}
            Cancel
          </Button>
        )
      ) : (
        ''
      )}
    </div>
  );
};

const func = propTypes;

BookingBreakdownComponent.defaultProps = {
  rootClassName: null,
  className: null,
  dateType: null,
  timeZone: null,
  func: () => {},
};

BookingBreakdownComponent.propTypes = {
  rootClassName: string,
  className: string,

  userRole: oneOf(['customer', 'provider']).isRequired,
  unitType: propTypes.bookingUnitType.isRequired,
  transaction: propTypes.transaction.isRequired,
  booking: propTypes.booking.isRequired,
  dateType: propTypes.dateType,
  timeZone: string,
  onCancelSaleCustomer: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    onCancelSaleCustomer: transactionId => dispatch(cancelSaleCustomer(transactionId)),
    onCancelSaleProvider: transactionId => dispatch(cancelSaleProvider(transactionId)),
  };
};

const BookingBreakdown = compose(
  connect(null, mapDispatchToProps),
  injectIntl
)(BookingBreakdownComponent);
// const BookingBreakdown = injectIntl(BookingBreakdownComponent);

BookingBreakdown.displayName = 'BookingBreakdown';

export default BookingBreakdown;
