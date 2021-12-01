import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators } from '../../util/validators';
import { Form, Button, FieldTextInput } from '../../components';

import css from './EditListingDescriptionForm.module.css';

const TITLE_MAX_LENGTH = 60;

const EditListingDescriptionFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        certificateOptions,
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
      } = formRenderProps;

      const titleMessage =
        category === 'customService'
          ? intl.formatMessage({ id: 'EditListingDescriptionForm.serviceTitle' })
          : intl.formatMessage({ id: 'EditListingDescriptionForm.oralTitle' });
      const titlePlaceholderMessage =
        category === 'customService'
          ? intl.formatMessage({
              id: 'EditListingDescriptionForm.serviceTitlePlaceholder',
            })
          : intl.formatMessage({
              id: 'EditListingDescriptionForm.oralTitlePlaceholder',
            });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDescriptionForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage =
        category === 'customService'
          ? intl.formatMessage({
              id: 'EditListingDescriptionForm.serviceDescription',
            })
          : intl.formatMessage({
              id: 'EditListingDescriptionForm.oralDescription',
            });
      const descriptionPlaceholderMessage =
        category === 'customService'
          ? intl.formatMessage({
              id: 'EditListingDescriptionForm.serviceDescriptionPlaceholder',
            })
          : intl.formatMessage({
              id: 'EditListingDescriptionForm.oralDescriptionPlaceholder',
            });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.descriptionRequired',
      });

      const disclaimerMessage =
        category === 'customService'
          ? intl.formatMessage({
              id: 'EditListingDescriptionForm.serviceDisclaimer',
            })
          : intl.formatMessage({
              id: 'EditListingDescriptionForm.oralDisclaimer',
            });
      const disclaimerPlaceholderMessage =
        category === 'customService'
          ? intl.formatMessage({
              id: 'EditListingDescriptionForm.serviceDisclaimerPlaceholder',
            })
          : intl.formatMessage({
              id: 'EditListingDescriptionForm.oralDisclaimerPlaceholder',
            });
      const disclaimerRequiredMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.disclaimerRequired',
      });

      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          <FieldTextInput
            id="title"
            name="title"
            className={css.title}
            type="text"
            label={titleMessage}
            placeholder={titlePlaceholderMessage}
            maxLength={TITLE_MAX_LENGTH}
            validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
            autoFocus
          />

          <FieldTextInput
            id="description"
            name="description"
            className={css.description}
            type="textarea"
            label={descriptionMessage}
            placeholder={descriptionPlaceholderMessage}
            validate={composeValidators(required(descriptionRequiredMessage))}
          />

          <FieldTextInput
            id="disclaimer"
            name="disclaimer"
            className={css.disclaimer}
            type="textarea"
            label={disclaimerMessage}
            placeholder={disclaimerPlaceholderMessage}
            validate={composeValidators(required(disclaimerRequiredMessage))}
          />

          {/* <CustomCertificateSelectFieldMaybe
            id="certificate"
            name="certificate"
            certificateOptions={certificateOptions}
            intl={intl}
          /> */}

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

EditListingDescriptionFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingDescriptionFormComponent.propTypes = {
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

export default compose(injectIntl)(EditListingDescriptionFormComponent);
