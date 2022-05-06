import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { Form, PrimaryButton, FieldTextInput } from '../../components';
import * as validators from '../../util/validators';
import queryString from 'query-string';

import css from './PasswordResetForm.module.css';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';

const PasswordResetFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        intl,
        invalid,
        values,
      } = fieldRenderProps;
      const [phoneNumber, setPhoneNumber] = useState(null);

      useEffect(() => {
        const email = queryString.parse(props.location.search)?.e;
        if (email) {
          axios
            .post(`${apiBaseUrl()}/api/getMobileNo`, {
              email: email,
            })
            .then(res => {
              setPhoneNumber(res.data.phoneNumber);
            })
            .catch(err => {
              console.log(err);
            });
        }
      }, []);

      const [otpErr, setOtpErr] = useState(false);

      // password
      const passwordLabel = intl.formatMessage({
        id: 'PasswordResetForm.passwordLabel',
      });
      const passwordPlaceholder = intl.formatMessage({
        id: 'PasswordResetForm.passwordPlaceholder',
      });
      const passwordRequiredMessage = intl.formatMessage({
        id: 'PasswordResetForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'PasswordResetForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'PasswordResetForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );

      const classes = classNames(rootClassName || css.root, className);

      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      const otpRequiredMessage = intl.formatMessage({
        id: 'PasswordResetForm.otpRequired',
      });
      const otpRequired = validators.required(otpRequiredMessage);

      return (
        <Form
          className={classes}
          onSubmit={e => {
            e.preventDefault();
            axios
              .post(`${apiBaseUrl()}/api/user/verify`, {
                otp: values.otp * 1,
                mobile: phoneNumber,
              })
              .then(resp => {
                handleSubmit(e);
              })
              .catch(err => {
                if (err.response.status === 401) {
                  setOtpErr(true);
                }

                console.log(err.response.status);
              });
          }}
        >
          <FieldTextInput
            className={css.password}
            type="password"
            id={formId ? `${formId}.password` : 'password'}
            name="password"
            autoComplete="new-password"
            label={passwordLabel}
            placeholder={passwordPlaceholder}
            validate={validators.composeValidators(
              passwordRequired,
              passwordMinLength,
              passwordMaxLength
            )}
          />
          <div className={css.otp}>
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
              {otpErr ? (
                <span className={css.otpErrMsg}>
                  {' '}
                  <FormattedMessage id="PasswordResetForm.otpErrMsg" />
                </span>
              ) : (
                ''
              )}
            </>
          </div>
          <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
            <FormattedMessage id="PasswordResetForm.submitButtonText" />
          </PrimaryButton>
        </Form>
      );
    }}
  />
);

PasswordResetFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  inProgress: false,
  formId: null,
};

const { string, bool } = PropTypes;

PasswordResetFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  inProgress: bool,
  intl: intlShape.isRequired,
  formId: string,
};

const PasswordResetForm = compose(injectIntl)(PasswordResetFormComponent);
PasswordResetForm.displayName = 'PasswordResetForm';

export default withRouter(PasswordResetForm);
