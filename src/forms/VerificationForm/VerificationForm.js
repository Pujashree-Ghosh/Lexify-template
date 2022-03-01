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
import { isUploadImageOverLimitError } from '../../util/errors';
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
import ProfilePageSideNav from '../../components/ProfilePageSideNav/ProfilePageSideNav';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset
const identity = v => v;
const MAX_LIMIT = 100;

class PracticeAreaFormComponent extends Component {
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

  componentDidUpdate(prevProps) {
    // Upload delay is additional time window where Avatar is added to the DOM,
    // but not yet visible (time to load image URL from srcset)
    if (prevProps.uploadInProgress && !this.props.uploadInProgress) {
      this.setState({ uploadDelay: true });
      this.uploadDelayTimeoutId = window.setTimeout(() => {
        this.setState({ uploadDelay: false });
      }, UPLOAD_CHANGE_DELAY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.uploadDelayTimeoutId);
  }

  render() {
    // console.log(this.props);

    return (
      <>
      <ProfilePageSideNav/>
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
            onImageUpload,
            pristine,
            profileImage,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadImageError,
            uploadInProgress,
            form,
            values,
            initialValues,
            areaOfLawOptions,
            country,
            languages,
          } = fieldRenderProps;
          // let { values } = fieldRenderProps;

          // console.log(this.state.languages, initialValues.languages)
          const user = ensureCurrentUser(currentUser);

          // First name
          const firstNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNameLabel',
          });
          const firstNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNamePlaceholder',
          });
          const firstNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNameRequired',
          });
          const firstNameRequired = validators.required(firstNameRequiredMessage);

          // Last name
          const lastNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameLabel',
          });
          const lastNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNamePlaceholder',
          });
          const lastNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameRequired',
          });
          const lastNameRequired = validators.required(lastNameRequiredMessage);

          // Bio
          const bioLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.bioLabel',
          });
          const bioPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.bioPlaceholder',
          });

          const companyNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.companyNamePlaceholder',
          });
          const companyNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.companyNameRequired',
          });
          const companyNameRequired = validators.required(companyNameRequiredMessage);

          const companyNumberPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.companyNumberPlaceholder',
          });

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

          const otpPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.otpPlaceholder',
          });
          const otpLabel = intl.formatMessage({ id: 'ProfileSettingsForm.otpLabel' });

          const otpRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.otpRequired',
          });
          const otpRequired = validators.required(otpRequiredMessage);

          const startTimePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.startTimePlaceholder',
          });
          const startTimeLabel = intl.formatMessage({ id: 'ProfileSettingsForm.startTimeLabel' });

          const DateLabel = intl.formatMessage({ id: 'ProfileSettingsForm.DateLabel' });

          const startTimeRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.startTimeRequired',
          });

          const endTimePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.endTimePlaceholder',
          });
          const endTimeLabel = intl.formatMessage({ id: 'ProfileSettingsForm.endTimeLabel' });

          const endTimeRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.endTimeRequired',
          });

          // const pracTiceDatePlaceholder = intl.formatMessage({
          //   id: 'ProfileSettingsForm.practiceDatePlaceholder',
          // });
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

          const languagePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.languagePlaceholder',
          });
          const languageLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.languageLabel',
          });

          const languageRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.languageRequired',
          });

          const timeZonePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.timeZonePlaceholder',
          });
          const timeZoneLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.timeZoneLabel',
          });

          const timeZoneRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.timeZoneRequired',
          });

          const institutePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.institutePlaceholder',
          });
          const instituteLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.instituteLabel',
          });

          const instituteRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.instituteRequired',
          });

          const degreePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.degreePlaceholder',
          });
          const degreeLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.degreeLabel',
          });

          const degreeRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.degreeRequired',
          });

          const graduationPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.graduationPlaceholder',
          });
          const graduationLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.graduationLabel',
          });

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

          // const recentWorkRequiredMessage = intl.formatMessage({
          //   id: 'ProfileSettingsForm.recentWorkRequired',
          // });

          // const fromPlaceholder = intl.formatMessage({
          //   id: 'ProfileSettingsForm.fromPlaceholder',
          // });
          const fromLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.fromLabel',
          });

          // const fromRequiredMessage = intl.formatMessage({
          //   id: 'ProfileSettingsForm.fromRequired',
          // });

          // const toPlaceholder = intl.formatMessage({
          //   id: 'ProfileSettingsForm.toPlaceholder',
          // });
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
          const postalCodeLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.postalCodeLabel',
          });
          const postalCodePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.postalCodePlaceholder',
          });
          const postalCodeRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.postalCodeRequiredMessage',
          });

          const stateLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.stateLabel',
          });

          const onLanguageChangeHandler = e => {
            form.change('languages', JSON.stringify(this.state.languages));

            // setEquipments(e);
            // setEquipmentsError(false);
            this.setState({ languages: e, languageError: false, languageChange: true });
          };
          const onLanguageBlurHandler = e => {
            form.change('languages', JSON.stringify(this.state.languages));
            this.setState({ languageChange: true });
            if (!this.state.languages.length) {
              this.setState({ languageError: true });
            } else {
              this.setState({ languageError: false });
            }
          };

          const clientType =
            user?.attributes?.profile?.publicData?.clientType === 'privateIndividual'
              ? 'Private Individual'
              : 'Legal Entity';

          const langOption = languages.map(l => {
            return { label: l.name, value: l.code };
          });

          const time = [
            '00:00',
            '01:00',
            '02:00',
            '03:00',
            '04:00',
            '05:00',
            '06:00',
            '07:00',
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00',
            '21:00',
            '22:00',
            '23:00',
            '24:00',
          ];

          const phnChange = initialValues.phoneNumber !== values.phoneNumber;

          const uploadingOverlay =
            uploadInProgress || this.state.uploadDelay ? (
              <div className={css.uploadingImageOverlay}>
                <IconSpinner />
              </div>
            ) : null;

          const hasUploadError = !!uploadImageError && !uploadInProgress;
          const errorClasses = classNames({ [css.avatarUploadError]: hasUploadError });
          const transientUserProfileImage = profileImage.uploadedImage || user.profileImage;
          const transientUser = { ...user, profileImage: transientUserProfileImage };

          // Ensure that file exists if imageFromFile is used
          const fileExists = !!profileImage.file;
          const fileUploadInProgress = uploadInProgress && fileExists;
          const delayAfterUpload = profileImage.imageId && this.state.uploadDelay;
          const imageFromFile =
            fileExists && (fileUploadInProgress || delayAfterUpload) ? (
              <ImageFromFile
                id={profileImage.id}
                className={errorClasses}
                rootClassName={css.uploadingImage}
                aspectRatioClassName={css.squareAspectRatio}
                file={profileImage.file}
              >
                {uploadingOverlay}
              </ImageFromFile>
            ) : null;

          // Avatar is rendered in hidden during the upload delay
          // Upload delay smoothes image change process:
          // responsive img has time to load srcset stuff before it is shown to user.
          const avatarClasses = classNames(errorClasses, css.avatar, {
            [css.avatarInvisible]: this.state.uploadDelay,
          });
          const avatarComponent =
            !fileUploadInProgress && profileImage.imageId ? (
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUser}
                disableProfileLink
              />
            ) : null;

          const chooseAvatarLabel =
            profileImage.imageId || fileUploadInProgress ? (
              <div className={css.avatarContainer}>
                {imageFromFile}
                {avatarComponent}
                <div className={css.changeAvatar}>
                  <FormattedMessage id="ProfileSettingsForm.changeAvatar" />
                </div>
              </div>
            ) : (
              <div className={css.avatarPlaceholder}>
                <div className={css.avatarPlaceholderText}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePicture" />
                </div>
                <div className={css.avatarPlaceholderTextMobile}>
                  <FormattedMessage id="ProfileSettingsForm.addYourProfilePictureMobile" />
                </div>
              </div>
            );

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
            values?.industry?.filter(f => f?.description?.split(' ').length > MAX_LIMIT).length > 0
              ? true
              : false;

          return (
            
            <Form
              className={classes}
              onSubmit={e => {
                e.preventDefault();
                this.submittedValues = values;
                if (phnChange) {
                  axios
                    .post(`${apiBaseUrl()}/api/user/verify`, {
                      otp: values.otp * 1,
                      mobile: '+' + values.phoneNumber,
                    })
                    .then(resp => {
                      handleSubmit(e);
                    })
                    .catch(err => {
                      if (err.response.status === 401 || err.response.status === 404) {
                        this.setState({ otpErr: true });
                      }
                      // setTimeout(() => {
                      //   // setSubmitProgress(false);
                      // }, 2000);
                      console.log(err.response.status);
                    });
                } else {
                  handleSubmit(e);
                }
              }}
            >
              {user?.attributes?.profile?.protectedData?.isProfileVerified ? (
                'Your Profile is Already Verified'
              ) : (
                <div>
                  <FieldArray name="schedule">
                    {({ fields }) => {
                      return (
                        <div className={css.sectionContainer}>
                          <h3 className={css.sectionTitle}>
                            <FormattedMessage id="ProfileSettingsForm.verification" />
                          </h3>
                          <p>Schedule a call for verification</p>
                          {fields.map((name, i) => {
                            return (
                              <div key={name + i}>
                                <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                                  <FieldTextInput
                                    className={`${css.street} ${css.thirdinput}`}
                                    type="date"
                                    id={`${name}.date`}
                                    name={`${name}.date`}
                                    label={DateLabel}
                                    // placeholder={vatPlaceholder}
                                    // validate={vatRequired}
                                  />
                                  <FieldSelect
                                    className={`${css.serviceTime} ${css.thirdinput}`}
                                    name={`${name}.startTime`}
                                    id={`${name}.startTime`}
                                    label={startTimeLabel}
                                    placeholder={startTimePlaceholder}
                                    validate={composeValidators(required(startTimeRequiredMessage))}
                                  >
                                    {values &&
                                      values.schedule[i] &&
                                      values.schedule[i].date &&
                                      time.map(c => (
                                        <option key={c} value={c}>
                                          {c ? c : startTimePlaceholder}
                                        </option>
                                      ))}
                                  </FieldSelect>

                                  <FieldSelect
                                    className={`${css.endTime} ${css.thirdinput}`}
                                    name={`${name}.endTime`}
                                    id={`${name}.endTime`}
                                    label={endTimeLabel}
                                    placeholder={endTimePlaceholder}
                                    validate={composeValidators(required(endTimeRequiredMessage))}
                                  >
                                    {values &&
                                      values.schedule[i] &&
                                      values.schedule[i].startTime &&
                                      time
                                        .slice(time.indexOf(values.schedule[i].startTime) + 1)
                                        .map(c => (
                                          <option key={c} value={c}>
                                            {c ? c : startTimePlaceholder}
                                          </option>
                                        ))}
                                  </FieldSelect>
                                </div>
                              </div>
                            );
                          })}
                          <div className={css.inlinefrom}>
                            <Button
                              className={css.addMore}
                              type="button"
                              onClick={() => {
                                fields.push();
                              }}
                              disabled={
                                !values.schedule[values.schedule?.length - 1]?.date ||
                                !values.schedule[values.schedule?.length - 1]?.startTime ||
                                !values.schedule[values.schedule?.length - 1]?.endTime
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
                              disabled={values.schedule?.length < 2}
                            >
                              <FormattedMessage id="ProfileSettingsForm.remove" />
                            </Button>
                          </div>
                        </div>
                      );
                    }}
                  </FieldArray>
                  <span className={css.info}>
                    * Verification is required to complete registration
                  </span>
                </div>
              )}
              {submitError}
              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={
                  !(this.state.languageChange && this.state.languages.length > 0) && submitDisabled
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
  uploadImageError: null,
  updateProfileError: null,
  areaOfLawOptions: config.custom.areaOfLaw.options,
  country: config.custom.country,
  languages: config.custom.languages,
  updateProfileReady: false,
};

PracticeAreaFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,
  areaOfLawOptions: propTypes.areaOfLawOptions,
  country: array,
  languages: array,

  // from injectIntl
  intl: intlShape.isRequired,
};

const PracticeAreaForm = compose(injectIntl)(PracticeAreaFormComponent);

PracticeAreaForm.displayName = 'PracticeAreaForm';

export default PracticeAreaForm;
