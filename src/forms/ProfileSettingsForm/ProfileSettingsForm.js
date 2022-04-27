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
import { required, composeValidators } from '../../util/validators';
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
} from '../../components';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import css from './ProfileSettingsForm.module.css';
import './PhoneInput2.css';
import axios from 'axios';
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
        {/* <ProfilePageSideNav/> */}
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

            const languagePlaceholder = intl.formatMessage({
              id: 'ProfileSettingsForm.languagePlaceholder',
            });
            const languageLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.languageLabel',
            });

            const languageRequiredMessage = intl.formatMessage({
              id: 'ProfileSettingsForm.languageRequired',
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
                          {this.state.countryData.map(m => (
                            <option value={m.iso3} key={m.iso3}>
                              {m.name}
                            </option>
                          ))}
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
                          {this.state.countryData.map(m => (
                            <option value={m.iso3} key={m.iso3}>
                              {m.name}
                            </option>
                          ))}
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

                {user && !user?.attributes?.profile?.protectedData?.isLawyer && (
                  <div className={css.client}>
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

                      <Select
                        closeMenuOnSelect={false}
                        className={css.reactSelect}
                        isSearchable={true}
                        name="language"
                        placeholder={languagePlaceholder}
                        onChange={onLanguageChangeHandler}
                        defaultValue={
                          initialValues.languages && JSON.parse(initialValues.languages)
                        }
                        isMulti
                        options={langOption}
                        onBlur={onLanguageBlurHandler}
                      />
                      {this.state.languageError ? (
                        <div className={css.errorMessage}>{languageRequiredMessage}</div>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                )}

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

ProfileSettingsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  uploadImageError: null,
  updateProfileError: null,
  country: config.custom.country,
  languages: config.custom.languages,
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
  country: array,
  languages: array,

  // from injectIntl
  intl: intlShape.isRequired,
};

const ProfileSettingsForm = compose(injectIntl)(ProfileSettingsFormComponent);

ProfileSettingsForm.displayName = 'ProfileSettingsForm';

export default ProfileSettingsForm;
