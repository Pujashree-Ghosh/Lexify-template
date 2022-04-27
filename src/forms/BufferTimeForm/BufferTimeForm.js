import React, { Component } from 'react';
import { array, bool, string } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { ensureCurrentUser } from '../../util/data';
import arrayMutators from 'final-form-arrays';
import { propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { required, composeValidators } from '../../util/validators';
import { Form, Button, FieldSelect } from '../../components';
import css from '../../forms/ProfileSettingsForm/ProfileSettingsForm.module.css';

class BufferTimeFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = {
      uploadDelay: false,
      phnErr: false,
      otpErr: false,
      verificationModule: [],
      languages: [],
      languageError: false,
      languageChange: false,
      description: '',
      descriptionError: false,
      countryData: [],
      adminAvailability: [],
      allStartHour: [],
      verificationChange: false,
    };
    this.submittedValues = {};
  }

  render() {
    // console.log(this.props);

    return (
      <>
        <FinalForm
          {...this.props}
          mutators={{ ...arrayMutators }}
          render={fieldRenderProps => {
            const {
              className,
              currentUser,
              handleSubmit,
              rootClassName,
              updateInProgress,
              updateProfileError,
              values,
              initialValues,
              intl,
            } = fieldRenderProps;

            const user = ensureCurrentUser(currentUser);

            const submitError = updateProfileError ? (
              <div className={css.error}>
                <FormattedMessage id="ProfileSettingsForm.updateProfileFailed" />
              </div>
            ) : null;

            const classes = classNames(rootClassName || css.root, className);
            const submitInProgress = updateInProgress;
            const submittedOnce = Object.keys(this.submittedValues).length > 0;
            const pristineSinceLastSubmit = submittedOnce && isEqual(values, initialValues);

            const beforeBufferTimePlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.beforeBufferTimePlaceHolder',
            });
            const beforeBufferTimeLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.beforeBufferTimeLabel',
            });

            const afterBufferTimePlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.afterBufferTimePlaceholder',
            });
            const afterBufferTimeLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.afterBufferTimeLabel',
            });

            return (
              <Form
                className={classes}
                onSubmit={async e => {
                  e.preventDefault();
                  this.submittedValues = values;
                  handleSubmit(e);
                }}
              >
                <div className={css.sectionContainer}>
                  <h3 className={css.sectionTitle}>
                    <FormattedMessage id="ProfileSettingsForm.bufferTimeTitle" />
                  </h3>
                  <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                    <FieldSelect
                      className={`${css.serviceTime} ${css.halfinput}`}
                      name={`beforeBufferTime`}
                      id={`beforeBufferTime`}
                      label={beforeBufferTimeLabel}
                      placeholder={beforeBufferTimePlaceholder}
                      // validate={composeValidators(required(beforeBufferTimeRequiredMessage))}
                      // onChange={e => console.log(e)}
                    >
                      <option>
                        {initialValues?.beforeBufferTime
                          ? initialValues?.beforeBufferTime
                          : beforeBufferTimePlaceholder}
                      </option>
                      <option key={0} value={0}>
                        0
                      </option>
                      <option key={5} value={5}>
                        5
                      </option>
                      <option key={10} value={10}>
                        10
                      </option>
                      <option key={15} value={15}>
                        15
                      </option>
                    </FieldSelect>

                    <FieldSelect
                      className={`${css.serviceTime} ${css.halfinput}`}
                      name={`afterBufferTime`}
                      id={`afterBufferTime`}
                      label={afterBufferTimeLabel}
                      placeholder={afterBufferTimePlaceholder}
                      // onChange={e => console.log(e)}
                    >
                      <option>
                        {initialValues?.afterBufferTime
                          ? initialValues?.afterBufferTime
                          : afterBufferTimePlaceholder}
                      </option>

                      <option key={0} value={0}>
                        0
                      </option>
                      <option key={5} value={5}>
                        5
                      </option>
                      <option key={10} value={10}>
                        10
                      </option>
                      <option key={15} value={15}>
                        15
                      </option>
                    </FieldSelect>
                  </div>
                </div>
                {submitError}
                <Button
                  className={css.submitButton}
                  type="submit"
                  inProgress={submitInProgress}
                  ready={pristineSinceLastSubmit}
                >
                  <FormattedMessage id="ProfileSettingsForm.saveChanges" />
                </Button>
              </Form>
            );
          }}
        />
      </>
    );
  }
}

BufferTimeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  updateProfileError: null,
  updateProfileReady: false,
};

BufferTimeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const BufferTimeForm = compose(injectIntl)(BufferTimeFormComponent);

BufferTimeForm.displayName = 'BufferTimeForm';

export default BufferTimeForm;
