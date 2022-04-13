import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { injectIntl, FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import config from '../../config';
import { Button, FieldDateInput, Form } from '../../components';
import { required, composeValidators } from '../../util/validators';

import css from './EditListingDeadlineForm.module.css';
import moment from 'moment';

const EditListingDeadlineFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        disabled,
        ready,
        rootClassName,
        className,
        handleSubmit,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        invalid,
        intl,
        values,
      } = formRenderProps;

      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = disabled || invalid || submitInProgress;

      const { updateListingError, showListingsError } = fetchErrors || {};
      const errorMessage = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDeadlineForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDeadlineForm.showListingFailed" />
        </p>
      ) : null;
      const VALID = undefined;

      const deadlineValidator = message => value => {
        if (
          moment().isAfter(value) &&
          !moment(moment().format('YYYY-MM-DD')).isSame(moment(value))
        ) {
          return message;
        }
        return VALID;
      };
      const deadlineRequiredMessage = intl.formatMessage({
        id: 'EditListingDeadlineForm.deadlineRequired',
      });
      const deadlineInvalidMessage = intl.formatMessage({
        id: 'EditListingDeadlineForm.deadlineInvalid',
      });
      const deadlinePlaceholder = intl.formatMessage({
        id: 'EditListingDeadlineForm.deadlinePlaceholder',
      });

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessage}
          {errorMessageShowListing}
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="EditListingDeadlineForm.subTitle" />
          </h3>

          <FieldDateInput
            className={`${css.street} `}
            id="deadLineDate"
            name="Deadline"
            // label={fromLabel}
            placeholderText={deadlinePlaceholder}
            validate={composeValidators(
              deadlineValidator(deadlineInvalidMessage),
              required(deadlineRequiredMessage)
            )}
            isDayBlocked={day => {
              return false;
            }}
            // isOutsideRange={() => false}
            useMobileMargins
          />
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

EditListingDeadlineFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  fetchErrors: null,
  areaOfLawOptions: config.custom.areaOfLaw.options,
};

EditListingDeadlineFormComponent.propTypes = {
  rootClassName: string,
  className: string,
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
  areaOfLawOptions: propTypes.areaOfLawOptions,
};

const EditListingDeadlineForm = compose(injectIntl)(EditListingDeadlineFormComponent);

export default EditListingDeadlineForm;
