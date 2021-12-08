import React, { Component } from 'react';
import { bool, string } from 'prop-types';
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
import css from './ProfileSettingsForm.module.css';
import './PhoneInput2.css';
import moment from 'moment';
import axios from 'axios';
import { FieldArray } from 'react-final-form-arrays';
import { apiBaseUrl } from '../../util/api';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset
const identity = v => v;
const MAX_LIMIT = 100;

class ProfileSettingsFormComponent extends Component {
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
          } = fieldRenderProps;
          // let { values } = fieldRenderProps;
          // console.log(values);

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
            values?.industry?.filter(f => f?.description?.length > MAX_LIMIT).length > 0
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
              <div className={`${css.sectionContainer}  ${css.centerh3}`}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.yourProfilePicture" />
                </h3>
                <Field
                  accept={ACCEPT_IMAGES}
                  id="profileImage"
                  name="profileImage"
                  label={chooseAvatarLabel}
                  type="file"
                  form={null}
                  uploadImageError={uploadImageError}
                  disabled={uploadInProgress}
                >
                  {fieldProps => {
                    const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                    const { name, type } = input;
                    const onChange = e => {
                      const file = e.target.files[0];
                      form.change(`profileImage`, file);
                      form.blur(`profileImage`);
                      if (file != null) {
                        const tempId = `${file.name}_${Date.now()}`;
                        onImageUpload({ id: tempId, file });
                      }
                    };

                    let error = null;

                    if (isUploadImageOverLimitError(uploadImageError)) {
                      error = (
                        <div className={css.error}>
                          <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
                        </div>
                      );
                    } else if (uploadImageError) {
                      error = (
                        <div className={css.error}>
                          <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
                        </div>
                      );
                    }

                    return (
                      <div className={css.uploadAvatarWrapper}>
                        <label className={css.label} htmlFor={id}>
                          {label}
                        </label>
                        <input
                          accept={accept}
                          id={id}
                          name={name}
                          className={css.uploadAvatarInput}
                          disabled={disabled}
                          onChange={onChange}
                          type={type}
                        />
                        {error}
                      </div>
                    );
                  }}
                </Field>
                <div className={css.tip}>
                  <FormattedMessage id="ProfileSettingsForm.tip" />
                </div>
                <div className={css.fileInfo}>
                  <FormattedMessage id="ProfileSettingsForm.fileInfo" />
                </div>
              </div>

              {/* {user &&
              !user?.attributes?.profile?.protectedData?.isLawyer &&
              !user?.attributes?.profile?.protectedData?.changedOnce ? (
                <div className={css.psradioButtons}>
                  <label className={css.radio}>
                    <input
                      className={css.radioInput}
                      name="clientType"
                      type="radio"
                      value="legalEntity"
                      checked={this.state.selectedOption === 'legalEntity'}
                      onChange={e => {
                        this.setState({ selectedOption: 'legalEntity' });
                        form.reset();
                        form.change('clientType', e.target.value);
                        // console.log();
                      }}
                    />
                    Legal entity
                  </label>
                  <label className={css.radio}>
                    <input
                      className={css.radioInput}
                      name="clientType"
                      type="radio"
                      value="privateIndividual"
                      checked={this.state.selectedOption === 'privateIndividual'}
                      onChange={e => {
                        this.setState({ selectedOption: 'privateIndividual' });
                        form.reset();
                        form.change('clientType', e.target.value);
                      }}
                    />
                    Private individual
                  </label>
                </div>
              ) : (
                ''
              )} */}
              {!user?.attributes?.profile?.protectedData?.isLawyer && clientType ? (
                <div className={css.sectionContainer}>
                  <h3 className={css.sectionTitle}>
                    {/* <FormattedMessage id="ProfileSettingsForm.yourName" /> */}
                    {`Registered as ${clientType}`}
                  </h3>
                </div>
              ) : (
                ''
              )}
              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.yourName" />
                </h3>
                <div className={css.nameContainer}>
                  <FieldTextInput
                    className={css.firstName}
                    type="text"
                    id="firstName"
                    name="firstName"
                    label={firstNameLabel}
                    placeholder={firstNamePlaceholder}
                    validate={firstNameRequired}
                  />
                  <FieldTextInput
                    className={css.lastName}
                    type="text"
                    id="lastName"
                    name="lastName"
                    label={lastNameLabel}
                    placeholder={lastNamePlaceholder}
                    validate={lastNameRequired}
                  />
                </div>
              </div>

              <div className={css.sectionContainer}>
                <h3 className={css.sectionTitle}>
                  <FormattedMessage id="ProfileSettingsForm.phone" />
                </h3>
                <div className={css.phoneContainer}>
                  <div className={css.fromgroup}>
                    <div className={css.phoneInputField}>
                      <div className={css.phnWithErr}>
                        <PhoneInput
                          value={values.phoneNumber}
                          onChange={val => {
                            // values.phoneNumber && isPossiblePhoneNumber(values.phoneNumber)
                            //   ? setPhoneErr(false)
                            //   : '';
                            values.phoneNumber && values.phoneNumber.length > 8
                              ? this.setState({ phnErr: false })
                              : '';
                            form.change('phoneNumber', val);
                          }}
                          onBlur={() => {
                            // values.phoneNumber && isPossiblePhoneNumber(values.phoneNumber)
                            values.phoneNumber && values.phoneNumber.length > 8
                              ? this.setState({ phnErr: false })
                              : this.setState({ phnErr: true });
                          }}
                        />
                        {this.state.phnErr ? (
                          <span className={css.phnErrMsg}>
                            <FormattedMessage id="profileSettingForm.phoneRequired" />
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                      {phnChange ? (
                        <button
                          className={css.sendOtpButton}
                          type="button"
                          onClick={() => {
                            if (values.phoneNumber) {
                              axios
                                .post(`${apiBaseUrl()}/api/user`, {
                                  email: user?.attributes?.email,
                                  mobile: '+' + values.phoneNumber,
                                })
                                .then(resp => {
                                  console.log(resp);
                                })
                                .catch(err => console.log(err));
                            } else {
                              return;
                            }
                          }}
                          // inProgress={}
                          // disabled={sendOtpDisable}
                        >
                          <FormattedMessage id="ProfileSettingsForm.sendOtp" />
                        </button>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
                {phnChange ? (
                  <div className={css.sectionContainer}>
                    <h3 className={css.sectionTitle}>{otpLabel}</h3>
                    <div className={css.otpContainer}>
                      <FieldTextInput
                        className={css.otp}
                        type="password"
                        id="otp"
                        name="otp"
                        // label={otpLabel}
                        placeholder={otpPlaceholder}
                        validate={otpRequired}
                      />
                      {this.state.otpErr ? (
                        <span className={css.errorMessage}>
                          {' '}
                          <FormattedMessage id="ProfileSettingsForm.otpErrMsg" />
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>

              {user && !user?.attributes?.profile?.protectedData?.isLawyer ? (
                <div className={css.client}>
                  {user?.attributes?.profile?.publicData?.clientType === 'legalEntity' ? (
                    <div className={css.sectionContainer}>
                      <h3 className={css.sectionTitle}>
                        <FormattedMessage id="ProfileSettingsForm.companyDetail" />
                      </h3>
                      {/* <div className={css.nameContainer}> */}

                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.companyName}
                          type="text"
                          id="companyName"
                          name="companyName"
                          placeholder={companyNamePlaceholder}
                          validate={companyNameRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.companyNumber}
                          type="text"
                          id="companyNumber"
                          name="companyNumber"
                          placeholder={companyNumberPlaceholder}
                          // validate={companyNumberRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldSelect
                          id="country"
                          name="country"
                          // label="Choose an option:"
                          validate={composeValidators(required(countryRequiredMessage))}
                        >
                          <option value="">{countryPlaceHolder}</option>
                          <option value="USA">USA</option>
                          <option value="India">India</option>
                          <option value="UK">UK</option>
                        </FieldSelect>
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.street}
                          type="text"
                          id="street"
                          name="street"
                          placeholder={streetPlaceholder}
                          validate={streetRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.city}
                          type="text"
                          id="city"
                          name="city"
                          placeholder={cityPlaceholder}
                          validate={cityRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.state}
                          type="text"
                          id="state"
                          name="state"
                          placeholder={statePlaceholder}
                          validate={stateRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.ZipCode}
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          placeholder={zipCodePlaceholder}
                          validate={zipCodeRequired}
                        />
                      </div>
                      {/* </div> */}
                    </div>
                  ) : (
                    <div className={css.sectionContainer}>
                      <h3 className={css.sectionTitle}>
                        <FormattedMessage id="ProfileSettingsForm.address" />
                      </h3>
                      {/* <div className={css.nameContainer}> */}

                      <div className={css.fromgroup}>
                        <FieldSelect
                          id="country"
                          name="country"
                          // label="Choose an option:"
                          // validate={required}
                        >
                          <option value="">{countryPlaceHolder}</option>
                          <option value="USA">USA</option>
                          <option value="India">India</option>
                          <option value="UK">UK</option>
                        </FieldSelect>
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.street}
                          type="text"
                          id="street"
                          name="street"
                          placeholder={streetPlaceholder}
                          validate={streetRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.city}
                          type="text"
                          id="city"
                          name="city"
                          placeholder={cityPlaceholder}
                          validate={cityRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.state}
                          type="text"
                          id="state"
                          name="state"
                          placeholder={statePlaceholder}
                          validate={stateRequired}
                        />
                      </div>
                      <div className={css.fromgroup}>
                        <FieldTextInput
                          className={css.zipCode}
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          placeholder={zipCodePlaceholder}
                          validate={zipCodeRequired}
                        />
                      </div>
                      {/* </div> */}
                    </div>
                  )}

                  <div className={css.sectionContainer}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfileSettingsForm.timeZone" />
                    </h3>
                    {/* <div className={css.nameContainer}> */}
                    <FieldSelect
                      id="timeZone"
                      name="timeZone"
                      // label="Choose an option:"
                      // validate={required}
                    >
                      <option value="">{timeZonePlaceholder}</option>
                      <option value="first">First option</option>
                      <option value="second">Second option</option>
                    </FieldSelect>
                  </div>
                  <div className={css.sectionContainer}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfileSettingsForm.vatNo" />
                    </h3>
                    {/* <div className={css.nameContainer}> */}
                    <FieldTextInput
                      className={css.street}
                      type="text"
                      id="vatNo"
                      name="vatNo"
                      // placeholder={vatPlaceholder}
                      // validate={vatRequired}
                    />
                  </div>
                  <div className={css.sectionContainer}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfileSettingsForm.languages" />
                    </h3>
                    {/* <div className={css.nameContainer}> */}
                    {/* <FieldSelect
                      id="language"
                      name="language"
                      // label="Choose an option:"
                      validate={composeValidators(required(languageRequiredMessage))}
                    >
                      <option value="">{languagePlaceholder}</option>
                      <option value="first">First option</option>
                      <option value="second">Second option</option>
                    </FieldSelect> */}
                    <Select
                      closeMenuOnSelect={false}
                      className={css.reactSelect}
                      isSearchable={true}
                      name="language"
                      placeholder={languagePlaceholder}
                      onChange={onLanguageChangeHandler}
                      defaultValue={initialValues.languages && JSON.parse(initialValues.languages)}
                      isMulti
                      options={[
                        { label: 'Hindi', value: 'hindi' },
                        { label: 'English', value: 'english' },
                        { label: 'Bengali', value: 'bengali' },
                      ]}
                      onBlur={onLanguageBlurHandler}
                    />
                    {this.state.languageError ? (
                      <div className={css.errorMessage}>{languageRequiredMessage}</div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              ) : (
                <div className={css.lawyer}>
                  <FieldArray name="jurisdictionPractice">
                    {({ fields }) => {
                      return (
                        <div className={css.sectionContainer}>
                          <h3 className={css.sectionTitle}>
                            <FormattedMessage id="ProfileSettingsForm.jurisdictionPracticeTitle" />
                          </h3>
                          {fields.map((name, i) => {
                            return (
                              <div key={name}>
                                <div className={css.fromgroup}>
                                  <FieldSelect
                                    id={`${name}.country`}
                                    name={`${name}.country`}
                                    // label="Choose an option:"
                                    // validate={countryPlaceHolder}
                                    validate={composeValidators(required(countryRequiredMessage))}
                                  >
                                    <option value="">{countryPlaceHolder}</option>
                                    <option value="USA">USA</option>
                                    <option value="India">India</option>
                                    <option value="UK">UK</option>
                                  </FieldSelect>
                                </div>

                                <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                                  <FieldTextInput
                                    className={css.halfinput}
                                    type="date"
                                    id={`${name}.date`}
                                    name={`${name}.date`}
                                    // placeholder={pracTiceDatePlaceholder}
                                    validate={composeValidators(
                                      required(practiceDateRequiredMessage)
                                    )}
                                    label={practiceDateLabel}
                                  />

                                  <FieldSelect
                                    className={css.halfinput}
                                    id={`${name}.status`}
                                    name={`${name}.status`}
                                    label={statusLabel}
                                    validate={composeValidators(required(statusRequiredMessage))}
                                  >
                                    <option value="">{statusPlaceholder}</option>
                                    <option value="status1">Status 1</option>
                                    <option value="status2">Status 1</option>
                                    <option value="status3">Status 1</option>
                                  </FieldSelect>
                                </div>
                              </div>
                            );
                          })}
                          <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                            <Button
                              className={css.addMore}
                              type="button"
                              onClick={() => {
                                fields.push();
                              }}
                              disabled={
                                !values.jurisdictionPractice[
                                  values.jurisdictionPractice?.length - 1
                                ]?.country ||
                                !values.jurisdictionPractice[
                                  values.jurisdictionPractice?.length - 1
                                ]?.date ||
                                !values.jurisdictionPractice[
                                  values.jurisdictionPractice?.length - 1
                                ]?.status
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
                  <div className={css.sectionContainer}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfileSettingsForm.lawyerLanguages" />
                    </h3>
                    {/* <div className={css.nameContainer}> */}
                    {/* <FieldSelect
                      id="language"
                      name="language"
                      // label="Choose an option:"
                      validate={composeValidators(required(languageRequiredMessage))}
                    >
                      <option value="">{languagePlaceholder}</option>
                      <option value="first">First option</option>
                      <option value="second">Second option</option>
                    </FieldSelect> */}

                    <Select
                      closeMenuOnSelect={false}
                      className={css.reactSelect}
                      isSearchable={true}
                      name="language"
                      placeholder={languagePlaceholder}
                      onChange={onLanguageChangeHandler}
                      defaultValue={initialValues.languages && JSON.parse(initialValues.languages)}
                      isMulti
                      options={[
                        { label: 'Hindi', value: 'hindi' },
                        { label: 'English', value: 'english' },
                        { label: 'Bengali', value: 'bengali' },
                      ]}
                      onBlur={onLanguageBlurHandler}
                    />
                    {this.state.languageError ? (
                      <div className={css.errorMessage}>{languageRequiredMessage}</div>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className={css.sectionContainer}>
                    <h3 className={css.sectionTitle}>
                      <FormattedMessage id="ProfileSettingsForm.timeZone" />
                    </h3>
                    {/* <div className={css.nameContainer}> */}
                    <FieldSelect
                      id="timeZone"
                      name="timeZone"
                      // label="Choose an option:"
                      validate={composeValidators(required(timeZoneRequiredMessage))}
                    >
                      <option value="">{timeZonePlaceholder}</option>
                      <option value="first">First option</option>
                      <option value="second">Second option</option>
                    </FieldSelect>
                  </div>
                  <FieldArray name="education">
                    {({ fields }) => {
                      return (
                        <div className={css.sectionContainer}>
                          <h3 className={css.sectionTitle}>
                            <FormattedMessage id="ProfileSettingsForm.rducationTitle" />
                          </h3>
                          <p>
                            It is important to start with your most recent education and work
                            backwards
                          </p>
                          {fields.map((name, i) => {
                            return (
                              <div key={name}>
                                <div className={css.fromgroup}>
                                  <FieldTextInput
                                    className={css.institute}
                                    type="text"
                                    id={`${name}.instituteName`}
                                    name={`${name}.instituteName`}
                                    placeholder={institutePlaceholder}
                                    validate={composeValidators(required(instituteRequiredMessage))}
                                    label={instituteLabel}
                                  />
                                </div>

                                <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                                  <FieldTextInput
                                    className={`${css.degree} ${css.halfinput}`}
                                    type="text"
                                    id={`${name}.degree`}
                                    name={`${name}.degree`}
                                    placeholder={degreePlaceholder}
                                    validate={composeValidators(required(degreeRequiredMessage))}
                                    label={degreeLabel}
                                  />

                                  <FieldSelect
                                    className={css.halfinput}
                                    id={`${name}.graduationYear`}
                                    name={`${name}.graduationYear`}
                                    label={graduationLabel}
                                    validate={composeValidators(
                                      required(graduationRequiredMessage)
                                    )}
                                  >
                                    <option value="">{graduationPlaceholder}</option>
                                    <option value="2022">2022</option>
                                    <option value="2021">2021</option>
                                    <option value="2020">2020</option>
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
                                !values.education[values.education?.length - 1]?.instituteName ||
                                !values.education[values.education?.length - 1]?.degree ||
                                !values.education[values.education?.length - 1]?.graduationYear
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
                              disabled={values.education?.length < 2}
                            >
                              <FormattedMessage id="ProfileSettingsForm.remove" />
                            </Button>
                          </div>
                        </div>
                      );
                    }}
                  </FieldArray>
                  <FieldArray name="practice">
                    {({ fields }) => {
                      return (
                        <div className={css.sectionContainer}>
                          <h3 className={css.sectionTitle}>
                            <FormattedMessage id="ProfileSettingsForm.practiceAreaTitle" />
                            {/* Practice area */}
                          </h3>

                          {fields.map((name, i) => {
                            return (
                              <div key={name}>
                                <div className={css.fromgroup}>
                                  <FieldSelect
                                    id={`${name}.area`}
                                    name={`${name}.area`}
                                    validate={composeValidators(
                                      required(practiceAreaRequiredMessage)
                                    )}
                                  >
                                    <option value="">{practiceAreaPlaceholder}</option>
                                    <option value="area1">Area 1</option>
                                    <option value="area2">Area 2</option>
                                    <option value="area3">Area 3</option>
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
                              disabled={!values.practice[values.practice?.length - 1]?.area}
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
                              <div key={name}>
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
                                  {values?.industry[i]?.description?.split(' ').length >
                                  MAX_LIMIT ? (
                                    <span className={css.errorMessage}>
                                      {'You have exceeded the maximum word limit'}
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                </div>

                                <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                                  <FieldTextInput
                                    className={`${css.street} ${css.halfinput}`}
                                    type="date"
                                    id={`${name}.from`}
                                    name={`${name}.from`}
                                    label={fromLabel}
                                    // placeholder={vatPlaceholder}
                                    // validate={vatRequired}
                                  />
                                  <FieldTextInput
                                    className={`${css.street} ${css.halfinput}`}
                                    type="date"
                                    id={`${name}.to`}
                                    name={`${name}.to`}
                                    label={toLabel}
                                    // placeholder={vatPlaceholder}
                                    // validate={vatRequired}
                                  />
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
                </div>
              )}
              {user?.attributes?.profile?.protectedData?.isProfileVerified ? (
                ''
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
                              <div key={name}>
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
    );
  }
}

ProfileSettingsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

ProfileSettingsFormComponent.propTypes = {
  rootClassName: string,
  className: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const ProfileSettingsForm = compose(injectIntl)(ProfileSettingsFormComponent);

ProfileSettingsForm.displayName = 'ProfileSettingsForm';

export default ProfileSettingsForm;
