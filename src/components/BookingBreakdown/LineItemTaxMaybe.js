import React from 'react';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes, LINE_ITEM_TAX_RATE } from '../../util/types';
import { types as sdkTypes } from '../../util/sdkLoader';
import config from '../../config';

import css from './BookingBreakdown.module.css';
// import Decimal from 'decimal.js';

const { Money } = sdkTypes;

const LineItemTaxMaybe = props => {
  const { transaction, unitType, intl } = props;
  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;
  const translationKey = transaction.attributes.payinTotal
    ? 'BookingBreakdown.tax'
    : 'BookingBreakdown.free';

  //   const tax =
  //     transaction.attributes.protectedData && transaction.attributes.protectedData.tax != undefined
  //       ? transaction.attributes.protectedData.tax
  //       : null;
  const taxRate =
    transaction.attributes.protectedData && transaction.attributes.protectedData.vat != undefined
      ? transaction.attributes.protectedData.vat
      : null;

  console.log(transaction, taxRate);

  // console.log(111, taxRate, tax, transaction);

  const unitPurchase = transaction.attributes.lineItems.find(
    item => item.code === LINE_ITEM_TAX_RATE && !item.reversal
  );

  let formatPrice = unitPurchase ? unitPurchase.unitPrice : null;
  if (formatPrice) {
    formatPrice.amount *= unitPurchase.quantity || unitPurchase.units;
  }

  const formattedUnitPrice = unitPurchase
    ? formatMoney(intl, unitPurchase.lineTotal || formatPrice)
    : taxRate != undefined
    ? formatMoney(intl, new Money(taxRate || 0, config.currency))
    : null;

  const price = unitPurchase
    ? unitPurchase.lineTotal || formatPrice
    : taxRate != undefined
    ? new Money(taxRate || 0, config.currency)
    : new Money(0, config.currency);

  console.log(999, price, taxRate);

  const seat = transaction?.booking?.attributes?.seats;

  return (!taxRate && translationKey === 'BookingBreakdown.tax') ||
    (transaction.attributes.payinTotal &&
      !transaction.attributes.payinTotal.amount) ? null : formattedUnitPrice ? (
    <div className={css.lineItem}>
      <span className={css.itemLabel}>
        <FormattedMessage
          id={translationKey}
          values={{ tax: taxRate != null ? taxRate || 0 : null }}
        />
        {price.amount && !seat ? '' : ` * ${seat}`}
      </span>
      <span className={css.itemValue}>
        {price.amount ||
        (transaction.attributes.payinTotal && transaction.attributes.payinTotal.amount)
          ? formattedUnitPrice
          : intl.formatMessage({ id: 'BookingBreakdown.freePrice' })}
      </span>
    </div>
  ) : null;
};

LineItemTaxMaybe.propTypes = {
  transaction: propTypes.transaction.isRequired,
  unitType: propTypes.bookingUnitType.isRequired,
  intl: intlShape.isRequired,
};

export default LineItemTaxMaybe;
