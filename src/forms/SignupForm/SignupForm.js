import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import * as validators from '../../util/validators';
import {
  Form,
  PrimaryButton,
  FieldTextInput,
  FieldSelect,
  FieldPhoneNumberInput,
  // Button,
} from '../../components';

import PhoneInput from 'react-phone-input-2';
import './PhoneInput2.css';
import css from './SignupForm.module.css';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';
import Select from 'react-select';
import config from '../../config';

const KEY_CODE_ENTER = 13;

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        onOpenTermsOfService,
        values,
        form,
        tab,
      } = fieldRenderProps;
      console.log(tab);
      const [showOtp, setShowOtp] = useState(false);
      const [otpErr, setOtpErr] = useState(false);
      const [submitProgress, setSubmitProgress] = useState(false);
      const [phnErr, setPhnErr] = useState(false);

      // email
      const emailLabel = intl.formatMessage({
        id: 'SignupForm.emailLabel',
      });
      const emailPlaceholder = intl.formatMessage({
        id: 'SignupForm.emailPlaceholder',
      });
      const emailRequiredMessage = intl.formatMessage({
        id: 'SignupForm.emailRequired',
      });
      const emailRequired = validators.required(emailRequiredMessage);
      const emailInvalidMessage = intl.formatMessage({
        id: 'SignupForm.emailInvalid',
      });
      const emailValid = validators.emailFormatValid(emailInvalidMessage);

      // password
      const passwordLabel = intl.formatMessage({
        id: 'SignupForm.passwordLabel',
      });
      const passwordPlaceholder = intl.formatMessage({
        id: 'SignupForm.passwordPlaceholder',
      });
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
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
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      // firstName
      const firstNameLabel = intl.formatMessage({
        id: 'SignupForm.firstNameLabel',
      });
      const firstNamePlaceholder = intl.formatMessage({
        id: 'SignupForm.firstNamePlaceholder',
      });
      const firstNameRequiredMessage = intl.formatMessage({
        id: 'SignupForm.firstNameRequired',
      });
      const firstNameRequired = validators.required(firstNameRequiredMessage);

      // lastName
      const lastNameLabel = intl.formatMessage({
        id: 'SignupForm.lastNameLabel',
      });
      const lastNamePlaceholder = intl.formatMessage({
        id: 'SignupForm.lastNamePlaceholder',
      });
      const lastNameRequiredMessage = intl.formatMessage({
        id: 'SignupForm.lastNameRequired',
      });
      const lastNameRequired = validators.required(lastNameRequiredMessage);

      const phonePlaceholder = intl.formatMessage({
        id: 'signupFormForm.phonePlaceholder',
      });
      const phoneLabel = intl.formatMessage({ id: 'SignupForm.phoneLabel' });

      const phoneRequiredMessage = intl.formatMessage({
        id: 'SignupForm.phoneRequired',
      });
      const phoneRequired = validators.required(phoneRequiredMessage);

      const otpPlaceholder = intl.formatMessage({
        id: 'signupFormForm.otpPlaceholder',
      });
      const otpLabel = intl.formatMessage({ id: 'signupFormForm.otpLabel' });

      const otpRequiredMessage = intl.formatMessage({
        id: 'SignupForm.otpRequired',
      });
      const otpRequired = validators.required(otpRequiredMessage);

      const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

      const emailCheck = val => {
        return val && EMAIL_RE.test(val) ? true : false;
      };

      const clientTypeLabel = intl.formatMessage({
        id: 'SignupForm.clientTypeLabel',
      });
      const clientTypePlaceholder = intl.formatMessage({
        id: 'SignupForm.clientTypePlaceholder',
      });
      const clientTypeRequiredMessage = intl.formatMessage({
        id: 'SignupForm.clientTypeRequired',
      });
      const clientTypeRequired = validators.required(clientTypeRequiredMessage);

      const required = validators.required('This field is required');

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = !values.otp || invalid || submitInProgress;
      const sendOtpDisable =
        emailCheck(values.email) && values.phoneNumber && values.phoneNumber.length > 8
          ? false
          : true;

      const handleTermsKeyUp = e => {
        // Allow click action with keyboard like with normal links
        if (e.keyCode === KEY_CODE_ENTER) {
          onOpenTermsOfService();
        }
      };
      const termsLink = (
        <span
          className={css.termsLink}
          onClick={onOpenTermsOfService}
          role="button"
          tabIndex="0"
          onKeyUp={handleTermsKeyUp}
        >
          <FormattedMessage id="SignupForm.termsAndConditionsLinkText" />
        </span>
      );

      const sendOtp = () => {
        if (values.phoneNumber) {
          axios
            .post(`${apiBaseUrl()}/api/user`, {
              email: values.email,
              mobile: '+' + values.phoneNumber,
            })
            .then(resp => {
              console.log(resp);
            })
            .catch(err => console.log(err));
        } else {
          return;
        }
      };

      const signUpSubmit = () => {
        setSubmitProgress(true);
        console.log(submitInProgress, inProgress);

        axios
          .post(`${apiBaseUrl()}/api/user/verify`, {
            otp: values.otp * 1,
            mobile: '+' + values.phoneNumber,
          })
          .then(resp => {
            console.log(resp);
            handleSubmit();
          })
          .catch(err => {
            if (err.response.status === 401) {
              setOtpErr(true);
            }
            setTimeout(() => {
              setSubmitProgress(false);
            }, 2000);
            console.log(err.response.status);
          });
      };

      return (
        <Form className={classes}>
          <div>
            <div className={`${css.name} ${css.fromgp}`}>
              <FieldTextInput
                className={css.firstNameRoot}
                type="text"
                id={formId ? `${formId}.fname` : 'fname'}
                name="fname"
                autoComplete="given-name"
                label={firstNameLabel}
                placeholder={firstNamePlaceholder}
                validate={firstNameRequired}
              />
              <FieldTextInput
                className={css.lastNameRoot}
                type="text"
                id={formId ? `${formId}.lname` : 'lname'}
                name="lname"
                autoComplete="family-name"
                label={lastNameLabel}
                placeholder={lastNamePlaceholder}
                validate={lastNameRequired}
              />
            </div>

            <div className={css.fromgp}>
              <FieldTextInput
                type="email"
                id={formId ? `${formId}.email` : 'email'}
                name="email"
                autoComplete="email"
                label={emailLabel}
                placeholder={emailPlaceholder}
                validate={validators.composeValidators(emailRequired, emailValid)}
              />
            </div>
            {tab === 'signup' ? (
              <div className={css.fromgp}>
                <FieldSelect
                  id="clientType"
                  name="clientType"
                  label={clientTypeLabel}
                  validate={clientTypeRequired}
                >
                  <option value="">{clientTypePlaceholder}</option>
                  <option value="legalEntity">Legal Entity</option>
                  <option value="privateIndividual">Private Individual</option>
                </FieldSelect>
              </div>
            ) : (
              ''
            )}
            <div className={css.fromgp}>
              <label className={css.selectLabel}>{phoneLabel}</label>
              <div className={css.phoneInputField}>
                <div className={css.phnWithErr}>
                  <PhoneInput
                    value={values.phoneNumber}
                    onChange={val => {
                      // values.phoneNumber && isPossiblePhoneNumber(values.phoneNumber)
                      //   ? setPhoneErr(false)
                      //   : '';
                      values.phoneNumber && values.phoneNumber.length > 8 ? setPhnErr(false) : '';
                      form.change('phoneNumber', `+${val}`);
                    }}
                    onBlur={() => {
                      // values.phoneNumber && isPossiblePhoneNumber(values.phoneNumber)
                      values.phoneNumber && values.phoneNumber.length > 8
                        ? setPhnErr(false)
                        : setPhnErr(true);
                    }}
                  />
                  {phnErr ? (
                    <span className={css.phnErrMsg}>
                      <FormattedMessage id="profileSettingForm.phoneRequired" />
                    </span>
                  ) : (
                    ''
                  )}
                </div>
                <button
                  className={css.sendOtpButton}
                  type="button"
                  onClick={() => {
                    // this.setState({ showOtp: true });
                    setShowOtp(true);
                    sendOtp();
                  }}
                  // inProgress={}
                  disabled={sendOtpDisable}
                >
                  <FormattedMessage id="ProfileSettingsForm.sendOtp" />
                </button>
              </div>
            </div>

            {showOtp ? (
              <div className={css.fromgp}>
                <FieldTextInput
                  className={css.otp}
                  type="password"
                  id={formId ? `${formId}.otp` : 'otp'}
                  name="otp"
                  label={otpLabel}
                  placeholder={otpPlaceholder}
                  validate={otpRequired}
                />
                {otpErr ? (
                  <span className={css.otpErrMsg}>
                    {' '}
                    <FormattedMessage id="SignupForm.otpErrMsg" />
                  </span>
                ) : (
                  ''
                )}
              </div>
            ) : (
              ''
            )}

            <div className={css.fromgp}>
              <FieldTextInput
                className={css.password}
                type="password"
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                autoComplete="new-password"
                label={passwordLabel}
                placeholder={passwordPlaceholder}
                validate={passwordValidators}
              />
            </div>

            <div className={css.bottomWrapper}>
              <p className={css.bottomWrapperText}>
                <span className={css.termsText}>
                  <FormattedMessage
                    id="SignupForm.termsAndConditionsAcceptText"
                    values={{ termsLink }}
                  />
                </span>
              </p>

              <PrimaryButton
                type="button"
                onClick={() => signUpSubmit()}
                inProgress={submitInProgress || submitProgress}
                disabled={submitDisabled}
              >
                <FormattedMessage id="SignupForm.signUp" />
              </PrimaryButton>
            </div>
          </div>
        </Form>
      );
    }}
  />
);

SignupFormComponent.defaultProps = { inProgress: false };

const { bool, func } = PropTypes;

SignupFormComponent.propTypes = {
  inProgress: bool,

  onOpenTermsOfService: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SignupForm = compose(injectIntl)(SignupFormComponent);
SignupForm.displayName = 'SignupForm';

export default SignupForm;
