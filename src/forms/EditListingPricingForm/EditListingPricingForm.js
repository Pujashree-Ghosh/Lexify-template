import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import config from '../../config';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
import { FieldArray } from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import { Button, Form, FieldCurrencyInput, FieldTextInput, FieldSelect } from '../../components';
import {
  isSafeNumber,
  unitDivisor,
  convertUnitToSubUnit,
  convertMoneyToNumber,
  ensureDotSeparator,
  ensureSeparator,
  truncateToSubUnitPrecision,
  convertDecimalJSToNumber,
} from '../../util/currency';
import css from './EditListingPricingForm.module.css';

const { Money } = sdkTypes;

const firstPercentage = parseInt(process.env.REACT_APP_FIRST_PRICE_PERCENT);
const secondPercentage = parseInt(process.env.REACT_APP_SECOND_PRICE_PERCENT);
const thirdPercentage = parseInt(process.env.REACT_APP_THIRD_PRICE_PERCENT);
const fixedPrice = parseInt(process.env.REACT_APP_FIXED_PRICE);

const getFormatedPrice = (initialValue, intl) => {
  const testSubUnitFormat = intl.formatNumber('1.1', config.currencyConfig);
  const usesComma = testSubUnitFormat.indexOf(',') >= 0;
  const hasInitialValue = typeof initialValue === 'number' && !isNaN(initialValue);

  const unformattedValue = hasInitialValue
    ? truncateToSubUnitPrecision(
        ensureSeparator(initialValue.toString(), usesComma),
        unitDivisor(config.currencyConfig.currency),
        usesComma
      )
    : '';
  // Formatted value fully localized currency string ("$1,000.99")
  const formattedValue = hasInitialValue
    ? intl.formatNumber(ensureDotSeparator(unformattedValue), config.currencyConfig)
    : '';

  return formattedValue;
};

const calculateUnformatCommission = totalPrice => {
  const numericTotalPrice = totalPrice instanceof Money ? totalPrice.amount : totalPrice;
  let totalCommission;
  if (numericTotalPrice <= parseInt(process.env.REACT_APP_FIRST_PRICE_THRES)) {
    totalCommission = (numericTotalPrice * firstPercentage) / 100;
    totalCommission += fixedPrice;
  } else if (numericTotalPrice <= parseInt(process.env.REACT_APP_SECOND_PRICE_THRES)) {
    totalCommission = (numericTotalPrice * secondPercentage) / 100;
  } else {
    totalCommission = (numericTotalPrice * thirdPercentage) / 100;
  }
  return totalCommission;
};
const calcuteCommission = (totalPrice, intl) => {
  const currency = totalPrice instanceof Money ? totalPrice.currency : config.currency;
  const totalCommission = calculateUnformatCommission(totalPrice);
  const totalCommissionInMoney = new Money(totalCommission, currency);
  return getFormatedPrice(convertMoneyToNumber(totalCommissionInMoney), intl);
};

const getFinalPrice = (values, intl) => {
  const initialValueIsMoney = values.price instanceof Money;
  const currency = values.price instanceof Money ? values.price.currency : config.currency;
  const initialValue = initialValueIsMoney ? convertMoneyToNumber(values.price) : values.price;
  const vatValue = values.vatData.reduce(
    (pre, curnt) =>
      !!curnt && !!curnt.vatType && !!curnt.vat
        ? pre + parseInt(parseInt(curnt.vat) * initialValue) / 100
        : pre,
    0
  );
  const commissionInSubunit = calculateUnformatCommission(values.price);
  const commission = convertMoneyToNumber(new Money(commissionInSubunit, currency));

  const finalPrice = initialValue + vatValue - commission;
  return getFormatedPrice(finalPrice, intl);
};

export const EditListingPricingFormComponent = props => (
  <FinalForm
    mutators={{ ...arrayMutators }}
    {...props}
    render={formRenderProps => {
      const {
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        category,
        fetchErrors,
        values,
      } = formRenderProps;

      const unitType = config.bookingUnitType;
      const isNightly = unitType === LINE_ITEM_NIGHT;
      const isDaily = unitType === LINE_ITEM_DAY;

      const initialValueIsMoney = values.price instanceof Money;
      const initialValue = initialValueIsMoney ? convertMoneyToNumber(values.price) : values.price;

      const formattedValue = getFormatedPrice(initialValue, intl);

      const translationKey = isNightly
        ? 'EditListingPricingForm.pricePerNight'
        : isDaily
        ? 'EditListingPricingForm.pricePerDay'
        : 'EditListingPricingForm.pricePerUnit';

      const durationLabel = intl.formatMessage({
        id: 'EditListingDurationForm.durationLabel',
      });
      const pricePerUnitMessage = intl.formatMessage({
        id: translationKey,
      });

      const pricePlaceholderMessage = intl.formatMessage({
        id: 'EditListingPricingForm.priceInputPlaceholder',
      });

      const priceRequired = validators.required(
        intl.formatMessage({
          id: 'EditListingPricingForm.priceRequired',
        })
      );
      const minPrice = new Money(config.listingMinimumPriceSubUnits, config.currency);
      const minPriceRequired = validators.moneySubUnitAmountAtLeast(
        intl.formatMessage(
          {
            id: 'EditListingPricingForm.priceTooLow',
          },
          {
            minPrice: formatMoney(intl, minPrice),
          }
        ),
        config.listingMinimumPriceSubUnits
      );
      const priceValidators = config.listingMinimumPriceSubUnits
        ? validators.composeValidators(priceRequired, minPriceRequired)
        : priceRequired;

      const hour = Array(24).fill();
      const minute = Array(4).fill();

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled =
        invalid ||
        disabled ||
        submitInProgress ||
        pristine ||
        (category === 'publicOral' || category === 'customOral'
          ? !values.durationHour || !values.durationMinute
          : false);
      const { updateListingError, showListingsError } = fetchErrors || {};
      const required = validators.required('This field is required');
      const vatLabel = intl.formatMessage({ id: 'EditListingPricingForm.vatLabel' });
      const vattypeLabel = intl.formatMessage({ id: 'EditListingPriceForm.vattype' });
      const pricingLabel = intl.formatMessage({ id: 'EditListingPriceForm.pricingLabel' });
      const vatInvalidMessage = intl.formatMessage({
        id: 'EditListingPricingForm.vatinvalid',
      });
      const vatValid = validators.numberValid(vatInvalidMessage);

      return (
        <Form onSubmit={handleSubmit} className={classes}>
          {updateListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.updateFailed" />
            </p>
          ) : null}
          {showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingForm.showListingFailed" />
            </p>
          ) : null}

          <div className={css.selectform}>
            {(category === 'publicOral' || category === 'customOral') && (
              <div className={css.sectionContainer}>
                <label>{durationLabel}</label>

                {/* <FieldTextInput
                id="duration"
                name="duration"
                className={css.duration}
                type="text"
                // label={durationLabel}
                placeholder={durationPlaceholder}
                validate={validators.composeValidators(durationRequired, durationValid)}
              /> */}
                {/* <FieldSelect id="durationUnit" name="durationUnit" validate={required}>
                <option value="">Select one</option>
                <option key="hour" value="hours">
                  Hours
                </option>
                <option key="minutes" value="minutes">
                  Minutes
                </option>
              </FieldSelect> */}

                <div className={css.selecthm}>
                  <FieldSelect
                    id="durationHour"
                    name="durationHour"
                    validate={required}
                    label="Hour"
                    className={css.hrtime}
                  >
                    <option value="" hidden={true}>
                      hh
                    </option>
                    {hour.map((m, i) => (
                      <option key={i} value={i}>
                        {i > 9 ? i : `0${i}`}
                      </option>
                    ))}
                  </FieldSelect>

                  <FieldSelect
                    id="durationMinute"
                    name="durationMinute"
                    validate={required}
                    label="Minute"
                    className={css.minime}
                  >
                    <option value="" hidden={true}>
                      mm
                    </option>
                    {minute.map((m, i) => (
                      <option key={i * 15} value={i * 15}>
                        {i * 15 > 9 ? i * 15 : `0${i * 15}`}
                      </option>
                    ))}
                  </FieldSelect>
                </div>

                <div className="css.infoText">Enter duration for this consultation</div>
              </div>
            )}

            {/* {category !== 'publicOral' ? ( */}
            <FieldArray name="vatData">
              {({ fields }) => {
                return (
                  <div className={css.sectionContainer}>
                    {fields.map((name, i) => {
                      return (
                        <div key={name + i}>
                          <div className={css.fromgroup}>
                            <FieldTextInput
                              id="vattype"
                              name={`${name}.vatType`}
                              label={vattypeLabel}
                              // validate={required}
                              type="textarea"
                            ></FieldTextInput>
                          </div>
                          <div className={css.fromgroup}>
                            <FieldTextInput
                              id="vat"
                              name={`${name}.vat`}
                              type="text"
                              label={vatLabel}
                              // validate={validators.composeValidators(vatValid)}
                              // validate={required}

                              // pattern={'/^[0-9\b]+$/'}
                            ></FieldTextInput>
                          </div>
                        </div>
                      );
                    })}
                    <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                      <Button
                        className={css.addMore}
                        type="button"
                        onClick={() => {
                          fields.push();
                        }}
                        disabled={
                          !values.vatData[values.vatData?.length - 1]?.vatType ||
                          !values.vatData[values.vatData?.length - 1]?.vat
                        }
                      >
                        <FormattedMessage id="editlistingPricingForm.addMore" />
                      </Button>
                      <Button
                        className={css.remove}
                        type="button"
                        onClick={() => {
                          fields.pop();
                        }}
                        disabled={values.vatData?.length < 2}
                      >
                        <FormattedMessage id="editlistingPricingForm.remove" />
                      </Button>
                    </div>
                  </div>
                );
              }}
            </FieldArray>
            {/* ) : (
              ''
            )} */}
          </div>
          <FieldCurrencyInput
            id="price"
            name="price"
            className={css.priceInput}
            autoFocus
            label={pricingLabel}
            placeholder={pricePlaceholderMessage}
            currencyConfig={config.currencyConfig}
            validate={priceValidators}
          />
          <div className={css.priceInfoText}>Minimum price is 30 USD</div>

          {typeof initialValue === 'number' && !isNaN(initialValue) && initialValue >= 30 && (
            <div className={css.priceSimulator}>
              <h2>Simulator</h2>
              <div>
                <span>Base price</span>
                <span>{formattedValue}</span>
              </div>
              {values.vatData.map((vat, indx) => {
                return !!vat && !!vat.vatType && !!vat.vat ? (
                  <div key={indx}>
                    <span>
                      + VAT on {vat.vatType.toUpperCase()}({vat.vat}%)
                    </span>
                    <span>
                      {getFormatedPrice(parseInt(parseInt(vat.vat) * initialValue) / 100, intl)}
                    </span>
                  </div>
                ) : null;
              })}
              <div>
                <span>- Lexify Commission Excluding All Taxes</span>
                <span>{calcuteCommission(values.price, intl)}</span>
              </div>
              <div>
                <span>Your net income</span>
                <span>{getFinalPrice(values, intl)}</span>
              </div>
            </div>
          )}

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled || values?.price?.amount < 3000}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingPricingFormComponent.defaultProps = { fetchErrors: null };

EditListingPricingFormComponent.propTypes = {
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingPricingFormComponent);
