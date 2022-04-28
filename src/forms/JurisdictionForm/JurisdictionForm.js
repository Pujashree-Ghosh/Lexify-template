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
import { Form, Button, FieldTextInput, FieldSelect, FieldDateInput } from '../../components';
import css from '../../forms/ProfileSettingsForm/ProfileSettingsForm.module.css';
import '../../forms/ProfileSettingsForm/PhoneInput2.css';
import moment from 'moment';
import axios from 'axios';
import { FieldArray } from 'react-final-form-arrays';

class JurisdictionFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = {
      verificationModule: [],
      description: '',
      descriptionError: false,
      countryData: [],
    };
    this.submittedValues = {};
  }

  componentDidMount() {
    this.setState({
      languages:
        this.props.initialValues && this.props.initialValues.languages
          ? this.props.initialValues.languages
          : [],
    });
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
            } = fieldRenderProps;
            // let { values } = fieldRenderProps;
            // console.log(this.state.languages, initialValues.languages)
            const user = ensureCurrentUser(currentUser);

            const countryPlaceHolder = intl.formatMessage({
              id: 'ProfileSettingsForm.countryPlaceHolder',
            });
            const countryRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.countryRequired',
            });
            const streetPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.streetPlaceholder',
            });
            const streetRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.streetRequired',
            });
            const streetRequired = validators.required(streetRequiredMessage);

            const cityLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.cityLabel',
            });
            const cityPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.cityPlaceholder',
            });
            const cityRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.cityRequired',
            });
            const cityRequired = validators.required(cityRequiredMessage);

            const statePlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.statePlaceholder',
            });
            const stateRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.stateRequired',
            });
            const stateRequired = validators.required(stateRequiredMessage);

            const zipCodePlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.zipCodePlaceholder',
            });
            const zipCodeRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.zipCodeRequired',
            });
            const zipCodeRequired = validators.required(zipCodeRequiredMessage);

            const pracTiceDatePlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.practiceDatePlaceholder',
            });
            const practiceDateLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.practiceDateLabel',
            });

            const practiceDateRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.practiceDateRequired',
            });

            const statusPlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.statusPlaceholder',
            });
            const statusLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.statusLabel',
            });

            const statusRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.statusRequired',
            });

            const postalCodeLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.postalCodeLabel',
            });
            const postalCodePlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.postalCodePlaceholder',
            });
            const postalCodeRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.postalCodeRequiredMessage',
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
              submitInProgress;

            return (
              <Form
                className={classes}
                onSubmit={e => {
                  e.preventDefault();
                  this.submittedValues = values;

                  handleSubmit(e);
                }}
              >
                <FieldArray name="jurisdictionPractice">
                  {({ fields }) => {
                    return (
                      <div className={css.sectionContainer}>
                        <h3 className={css.sectionTitle}>
                          <FormattedMessage id="ProfileSettingsForm.jurisdictionPracticeTitle" />
                        </h3>
                        {fields.map((name, i) => {
                          return (
                            <div className={css.addformgb} key={name + i}>
                              <div className={css.fromgroup}>
                                <FieldSelect
                                  id={`${name}.country`}
                                  name={`${name}.country`}
                                  // label="Choose an option:"
                                  // validate={countryPlaceHolder}
                                  validate={composeValidators(required(countryRequiredMessage))}
                                  onChange={() => {
                                    if (values?.jurisdictionPractice[i]?.state) {
                                      delete values.jurisdictionPractice[i].state;
                                    }
                                    if (values?.jurisdictionPractice[i]?.city) {
                                      delete values.jurisdictionPractice[i].city;
                                    }
                                    if (values?.jurisdictionPractice[i]?.zipCode) {
                                      delete values.jurisdictionPractice[i].postalCode;
                                    }
                                  }}
                                >
                                  <option value="">{countryPlaceHolder}</option>
                                  {this.state.countryData.map(m => (
                                    <option value={m.iso3} key={m.iso3}>
                                      {m.name}
                                    </option>
                                  ))}
                                </FieldSelect>
                              </div>
                              {values.jurisdictionPractice[i]?.country === 'USA' ? (
                                <>
                                  <div className={css.fromgroup}>
                                    <FieldSelect
                                      id={`${name}.state`}
                                      name={`${name}.state`}
                                      // label="Choose an option:"
                                      // validate={countryPlaceHolder}
                                      validate={composeValidators(required(stateRequiredMessage))}
                                    >
                                      <option value="">{statePlaceholder}</option>
                                      {this.state.countryData
                                        .filter(c => c.iso3 === 'USA')[0]
                                        ?.states?.map(s => (
                                          <option value={s.state_code}>{s.name}</option>
                                        ))}
                                    </FieldSelect>
                                  </div>
                                  <div className={css.fromgroup}>
                                    <FieldTextInput
                                      className={css.postalCode}
                                      type="text"
                                      id={`${name}.postalCode`}
                                      name={`${name}.postalCode`}
                                      placeholder={postalCodePlaceholder}
                                      validate={composeValidators(
                                        required(postalCodeRequiredMessage)
                                      )}
                                      label={postalCodeLabel}
                                    />
                                  </div>
                                </>
                              ) : (
                                <div className={css.fromgroup}>
                                  <FieldTextInput
                                    className={css.city}
                                    type="text"
                                    id={`${name}.city`}
                                    name={`${name}.city`}
                                    placeholder={cityPlaceholder}
                                    validate={composeValidators(required(cityRequiredMessage))}
                                    label={cityLabel}
                                  />
                                </div>
                              )}

                              <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                                <FieldDateInput
                                  className={`${css.street} ${css.halfinput}`}
                                  id={`${name}.date`}
                                  name={`${name}.date`}
                                  placeholderText={pracTiceDatePlaceholder}
                                  validate={composeValidators(
                                    required(practiceDateRequiredMessage)
                                  )}
                                  isDayBlocked={day => {
                                    return false;
                                  }}
                                  isOutsideRange={() => false}
                                  label={practiceDateLabel}
                                  useMobileMargins
                                />

                                <FieldSelect
                                  className={`${css.halfinput} mobiledsd `}
                                  id={`${name}.status`}
                                  name={`${name}.status`}
                                  label={statusLabel}
                                  validate={composeValidators(required(statusRequiredMessage))}
                                >
                                  <option value="">{statusPlaceholder}</option>
                                  <option value="active">Active</option>
                                  <option value="inActive">Inactive</option>
                                </FieldSelect>
                              </div>
                            </div>
                          );
                        })}
                        <div className={`${css.fromgroup} ${css.inlinefrom} ${css.mobilefixd}`}>
                          <Button
                            className={css.addMore}
                            type="button"
                            onClick={() => {
                              fields.push();
                            }}
                            disabled={
                              !values.jurisdictionPractice[values.jurisdictionPractice?.length - 1]
                                ?.country ||
                              !values.jurisdictionPractice[values.jurisdictionPractice?.length - 1]
                                ?.date ||
                              !values.jurisdictionPractice[values.jurisdictionPractice?.length - 1]
                                ?.status
                            }
                          >
                            <FormattedMessage id="ProfileSettingsForm.addMore" />
                          </Button>
                          <Button
                            className={css.remove}
                            type="button"
                            onClick={() => {
                              fields.pop();
                            }}
                            disabled={values.jurisdictionPractice?.length < 2}
                          >
                            <FormattedMessage id="ProfileSettingsForm.remove" />
                          </Button>
                        </div>
                      </div>
                    );
                  }}
                </FieldArray>

                {/*              
              {!user?.attributes?.profile?.protectedData?.isLawyer && clientType ? (
                <div className={css.sectionContainer}>
                  <h3 className={css.sectionTitle}>
                    {/* <FormattedMessage id="ProfileSettingsForm.yourName" /> */}
                {/* {`Registered as ${clientType}`} */}
                {/* </h3>
                </div>
              ) : ( */}
                {/* '' */}
                {/* )} */}

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

JurisdictionFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  updateProfileError: null,
  country: config.custom.country,
  updateProfileReady: false,
};

JurisdictionFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,
  country: array,

  // from injectIntl
  intl: intlShape.isRequired,
};

const JurisdictionForm = compose(injectIntl)(JurisdictionFormComponent);

JurisdictionForm.displayName = 'JurisdictionForm';

export default JurisdictionForm;
