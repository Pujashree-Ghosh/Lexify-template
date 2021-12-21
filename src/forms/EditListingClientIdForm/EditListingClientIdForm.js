import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { injectIntl, FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import config from '../../config';
import { Button, FieldTextInput, Form } from '../../components';
import { required, composeValidators } from '../../util/validators';

import css from './EditListingClientIdForm.module.css';

const EditListingClientIdFormComponent = props => (
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
          <FormattedMessage id="EditListingClientIdForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingClientIdForm.showListingFailed" />
        </p>
      ) : null;

      const clientIdMessage = intl.formatMessage({
        id: 'EditListingClientIdForm.clientIdLabel',
      });
      const clientIdPlaceholderMessage = intl.formatMessage({
        id: 'EditListingClientIdForm.clientIdPlaceholder',
      });
      const clientIdRequiredMessage = intl.formatMessage({
        id: 'EditListingClientIdForm.clientIdRequired',
      });

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessage}
          {errorMessageShowListing}
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="EditListingClientIdForm.subTitle" />
          </h3>
          <FieldTextInput
            id="clientId"
            name="clientId"
            className={css.clientId}
            type="text"
            label={clientIdMessage}
            placeholder={clientIdPlaceholderMessage}
            validate={composeValidators(required(clientIdRequiredMessage))}
          />
          <div className={css.infoText}>You can find client ID in client's profile</div>
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

EditListingClientIdFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  fetchErrors: null,
  areaOfLawOptions: config.custom.areaOfLaw.options,
};

EditListingClientIdFormComponent.propTypes = {
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

const EditListingClientIdForm = compose(injectIntl)(EditListingClientIdFormComponent);

export default EditListingClientIdForm;
