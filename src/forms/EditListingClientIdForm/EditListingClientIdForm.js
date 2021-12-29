import React from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { injectIntl, FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import config from '../../config';
import { FieldArray } from 'react-final-form-arrays';
import { Button, FieldRadioButton, FieldTextInput, Form, InlineTextButton } from '../../components';
import { required, composeValidators } from '../../util/validators';
import { MdOutlineClose } from 'react-icons/md';

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
        form,
      } = formRenderProps;
      console.log(values);
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
          <div className={css.typeContainer}>
            <FieldRadioButton
              className={css.type}
              id="type1"
              name="type"
              label="Solicited"
              value="solicited"
              // showAsRequired={showAsRequired}
              onClick={() => form.change('clientId', null)}
            />
            <FieldRadioButton
              className={css.type}
              id="type2"
              name="type"
              label="Unsolicited"
              value="unsolicited"
              // showAsRequired={showAsRequired}
              onClick={() => form.change('clientId', [''])}
            />
          </div>
          {values.type === 'solicited' ? (
            <FieldTextInput
              id="clientId"
              name="clientId"
              className={css.clientId}
              type="text"
              label={clientIdMessage}
              placeholder={clientIdPlaceholderMessage}
              validate={composeValidators(required(clientIdRequiredMessage))}
            />
          ) : (
            <FieldArray name="clientId">
              {({ fields }) => {
                return (
                  <div className={css.sectionContainer}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="EditListingClientIdForm.clientIdLabel" />
                      {/* Practice area */}
                    </h3>

                    {fields.map((name, i) => {
                      return (
                        <div key={name + i}>
                          <div className={css.fromgroup}>
                            <FieldTextInput
                              id={name}
                              name={name}
                              className={css.clientId}
                              type="text"
                              // label={clientIdMessage}
                              placeholder={clientIdPlaceholderMessage}
                              validate={composeValidators(required(clientIdRequiredMessage))}
                            />
                            <MdOutlineClose
                              onClick={() => {
                                form.change(
                                  'clientId',
                                  values.clientId.filter(f => f !== values.clientId[i])
                                );
                                if (values.clientId.length === 1) {
                                  form.change('clientId', ['']);
                                }
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div className={css.inlinefrom}>
                      <InlineTextButton
                        className={css.addMore}
                        type="button"
                        onClick={() => {
                          fields.push();
                        }}
                        // disabled={!values.practice[values.practice?.length - 1]}
                      >
                        <FormattedMessage id="EditListingClientIdForm.addMoreClient" />
                      </InlineTextButton>
                      {/* <Button
                        className={css.remove}
                        type="button"
                        onClick={() => {
                          fields.pop();
                        }}
                        // disabled={values.practice?.length < 2}
                      >
                        <FormattedMessage id="ProfileSettingsForm.remove" />
                      </Button> */}
                    </div>
                  </div>
                );
              }}
            </FieldArray>
          )}
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
