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
import { Button, Form, FieldCurrencyInput, FieldTextInput } from '../../components';
import css from './EditListingPricingForm.module.css';

const { Money } = sdkTypes;

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

      const translationKey = isNightly
        ? 'EditListingPricingForm.pricePerNight'
        : isDaily
        ? 'EditListingPricingForm.pricePerDay'
        : 'EditListingPricingForm.pricePerUnit';

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

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { updateListingError, showListingsError } = fetchErrors || {};
      const required = validators.required('This field is required');
      const vatLabel = intl.formatMessage({ id: 'EditListingPricingForm.vatLabel' });
      const vattypeLabel = intl.formatMessage({ id: 'EditListingPriceForm.vattype' });
      const pricingLabel = intl.formatMessage({ id: 'EditListingPriceForm.pricingLabel' });
      const vatInvalidMessage = intl.formatMessage({
        id: 'EditListingPricingForm.vatinvalid',
      });
      const vatValid = validators.numberValid(vatInvalidMessage);
      console.log(values, values.vatData);

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
            {category !== 'publicOral' ? (
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
                                validate={required}
                                type="textarea"
                              ></FieldTextInput>
                            </div>
                            <div className={css.fromgroup}>
                              <FieldTextInput
                                id="vat"
                                name={`${name}.vat`}
                                type="text"
                                label={vatLabel}
                                validate={validators.composeValidators(required, vatValid)}
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
            ) : (
              ''
            )}
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
