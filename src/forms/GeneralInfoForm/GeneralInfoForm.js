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
import jsonwebtoken from 'jsonwebtoken';
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

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset
const identity = v => v;
const MAX_LIMIT = 100;

class GeneralInfoFormComponent extends Component {
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
    axios
      .get(`${apiBaseUrl()}/api/getAdminAvailability`)
      .then(resp => {
        const userId = resp?.data[0]?.userId;
        const entries = resp?.data[0]?.entries;
        this.setState({ adminAvailability: entries, adminId: userId });
      })
      .catch(e => console.log(e));
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

            //   const companyNumberPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.companyNumberPlaceholder',
            //   });

            //   const countryPlaceHolder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.countryPlaceHolder',
            //   });
            //   const countryRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.countryRequired',
            //   });
            //   const streetPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.streetPlaceholder',
            //   });
            //   const streetRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.streetRequired',
            //   });
            //   const streetRequired = validators.required(streetRequiredMessage);

            //   const cityLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.cityLabel',
            //   });
            //   const cityPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.cityPlaceholder',
            //   });
            //   const cityRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.cityRequired',
            //   });
            //   const cityRequired = validators.required(cityRequiredMessage);

            //   const statePlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.statePlaceholder',
            //   });
            //   const stateRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.stateRequired',
            //   });
            //   const stateRequired = validators.required(stateRequiredMessage);

            //   const zipCodePlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.zipCodePlaceholder',
            //   });
            //   const zipCodeRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.zipCodeRequired',
            //   });
            //   const zipCodeRequired = validators.required(zipCodeRequiredMessage);

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
            //   const practiceDateLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.practiceDateLabel',
            //   });

            //   const practiceDateRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.practiceDateRequired',
            //   });

            //   const statusPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.statusPlaceholder',
            //   });
            //   const statusLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.statusLabel',
            //   });

            //   const statusRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.statusRequired',
            //   });

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

            //   const graduationPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.graduationPlaceholder',
            //   });
            //   const graduationLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.graduationLabel',
            //   });

            //   const graduationRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.graduationRequired',
            //   });

            //   const practiceAreaPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.practiceAreaPlaceholder',
            //   });
            //   const practiceAreaLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.practiceAreaLabel',
            //   });

            //   const practiceAreaRequiredMessage = intl.formatMessage({
            //     id: 'ProfileSettingsForm.practiceAreaRequired',
            //   });

            //   const industryPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.industryPlaceholder',
            //   });
            //   const industryLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.industryLabel',
            //   });

            // const industryRequiredMessage = intl.formatMessage({
            //   id: 'ProfileSettingsForm.industryRequired',
            // });

            //   const recentWorkPlaceholder = intl.formatMessage({
            //     id: 'ProfileSettingsForm.recentWorkPlaceholder',
            //   });
            //   const recentWorkLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.recentWorkLabel',
            //   });

            // const recentWorkRequiredMessage = intl.formatMessage({
            //   id: 'ProfileSettingsForm.recentWorkRequired',
            // });

            // const fromPlaceholder = intl.formatMessage({
            //   id: 'ProfileSettingsForm.fromPlaceholder',
            // });
            //   const fromLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.fromLabel',
            //   });

            // const fromRequiredMessage = intl.formatMessage({
            //   id: 'ProfileSettingsForm.fromRequired',
            // });

            // const toPlaceholder = intl.formatMessage({
            //   id: 'ProfileSettingsForm.toPlaceholder',
            // });
            //   const toLabel = intl.formatMessage({
            //     id: 'ProfileSettingsForm.toLabel',
            //   });

            // const toRequiredMessage = intl.formatMessage({
            //   id: 'ProfileSettingsForm.toRequired',
            // });

            const startDateLabel = intl.formatMessage({
              id: 'ProfileSettingsForm.startDateLabel',
            });

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
              (values.languages ? !JSON.parse(values.languages).length > 0 : true);
            // ||
            // values?.industry?.filter(f => f?.description?.split(' ').length > MAX_LIMIT).length >
            //   0
            //   ? true
            //   : false;

            // console.log(user, user?.attributes?.profile?.protectedData?.isProfileVerified);

            // console.log(this.state.allStartHour);
            const verificationId = currentUser?.attributes?.profile?.protectedData?.verificationId;

            const getVideoLink = () => {
              const transactionId =
                moment(
                  `${moment(values.startDate.date).format('DD/MM/YYYY')} ${values.startTime}`,
                  'DD/MM/YYYY HH:mm:ss'
                )
                  .clone()
                  .toISOString() + currentUser.id.uuid;
              const transaction_customer_id = this.state.adminId;
              const transaction_provider_id = currentUser.id.uuid;
              const startTime = moment(
                `${moment(values.startDate.date).format('DD/MM/YYYY')} ${values.startTime}`,
                'DD/MM/YYYY HH:mm:ss'
              )
                .clone()
                .toISOString();
              const endTime = moment(
                `${moment(values.startDate.date).format('DD/MM/YYYY')} ${values.startTime}`,
                'DD/MM/YYYY HH:mm:ss'
              )
                .clone()
                .add(15, 'm')
                .toISOString();

              let jwtToken = jsonwebtoken.sign(
                {
                  startTime,
                  endTime,
                  transactionId,
                  listingId: '',
                  listingTitle: 'Verification Call',
                  transaction_customer_id,
                  transaction_provider_id,
                  // role,
                },
                config.secretCode
              );
              // this.setState({ joinMeetingProgress: false });
              // window.open(`/meeting-new/${jwtToken}`);
              // console.log(jwtToken);
              return jwtToken;
            };

            return (
              <Form
                className={classes}
                onSubmit={async e => {
                  e.preventDefault();
                  this.submittedValues = values;
                  const videoLink = this.state.verificationChange && getVideoLink();
                  const booking = this.state.verificationChange
                    ? verificationId
                      ? await axios.post(`${apiBaseUrl()}/api/updateVerification`, {
                          id: verificationId,
                          orderId:
                            moment(
                              `${moment(values.startDate.date).format('DD/MM/YYYY')} ${
                                values.startTime
                              }`,
                              'DD/MM/YYYY HH:mm:ss'
                            )
                              .clone()
                              .toISOString() + currentUser.id.uuid,
                          start: moment(
                            `${moment(values.startDate.date).format('DD/MM/YYYY')} ${
                              values.startTime
                            }`,
                            'DD/MM/YYYY HH:mm:ss'
                          )
                            .clone()
                            .toISOString(),
                          end: moment(
                            `${moment(values.startDate.date).format('DD/MM/YYYY')} ${
                              values.startTime
                            }`,
                            'DD/MM/YYYY HH:mm:ss'
                          )
                            .clone()
                            .add(15, 'm')
                            .toISOString(),
                          meetingLink: videoLink,
                        })
                      : await axios.post(`${apiBaseUrl()}/api/setVerification`, {
                          orderId:
                            moment(
                              `${moment(values.startDate.date).format('DD/MM/YYYY')} ${
                                values.startTime
                              }`,
                              'DD/MM/YYYY HH:mm:ss'
                            )
                              .clone()
                              .toISOString() + currentUser.id.uuid,
                          providerId: this.state.adminId,
                          customerId: currentUser.id.uuid,
                          start: moment(
                            `${moment(values.startDate.date).format('DD/MM/YYYY')} ${
                              values.startTime
                            }`,
                            'DD/MM/YYYY HH:mm:ss'
                          )
                            .clone()
                            .toISOString(),
                          end: moment(
                            `${moment(values.startDate.date).format('DD/MM/YYYY')} ${
                              values.startTime
                            }`,
                            'DD/MM/YYYY HH:mm:ss'
                          )
                            .clone()
                            .add(15, 'm')
                            .toISOString(),
                          meetingLink: videoLink,
                        })
                    : null;

                  if (booking) {
                    values.verificationId = booking.data._id;
                  }
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
                    options={langOption}
                    onBlur={onLanguageBlurHandler}
                  />
                  {this.state.languageError ? (
                    <div className={css.errorMessage}>{languageRequiredMessage}</div>
                  ) : (
                    ''
                  )}
                </div>
                {/* <div className={css.sectionContainer}>
                  <h3 className={css.sectionTitle}>
                    <FormattedMessage id="ProfileSettingsForm.timeZone" />
                  </h3>
                  <FieldSelect
                    id="timeZone"
                    name="timeZone"
                    validate={composeValidators(required(timeZoneRequiredMessage))}
                  >
                    <option value="">{timeZonePlaceholder}</option>
                    <option value="first">First option</option>
                    <option value="second">Second option</option>
                  </FieldSelect>
                </div> */}
                <div className={classNames(css.sectionContainer, css.lastSection)}>
                  <h3 className={css.sectionTitle}>
                    <FormattedMessage id="ProfileSettingsForm.bioHeading" />
                  </h3>
                  <FieldTextInput
                    type="textarea"
                    id="bio"
                    name="bio"
                    label={bioLabel}
                    placeholder={bioPlaceholder}
                  />
                </div>

                {user?.attributes?.profile?.protectedData?.isProfileVerified ? (
                  ''
                ) : (
                  <div>
                    {/* <FieldArray name="schedule">
                      {({ fields }) => {
                        return (
                          <div className={css.sectionContainer}>
                            <h3 className={css.sectionTitle}>
                              <FormattedMessage id="ProfileSettingsForm.verification" />
                            </h3>
                            <p>Schedule a call for verification</p>
                            {fields.map((name, i) => {
                              return ( 
                                <div key={name + i}>*/}
                    <div className={`${css.fromgroup} ${css.inlinefrom}`}>
                      <FieldDateInput
                        label={DateLabel}
                        className={`${css.bookingDates} ${css.halfinput}`}
                        id="startDate"
                        name="startDate"
                        placeholderText={startDateLabel}
                        useMobileMargins
                        onChange={val => {
                          let allBooking = [];
                          let allAvailableTime = [];
                          form.change('startTime', '');
                          this.setState({ verificationChange: true });

                          this.state.adminAvailability
                            .filter(
                              f =>
                                f.dayOfWeek ===
                                moment(val.date)
                                  .format('ddd')
                                  .toLocaleLowerCase()
                            )
                            .map(m => {
                              let start = moment();
                              if (
                                Number(
                                  moment(
                                    `${moment(val.date).format('DD/MM/YYYY')} ${m.startTime}`,
                                    'DD/MM/YYYY HH:mm:ss'
                                  )
                                    .clone()
                                    .format('mm')
                                ) % 5
                              ) {
                                const min = moment(
                                  `${moment(val.date).format('DD/MM/YYYY')} ${m.startTime}`,
                                  'DD/MM/YYYY HH:mm:ss'
                                )
                                  .clone()
                                  .format('mm');
                                const minToAdd = 5 * (parseInt(min / 5) + 1);

                                start = moment(
                                  `${moment(val.date).format('DD/MM/YYYY')} ${m.startTime}`,
                                  'DD/MM/YYYY HH:mm:ss'
                                )
                                  .clone()
                                  .add(minToAdd, 'm');
                              } else {
                                start = moment(
                                  `${moment(val.date).format('DD/MM/YYYY')} ${m.startTime}`,
                                  'DD/MM/YYYY HH:mm:ss'
                                ).clone();
                              }
                              const end = moment(
                                `${moment(val.date).format('DD/MM/YYYY')} ${m.endTime}`,
                                'DD/MM/YYYY HH:mm:ss'
                              ).clone();
                              while (
                                start
                                  .clone()
                                  // .add(5, 'm')
                                  .isSameOrBefore(moment(end))
                              ) {
                                allAvailableTime.push(start.format());
                                // console.log(allAvailableTime);

                                start.add(5, 'm');
                              }
                            });

                          axios
                            .post(`${apiBaseUrl()}/api/booking/getProviderBooking`, {
                              providerId: this.state.adminId,
                              start: moment(val.date)
                                .startOf('day')
                                .toISOString(),
                              end: moment(val.date)
                                .endOf('day')
                                .toISOString(),
                            })
                            .then(resp => {
                              resp.data.map(r => {
                                allBooking.push({
                                  start: moment(r.start).toDate(),
                                  end: moment(r.end).toDate(),
                                });
                              });
                              let allBookedSlot = [];
                              allBooking.map((b, i) => {
                                const start = moment(b.start).clone();
                                const end = moment(b.end).clone();
                                // .subtract(1, 'm');
                                let count = 0;
                                while (
                                  start
                                    .clone()
                                    .add(5, 'm')
                                    .isSameOrBefore(moment(end))
                                ) {
                                  if (count === 0) {
                                    allBookedSlot.push(
                                      start
                                        .clone()
                                        .add(1, 'm')
                                        .format()
                                    );
                                  } else {
                                    allBookedSlot.push(start.format());
                                  }
                                  start.add(5, 'm');
                                  count += 1;
                                }
                              });
                              let availableTimeSlots = allAvailableTime.filter(
                                f => !allBookedSlot.includes(f)
                              );

                              // console.log(allAvailableTime, allBookedSlot);

                              const allStartHour = [];
                              availableTimeSlots.map(m => {
                                const start = moment(m).clone();
                                // const min = duration && duration.split('.')[1];
                                // const hour = duration && duration.split('.')[0];

                                const totalMin = 15;

                                if (
                                  availableTimeSlots.includes(
                                    start
                                      .clone()
                                      // .add(hour, 'h')
                                      .add(15, 'm')
                                      .format()
                                  ) &&
                                  availableTimeSlots.indexOf(
                                    start
                                      .clone()
                                      // .add(hour, 'h')
                                      .add(15, 'm')
                                      .format()
                                  ) -
                                    availableTimeSlots.indexOf(start.clone().format()) ===
                                    totalMin / 5
                                ) {
                                  allStartHour.push({
                                    timeOfDay: start.format('HH:mm'),
                                    timestamp: start.valueOf(),
                                  });
                                  start.add(5, 'm');
                                }
                              });
                              this.setState({ allStartHour: allStartHour });
                            });
                        }}
                        isDayBlocked={day => {
                          const weekDay = this.state.adminAvailability?.map(m => m.dayOfWeek);
                          return !weekDay.includes(day.format('ddd').toLowerCase());
                        }}
                      />
                      {/* <FieldTextInput
                                      className={`${css.street} ${css.thirdinput}`}
                                      type="date"
                                      id={`${name}.date`}
                                      name={`${name}.date`}
                                      label={DateLabel}
                                      // placeholder={vatPlaceholder}
                                      // validate={vatRequired}
                                    /> */}
                      <FieldSelect
                        className={`${css.serviceTime} ${css.halfinput}`}
                        name={`startTime`}
                        id={`startTime`}
                        label={startTimeLabel}
                        placeholder={startTimePlaceholder}
                        validate={composeValidators(required(startTimeRequiredMessage))}
                        // onChange={e => console.log(e)}
                      >
                        <option>
                          {initialValues?.startTime
                            ? initialValues?.startTime
                            : startTimePlaceholder}
                        </option>

                        {this.state.allStartHour.map(h => {
                          return (
                            <option key={h.timestamp} value={h.timeOfDay}>
                              {h.timeOfDay ? h.timeOfDay : startTimePlaceholder}
                            </option>
                          );
                        })}
                      </FieldSelect>

                      {/* <FieldSelect
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
                                    </FieldSelect> */}
                    </div>
                    {/* </div>
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
                    </FieldArray> */}
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

GeneralInfoFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  uploadImageError: null,
  updateProfileError: null,
  areaOfLawOptions: config.custom.areaOfLaw.options,
  country: config.custom.country,
  languages: config.custom.languages,
  updateProfileReady: false,
};

GeneralInfoFormComponent.propTypes = {
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

const GeneralInfoForm = compose(injectIntl)(GeneralInfoFormComponent);

GeneralInfoForm.displayName = 'GeneralInfoForm';

export default GeneralInfoForm;
