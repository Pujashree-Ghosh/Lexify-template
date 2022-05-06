import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { ensureCurrentUser } from '../../util/data';
import { isChangePasswordWrongPassword } from '../../util/errors';
import { Form, PrimaryButton, FieldTextInput, Button } from '../../components';

import css from './PasswordChangeForm.module.css';
import { apiBaseUrl } from '../../util/api';
import axios from 'axios';

const RESET_TIMEOUT = 800;

class PasswordChangeFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { showResetPasswordMessage: false, otpSend: false, otpErr: false };
    this.resetTimeoutId = null;
    this.submittedValues = {};
    this.handleResetPassword = this.handleResetPassword.bind(this);
  }
  componentWillUnmount() {
    window.clearTimeout(this.resetTimeoutId);
  }

  handleResetPassword() {
    this.setState({ showResetPasswordMessage: true });
    const email = this.props.currentUser.attributes.email;

    this.props.onResetPassword(email);
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        render={fieldRenderProps => {
          const {
            rootClassName,
            className,
            formId,
            changePasswordError,
            currentUser,
            handleSubmit,
            inProgress,
            resetPasswordInProgress,
            intl,
            invalid,
            pristine,
            ready,
            form,
            values,
          } = fieldRenderProps;

          const user = ensureCurrentUser(currentUser);

          const email = user?.attributes?.email;
          const currentPhoneNumber = user?.attributes?.profile?.protectedData?.phoneNumber;

          if (!user.id) {
            return null;
          }

          // New password
          const newPasswordLabel = intl.formatMessage({
            id: 'PasswordChangeForm.newPasswordLabel',
          });
          const newPasswordPlaceholder = intl.formatMessage({
            id: 'PasswordChangeForm.newPasswordPlaceholder',
          });
          const newPasswordRequiredMessage = intl.formatMessage({
            id: 'PasswordChangeForm.newPasswordRequired',
          });
          const newPasswordRequired = validators.requiredStringNoTrim(newPasswordRequiredMessage);

          const passwordMinLengthMessage = intl.formatMessage(
            {
              id: 'PasswordChangeForm.passwordTooShort',
            },
            {
              minLength: validators.PASSWORD_MIN_LENGTH,
            }
          );
          const passwordMaxLengthMessage = intl.formatMessage(
            {
              id: 'PasswordChangeForm.passwordTooLong',
            },
            {
              maxLength: validators.PASSWORD_MAX_LENGTH,
            }
          );

          const passwordMinLength = validators.minLength(
            passwordMinLengthMessage,
            validators.PASSWORD_MIN_LENGTH
          );
          const passwordMaxLength = validators.maxLength(
            passwordMaxLengthMessage,
            validators.PASSWORD_MAX_LENGTH
          );

          // password
          const passwordLabel = intl.formatMessage({
            id: 'PasswordChangeForm.passwordLabel',
          });
          const passwordPlaceholder = intl.formatMessage({
            id: 'PasswordChangeForm.passwordPlaceholder',
          });
          const passwordRequiredMessage = intl.formatMessage({
            id: 'PasswordChangeForm.passwordRequired',
          });

          const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);

          const passwordFailedMessage = intl.formatMessage({
            id: 'PasswordChangeForm.passwordFailed',
          });
          const passwordTouched = this.submittedValues.currentPassword !== values.currentPassword;
          const passwordErrorText = isChangePasswordWrongPassword(changePasswordError)
            ? passwordFailedMessage
            : null;

          const confirmClasses = classNames(css.confirmChangesSection, {
            [css.confirmChangesSectionVisible]: !pristine,
          });

          const genericFailure =
            changePasswordError && !passwordErrorText ? (
              <span className={css.error}>
                <FormattedMessage id="PasswordChangeForm.genericFailure" />
              </span>
            ) : null;

          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const classes = classNames(rootClassName || css.root, className);
          const submitDisabled = invalid || pristineSinceLastSubmit || inProgress;

          const sendPasswordLink = (
            <span
              className={css.helperLink}
              onClick={() => {
                sendOtp();
                this.handleResetPassword();
              }}
              role="button"
            >
              <FormattedMessage id="PasswordChangeForm.resetPasswordLinkText" />
            </span>
          );

          const resendPasswordLink = (
            <span
              className={css.helperLink}
              onClick={() => {
                sendOtp();
                this.handleResetPassword();
              }}
              role="button"
            >
              <FormattedMessage id="PasswordChangeForm.resendPasswordLinkText" />
            </span>
          );

          const resetPasswordLink =
            this.state.showResetPasswordMessage || resetPasswordInProgress ? (
              <>
                <FormattedMessage
                  id="PasswordChangeForm.resetPasswordLinkSent"
                  values={{
                    email: <span className={css.emailStyle}>{currentUser.attributes.email}</span>,
                  }}
                />{' '}
                {resendPasswordLink}
              </>
            ) : (
              sendPasswordLink
            );

          const otpRequiredMessage = intl.formatMessage({
            id: 'PasswordChangeForm.otpRequired',
          });
          const otpRequired = validators.required(otpRequiredMessage);

          const sendOtp = () => {
            axios
              .post(`${apiBaseUrl()}/api/user`, {
                email: email,
                mobile: currentPhoneNumber,
              })
              .then(resp => {
                console.log(resp);
                // this.setState({ otpSend: true });
              })
              .catch(err => console.log(err));
          };

          return (
            <Form
              className={classes}
              onSubmit={e => {
                e.preventDefault();
                this.submittedValues = values;
                axios
                  .post(`${apiBaseUrl()}/api/user/verify`, {
                    otp: values.otp * 1,
                    mobile: currentPhoneNumber,
                  })
                  .then(resp => {
                    this.setState({ otpSend: false });
                    handleSubmit(e);
                  })
                  .catch(err => {
                    if (err.response.status === 401) {
                      this.setState({ otpErr: true });
                    }

                    console.log(err.response.status);
                  });
              }}
            >
              <div className={css.newPasswordSection}>
                <FieldTextInput
                  type="password"
                  id={formId ? `${formId}.newPassword` : 'newPassword'}
                  name="newPassword"
                  autoComplete="new-password"
                  label={newPasswordLabel}
                  placeholder={newPasswordPlaceholder}
                  validate={validators.composeValidators(
                    newPasswordRequired,
                    passwordMinLength,
                    passwordMaxLength
                  )}
                />
              </div>

              <div className={confirmClasses}>
                <h3 className={css.confirmChangesTitle}>
                  <FormattedMessage id="PasswordChangeForm.confirmChangesTitle" />
                </h3>
                <p className={css.confirmChangesInfo}>
                  <FormattedMessage id="PasswordChangeForm.confirmChangesInfo" />
                  <br />
                  <FormattedMessage
                    id="PasswordChangeForm.resetPasswordInfo"
                    values={{ resetPasswordLink }}
                  />
                </p>

                <FieldTextInput
                  className={css.password}
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  autoComplete="current-password"
                  label={passwordLabel}
                  placeholder={passwordPlaceholder}
                  validate={validators.composeValidators(
                    passwordRequired,
                    passwordMinLength,
                    passwordMaxLength
                  )}
                  customErrorText={passwordTouched ? null : passwordErrorText}
                />
              </div>
              <div className={css.otp}>
                {this.state.otpSend ? (
                  <>
                    <FieldTextInput
                      className={css.otp}
                      type="text"
                      id={formId ? `${formId}.otp` : 'otp'}
                      name="otp"
                      label={'Enter the otp send to your mobile'}
                      // placeholder={otpPlaceholder}
                      validate={otpRequired}
                    />
                  </>
                ) : (
                  ''
                )}
                {this.state.otpErr ? (
                  <span className={css.otpErrMsg}>
                    {' '}
                    <FormattedMessage id="PasswordChangeForm.otpErrMsg" />
                  </span>
                ) : (
                  ''
                )}
              </div>

              <div className={css.bottomWrapper}>
                {genericFailure}
                {!this.state.otpSend ? (
                  <Button
                    type="button"
                    inProgress={inProgress}
                    ready={ready}
                    disabled={submitDisabled}
                    onClick={() => {
                      sendOtp();
                      this.setState({ otpSend: true });
                    }}
                  >
                    <FormattedMessage id="PasswordChangeForm.saveChanges" />
                    {/* Send OTP */}
                  </Button>
                ) : (
                  <PrimaryButton
                    type="submit"
                    inProgress={inProgress}
                    ready={ready}
                    disabled={submitDisabled}
                  >
                    <FormattedMessage id="PasswordChangeForm.saveChanges" />
                  </PrimaryButton>
                )}
              </div>
            </Form>
          );
        }}
      />
    );
  }
}

PasswordChangeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  changePasswordError: null,
  inProgress: false,
  formId: null,
  resetPasswordInProgress: false,
  resetPasswordError: null,
};

const { bool, string } = PropTypes;

PasswordChangeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  changePasswordError: propTypes.error,
  inProgress: bool,
  intl: intlShape.isRequired,
  ready: bool.isRequired,
  formId: string,
  resetPasswordInProgress: bool,
  resetPasswordError: propTypes.error,
};

const PasswordChangeForm = compose(injectIntl)(PasswordChangeFormComponent);
PasswordChangeForm.displayName = 'PasswordChangeForm';

export default PasswordChangeForm;
