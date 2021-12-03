import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import classNames from 'classnames';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { propTypes } from '../../util/types';
import config from '../../config';
import { Button, FieldCheckboxGroup, FieldSelect, FieldTextInput, Form } from '../../components';
import * as validators from '../../util/validators';

import css from './EditListingDurationForm.module.css';
import cloneDeep from 'lodash.clonedeep';

const EditListingDurationFormComponent = props => (
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
        form,
      } = formRenderProps;

      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = disabled || invalid || submitInProgress;

      const { updateListingError, showListingsError } = fetchErrors || {};
      const errorMessage = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDurationForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDurationForm.showListingFailed" />
        </p>
      ) : null;

      const durationPlaceholder = intl.formatMessage({
        id: 'EditListingDurationForm.durationPlaceholder',
      });

      const durationRequiredMessage = intl.formatMessage({
        id: 'EditListingDurationForm.durationRequired',
      });
      const durationRequired = validators.required(durationRequiredMessage);
      const durationInvalidMessage = intl.formatMessage({
        id: 'EditListingDurationForm.durationInvalid',
      });
      const durationValid = validators.numberValid(durationInvalidMessage);

      const required = validators.required('This field is required');

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessage}
          {errorMessageShowListing}

          <div className={css.sectionContainer}>
            <h3 className={css.sectionTitle}>
              <FormattedMessage id="EditListingDurationForm.title" />
            </h3>
            <FieldTextInput
              id="duration"
              name="duration"
              className={css.duration}
              type="text"
              placeholder={durationPlaceholder}
              validate={validators.composeValidators(durationRequired, durationValid)}
            />
            <FieldSelect id="durationUnit" name="durationUnit" validate={required}>
              <option>Select one</option>
              <option key="hour" value="hours">
                Hour
              </option>
              <option key="minutes" value="minutes">
                Minutes
              </option>
            </FieldSelect>
          </div>

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

EditListingDurationFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  fetchErrors: null,
};

EditListingDurationFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  intl: intlShape.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

const EditListingDurationForm = compose(injectIntl)(EditListingDurationFormComponent);

export default EditListingDurationForm;
