import React, { useState } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { required, composeValidators } from '../../util/validators';
import { Form, Button, FieldDateInput } from '../../components';

import css from './EditListingExpiryForm.module.css';
import moment from 'moment';

const TITLE_MAX_LENGTH = 60;

const EditListingExpiryFormComponent = props => (
  <FinalForm
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
        fetchErrors,
        category,
        listing,
      } = formRenderProps;
      const [showWarning, setShowWarning] = useState(false);

      const deadLine =
        listing &&
        listing.attributes &&
        listing.attributes.publicData &&
        listing.attributes.publicData.Deadline;

      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingExpiryForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingExpiryForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress || pristine;

      const VALID = undefined;

      const expiryValidator = message => value => {
        if (category !== 'customOral' && moment(value.date).isAfter(moment(deadLine))) {
          return message;
        }
        if (
          category === 'customOral' &&
          moment().isAfter(value.date) &&
          !moment(moment().format('YYYY-MM-DD')).isSame(moment(value.date))
        ) {
          return intl.formatMessage({ id: 'EditListingDeadlineForm.deadlineInvalid' });
        }

        return VALID;
      };
      const expDateRequiredMessage = intl.formatMessage({
        id: 'EditListingExpiryForm.expDateRequired',
      });
      const expDateInvalidMessage = intl.formatMessage({
        id: 'EditListingExpiryForm.expDateInvalid',
      });
      const expiryPlaceholder = intl.formatMessage({
        id: 'EditListingExpiryForm.expiryPlaceholder',
      });

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="EditListingExpiryForm.subTitle" />
          </h3>

          <FieldDateInput
            className={`${css.street} ${css.expdate}`}
            id="expiryDate"
            name="expiry"
            validate={composeValidators(
              expiryValidator(expDateInvalidMessage),
              required(expDateRequiredMessage)
            )}
            placeholderText={expiryPlaceholder}
            isDayBlocked={day => {
              return false;
            }}
            // isOutsideRange={() => false}
            onChange={value => {
              if (
                category === 'customService' &&
                moment.duration(moment(deadLine).diff(value.date)).asHours() < 24 &&
                moment.duration(moment(deadLine).diff(value.date)).asHours() >= 0
              ) {
                setShowWarning(true);
              } else {
                setShowWarning(false);
              }
            }}
            useMobileMargins
          />
          {showWarning && <span>Expiry Date and Deadline are too close</span>}

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingExpiryFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingExpiryFormComponent.propTypes = {
  className: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  certificateOptions: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ),
};

export default compose(injectIntl)(EditListingExpiryFormComponent);
