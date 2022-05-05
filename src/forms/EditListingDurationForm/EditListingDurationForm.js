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
      const submitDisabled = disabled || invalid || submitInProgress || pristine;

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

      const durationLabel = intl.formatMessage({
        id: 'EditListingDurationForm.durationLabel',
      });

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
      const hour = Array(24).fill();
      const minute = Array(4).fill();

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessage}
          {errorMessageShowListing}

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
