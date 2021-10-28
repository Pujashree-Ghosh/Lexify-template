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
  FieldPhoneNumberInput,
  Button,
} from '../../components';

import css from './SignupForm.module.css';
import './reactPhoneInput.css';
import PhoneInput, {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  isPossiblePhoneNumber,
<<<<<<< HEAD
} from 'react-phone-input-2';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';
// import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
=======
} from 'react-phone-number-input';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';
>>>>>>> 62e9bc21a4fb96d87d706c9fe0ccccbf5a346196

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
      } = fieldRenderProps;
      const [showOtp, setShowOtp] = useState(false);
      const [otpErr, setOtpErr] = useState(false);
      const [phoneErr, setPhoneErr] = useState(false);
      const [submitProgress, setSubmitProgress] = useState(false);

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

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = !values.otp || invalid || submitInProgress;
      const sendOtpDisable =
<<<<<<< HEAD
        emailCheck(values.email) && values.phoneNumber && values.phoneNumber.length > 8
=======
        emailCheck(values.email) &&
        values.phoneNumber &&
        isPossiblePhoneNumber(values.phoneNumber) &&
        formatPhoneNumberIntl(values.phoneNumber).split(' ')[0] > 0
>>>>>>> 62e9bc21a4fb96d87d706c9fe0ccccbf5a346196
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
        axios
          .post(`${apiBaseUrl()}/api/user`, {
            email: values.email,
<<<<<<< HEAD
            mobile: '+' + values.phoneNumber,
=======
            mobile: values.phoneNumber,
>>>>>>> 62e9bc21a4fb96d87d706c9fe0ccccbf5a346196
          })
          .then(resp => {
            console.log(resp);
          })
          .catch(err => console.log(err));
      };

      const signUpSubmit = () => {
        setSubmitProgress(true);
        console.log(submitInProgress, inProgress);

        axios
          .post(`${apiBaseUrl()}/api/user/verify`, {
            otp: values.otp * 1,
            mobile: values.phoneNumber,
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

      // console.log(
      //   values.phoneNumber && formatPhoneNumber(values.phoneNumber),
      //   values.phoneNumber && isValidPhoneNumber(values.phoneNumber),
      //   values.phoneNumber && isPossiblePhoneNumber(values.phoneNumber),
      //   values.phoneNumber && formatPhoneNumberIntl(values.phoneNumber).split(' ')
      // );

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
            <div className={css.fromgp}>
              <label className={css.selectLabel}>{phoneLabel}</label>
              <div className={css.phoneInputField}>
                <div className={css.phnWithErr}>
                  <PhoneInput
<<<<<<< HEAD
                    // international
                    // countryCallingCodeEditable={false}
                    onChange={val => {
                      values.phoneNumber && values.phoneNumber.length > 8 ? setPhoneErr(false) : '';
                      form.change('phoneNumber', val);
                    }}
                    onBlur={() => {
                      values.phoneNumber && values.phoneNumber.length > 8
                        ? setPhoneErr(false)
                        : setPhoneErr(true);
                      console.log(values.phoneNumber);
=======
                    international
                    // countryCallingCodeEditable={false}
                    onChange={val => {
                      values.phoneNumber && isPossiblePhoneNumber(values.phoneNumber)
                        ? setPhoneErr(false)
                        : '';
                      form.change('phoneNumber', val);
                    }}
                    onBlur={() => {
                      values.phoneNumber && isPossiblePhoneNumber(values.phoneNumber)
                        ? setPhoneErr(false)
                        : setPhoneErr(true);
>>>>>>> 62e9bc21a4fb96d87d706c9fe0ccccbf5a346196
                    }}
                  />
                  {phoneErr ? (
                    <span className={css.phnErrMsg}>
                      <FormattedMessage id="SignupForm.phoneRequired" />
                    </span>
                  ) : (
                    ''
                  )}
                </div>
                <button
                  className={css.sendOtpButton}
                  type="button"
                  onClick={() => {
                    setShowOtp(true);
                    sendOtp();
                  }}
                  // inProgress={}
                  disabled={sendOtpDisable}
                >
                  <FormattedMessage id="SignupForm.sendOtp" />
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

            {/* <div className={css.selectLabel}>Select country</div>

            <Select
              options={countryOptions || []}
              // value={values.countryCode}
              // label="name"
              getOptionLabel={option => `${option.name} (${option.dialCode})`}
              // getOptionValue={option => option.dialCode}
              getOptionValue={option => option['dialCode']}
              // onChange={changeHandler}
              // options={this.state.roleData}
              name="countryCode"
              id="countryCode"
              // placeholder="Now type the Job Role or Government Position Classification Hereyr"
              value={countryOptions.filter(
                item => item.dialCode === values.countryCode && item.name === values.countryName
              )}
              // // id="subsectors"
              onChange={val => {
                if (val && val.dialCode) {
                  form.change('countryCode', val.dialCode);
                  form.change('countryName', val.name);
                }
                // val &&
                //   val.dialCode &&
                //   form.change('phoneNumber', `${val.dialCode}${phoneNumber}`);
                // val && form.change('isGrade', values.isGrade || null);
              }}
            /> */}

            {/* <FieldPhoneNumberInput
              className={css.phone}
              name="phoneNumber"
              id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
              label={phoneLabel}
              placeholder={phonePlaceholder}
              validate={phoneRequired}
            /> */}
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
