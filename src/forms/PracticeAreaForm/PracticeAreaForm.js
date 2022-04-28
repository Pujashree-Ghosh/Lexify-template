import React, { Component } from 'react';
import { array, bool, string } from 'prop-types';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { Field, Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { ensureCurrentUser } from '../../util/data';
import arrayMutators from 'final-form-arrays';
import { propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { required, bookingDateRequired, composeValidators } from '../../util/validators';
import config from '../../config';
import {
  Form,
  Avatar,
  Button,
  ImageFromFile,
  IconSpinner,
  FieldTextInput,
  FieldSelect,
  FieldDateInput,
} from '../../components';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import css from '../../forms/ProfileSettingsForm/ProfileSettingsForm.module.css';
import '../../forms/ProfileSettingsForm/PhoneInput2.css';
import moment from 'moment';
import axios from 'axios';
import { FieldArray } from 'react-final-form-arrays';
import { apiBaseUrl } from '../../util/api';
import cloneDeep from 'lodash.clonedeep';

const MAX_LIMIT = 100;

class PracticeAreaFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = {
      verificationModule: [],
      description: '',
      descriptionError: false,
    };
    this.submittedValues = {};
  }

  componentDidMount() {
    axios
      .get('https://countriesnow.space/api/v0.1/countries/states')
      .then(res => this.setState({ countryData: res.data.data }))
      .catch(err => console.log('Error occurred', err));
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
              intl,
              invalid,
              pristine,
              rootClassName,
              updateInProgress,
              updateProfileError,
              uploadInProgress,
              values,
              initialValues,
              areaOfLawOptions,
            } = fieldRenderProps;
            // let { values } = fieldRenderProps;

            // console.log(this.state.languages, initialValues.languages)
            const user = ensureCurrentUser(currentUser);

            const graduationRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.graduationRequired',
            });

            const practiceAreaPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.practiceAreaPlaceholder',
            });
            const practiceAreaLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.practiceAreaLabel',
            });

            const practiceAreaRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.practiceAreaRequired',
            });

            const industryPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.industryPlaceholder',
            });
            const industryLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.industryLabel',
            });

            // const industryRequiredMessage = intl.formatMessage({
            //   id: 'ProfileSettingsForm.industryRequired',
            // });

            const recentWorkPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.recentWorkPlaceholder',
            });
            const recentWorkLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.recentWorkLabel',
            });

            const fromLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.fromLabel',
            });

            // const fromRequiredMessage = intl.formatMessage({
            //   id: 'ProfileSettingsForm.fromRequired',
            // });

            const fromPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.fromPlaceholder',
            });
            const toPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.toPlaceholder',
            });
            const toLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.toLabel',
            });

            // const toRequiredMessage = intl.formatMessage({
            //   id: 'ProfileSettingsForm.toRequired',
            // });

            const descriptionLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.descriptionLabel',
            });
            const descriptionPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.descriptionPlaceholder',
            });

            const submitError = updateProfileError ? (
              <div className={css.error}>
                <FormattedMessage id="ProfileSettingsForm.updateProfileFailed" />
              </div>
            ) : null;

            const classes = classNames(rootClassName || css.root, className);
            const submitInProgress = updateInProgress;
            const submittedOnce = Object.keys(this.submittedValues).length > 0;
            const pristineSinceLastSubmit = submittedOnce && isEqual(values, initialValues);

            const submitDisabled =
              invalid ||
              pristine ||
              pristineSinceLastSubmit ||
              uploadInProgress ||
              submitInProgress ||
              values?.industry?.filter(f => f?.description?.split(' ').length > MAX_LIMIT).length >
                0
                ? true
                : false;

            return (
              <Form
                className={classes}
                onSubmit={e => {
                  e.preventDefault();
                  this.submittedValues = values;

                  handleSubmit(e);
                }}
              >
                <FieldArray name="practice">
                  {({ fields }) => {
                    return (
                      <div className={css.sectionContainer}>
                        <h3 className={css.sectionTitle}>
                          <FormattedMessage id="ProfileSettingsForm.practiceAreaTitle" />
                          {/* Practice area */}
                        </h3>

                        {fields.map((name, i) => {
                          const options = cloneDeep(areaOfLawOptions).filter(
                            ({ key }) =>
                              !values.practice.filter((m, index) => index !== i).includes(key)
                          );
                          return (
                            <div className={css.addformgb} key={name + i}>
                              <div className={css.fromgroup}>
                                <FieldSelect
                                  id={`${name}`}
                                  name={`${name}`}
                                  validate={composeValidators(
                                    required(practiceAreaRequiredMessage)
                                  )}
                                >
                                  <option value="">{practiceAreaPlaceholder}</option>
                                  {cloneDeep(options).map(m => (
                                    <option value={m.key} key={m.key}>
                                      {m.label}
                                    </option>
                                  ))}
                                </FieldSelect>
                              </div>
                            </div>
                          );
                        })}

                        <div className={`${css.inlinefrom} ${css.mobilefixd}`}>
                          <Button
                            className={css.addMore}
                            type="button"
                            onClick={() => {
                              fields.push();
                            }}
                            disabled={!values.practice[values.practice?.length - 1]}
                          >
                            <FormattedMessage id="ProfileSettingsForm.addMore" />
                          </Button>
                          <Button
                            className={css.remove}
                            type="button"
                            onClick={() => {
                              fields.pop();
                            }}
                            disabled={values.practice?.length < 2}
                          >
                            <FormattedMessage id="ProfileSettingsForm.remove" />
                          </Button>
                        </div>
                      </div>
                    );
                  }}
                </FieldArray>
                <FieldArray name="industry">
                  {({ fields }) => {
                    return (
                      <div className={css.sectionContainer}>
                        <h3 className={css.sectionTitle}>
                          <FormattedMessage id="ProfileSettingsForm.industiesTitle" />
                        </h3>
                        <p>
                          If you fill out industry you must also fill out at least one relevant
                          recent work for each industry
                        </p>
                        {fields.map((name, i) => {
                          return (
                            <div className={css.addformgb} key={name + i}>
                              <div className={css.fromgroup}>
                                <FieldTextInput
                                  className={css.industry}
                                  type="text"
                                  id={`${name}.industryName`}
                                  name={`${name}.industryName`}
                                  placeholder={industryPlaceholder}
                                  // validate={required}
                                  label={industryLabel}
                                />
                              </div>
                              <div className={css.fromgroup}>
                                <FieldTextInput
                                  className={css.recentWork}
                                  type="text"
                                  id={`${name}.recentWork`}
                                  name={`${name}.recentWork`}
                                  placeholder={'Write your recent work relevant to this industry'}
                                  // validate={required}
                                  label="Recent work"
                                />
                              </div>

                              <div className={css.fromgroup}>
                                <FieldTextInput
                                  type="textarea"
                                  id={`${name}.description`}
                                  className={css.description}
                                  name={`${name}.description`}
                                  label={descriptionLabel}
                                  placeholder={descriptionPlaceholder}
                                />
                                {values?.industry[i]?.description?.split(' ').length > MAX_LIMIT ? (
                                  <span className={css.errorMessage}>
                                    {`You have exceeded the maximum word limit (max ${MAX_LIMIT} words)`}
                                  </span>
                                ) : (
                                  ''
                                )}
                              </div>

                              <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                                <FieldDateInput
                                  className={`${css.street} ${css.halfinput}`}
                                  id={`${name}.from`}
                                  name={`${name}.from`}
                                  label={fromLabel}
                                  placeholderText={fromPlaceholder}
                                  // validate={composeValidators(required(fromRequiredMessage))}
                                  isDayBlocked={day => {
                                    return false;
                                  }}
                                  isOutsideRange={() => false}
                                  useMobileMargins
                                />
                                {/* <FieldTextInput
                                  className={`${css.street} ${css.halfinput}`}
                                  type="date"
                                  id={`${name}.from`}
                                  name={`${name}.from`}
                                  label={fromLabel}
                                  // placeholder={vatPlaceholder}
                                  // validate={vatRequired}
                                /> */}

                                <FieldDateInput
                                  className={`${css.street} ${css.halfinput}`}
                                  id={`${name}.to`}
                                  name={`${name}.to`}
                                  label={toLabel}
                                  placeholderText={toPlaceholder}
                                  // validate={composeValidators(required(toRequiredMessage))}
                                  isDayBlocked={day => {
                                    return false;
                                  }}
                                  isOutsideRange={() => false}
                                  useMobileMargins
                                />

                                {/* <FieldTextInput
                                  className={`${css.street} ${css.halfinput}`}
                                  type="date"
                                  id={`${name}.to`}
                                  name={`${name}.to`}
                                  label={toLabel}
                                  // placeholder={vatPlaceholder}
                                  // validate={vatRequired}
                                /> */}
                              </div>
                            </div>
                          );
                        })}
                        <div className={`${css.inlinefrom} ${css.mobilefixd}`}>
                          <Button
                            className={css.addMore}
                            type="button"
                            onClick={() => {
                              fields.push();
                            }}
                          >
                            <FormattedMessage id="ProfileSettingsForm.addMore" />
                          </Button>
                          <Button
                            className={css.remove}
                            type="button"
                            onClick={() => {
                              fields.pop();
                            }}
                            disabled={values.industry?.length < 2}
                          >
                            <FormattedMessage id="ProfileSettingsForm.remove" />
                          </Button>
                        </div>
                      </div>
                    );
                  }}
                </FieldArray>
                {submitError}

                <Button
                  className={css.submitButton}
                  type="submit"
                  inProgress={submitInProgress}
                  disabled={
                    !(this.state.languageChange && this.state.languages.length > 0) &&
                    submitDisabled
                  }
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

PracticeAreaFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  updateProfileError: null,
  areaOfLawOptions: config.custom.areaOfLaw.options,
  updateProfileReady: false,
};

PracticeAreaFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,
  areaOfLawOptions: propTypes.areaOfLawOptions,
  country: array,

  // from injectIntl
  intl: intlShape.isRequired,
};

const PracticeAreaForm = compose(injectIntl)(PracticeAreaFormComponent);

PracticeAreaForm.displayName = 'PracticeAreaForm';

export default PracticeAreaForm;
