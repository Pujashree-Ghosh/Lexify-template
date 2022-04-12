import React, { useState, useEffect } from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { injectIntl, FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import config from '../../config';
import { FieldArray } from 'react-final-form-arrays';
import {
  Button,
  FieldRadioButton,
  FieldTextInput,
  Form,
  InlineTextButton,
  FieldDateInput,
  FieldSelect,
  FieldTimeZoneSelect,
} from '../../components';
import { required, composeValidators } from '../../util/validators';
import { MdOutlineClose } from 'react-icons/md';

import css from './EditListingClientIdForm.module.css';
import moment from 'moment';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';

const EditListingClientIdFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        disabled,
        ready,
        rootClassName,
        className,
        handleSubmit,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        invalid,
        intl,
        values,
        form,
        duration,
        currentListing,
        category,
      } = formRenderProps;

      const userId = useSelector(state => state?.user?.currentUser?.id.uuid);

      const printTimeStrings = t => {
        const m = t % 60;
        const h = parseInt(t / 60);
        if (h > 9) {
          if (m > 9) {
            return `${h}:${m}`;
          } else {
            return `${h}:0${m}`;
          }
        } else {
          if (m > 9) {
            return `0${h}:${m}`;
          } else {
            return `0${h}:0${m}`;
          }
        }
      };
      const [endHours, setEndHours] = useState();
      const [bookingError, setBookinError] = useState(false);
      const hour = Array(97).fill();
      const ALL_HOURS = hour.map((v, i) => printTimeStrings(i * 15));
      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = disabled || invalid || submitInProgress;

      const { updateListingError, showListingsError } = fetchErrors || {};
      const errorMessage = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingClientIdForm.updateFailed" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingClientIdForm.showListingFailed" />
        </p>
      ) : null;

      const clientIdMessage = intl.formatMessage({
        id: 'EditListingClientIdForm.clientIdLabel',
      });
      const clientIdPlaceholderMessage = intl.formatMessage({
        id: 'EditListingClientIdForm.clientIdPlaceholder',
      });
      const clientIdRequiredMessage = intl.formatMessage({
        id: 'EditListingClientIdForm.clientIdRequired',
      });

      const startDateLabel = intl.formatMessage({
        id: 'EditListingAvailabilityForm.startDateLabel',
      });

      const endDateLabel = intl.formatMessage({
        id: 'EditListingAvailabilityForm.endDateLabel',
      });

      const startTimeLabel = intl.formatMessage({
        id: 'EditListingAvailabilityForm.startTimeLabel',
      });

      const endTimeLabel = intl.formatMessage({
        id: 'EditListingAvailabilityForm.endTimeLabel',
      });
      const valueIndex = values && values.startHour ? ALL_HOURS.indexOf(values.startHour) : null;

      const handleStartTimeChange = val => {
        const valueIndex = ALL_HOURS.indexOf(val);
        let getEndHours = ALL_HOURS.filter((item, index) => {
          if (index > valueIndex) {
            return item;
          }
        });

        // console.log('dd', getEndHours);
        // this.setState({
        //   endHours: getEndHours,
        // });
        setEndHours(getEndHours);
        if (duration) {
          const startTime = parseInt(val.split(':')[0] * 60) + parseInt(val.split(':')[1]);
          let ind;
          ALL_HOURS.filter((item, index) => {
            if (
              parseInt(item.split(':')[0] * 60) + parseInt(item.split(':')[1]) ===
              startTime + duration
            ) {
              ind = index;
            }
          });

          console.log(startTime + duration, ALL_HOURS[ind]);

          form.change('endHour', ALL_HOURS[ind]);
        }
      };

      const initialEndHours = valueIndex
        ? ALL_HOURS.filter((item, index) => {
            if (index > valueIndex) {
              return item;
            }
          })
        : null;

      useEffect(() => {
        if (currentListing?.attributes?.publicData?.category === 'customOral') {
          axios
            .post(`${apiBaseUrl()}/api/booking/getBooking`, {
              providerId: userId,
              start: moment(
                `${moment(values.startDate.date).format('DD/MM/YYYY')} ${values.startHour}`,
                'DD/MM/YYYY HH:mm:ss'
              )
                .clone()
                .add(1, 'm')
                .format(),
              end: moment(
                `${moment(values.startDate.date).format('DD/MM/YYYY')} ${values.startHour}`,
                'DD/MM/YYYY HH:mm:ss'
              )
                .clone()
                .add(1, 'm')
                .format(),
            })
            .then(resp => {
              if (resp.data.length > 0) {
                setBookinError(true);
              } else {
                setBookinError(false);
              }
            })
            .catch(err => {
              console.log(err);
            });
        }
      });
      // console.log(values);

      return (
        <Form
          className={classes}
          onSubmit={e => {
            e.preventDefault();
            if (values.type === 'unsolicited') {
              axios
                .post(`${apiBaseUrl()}/api/listing/createException`, {
                  id: currentListing.id.uuid,
                  startDate:
                    category === 'unsolicited'
                      ? moment(values.startDate.date).format()
                      : moment(
                          `${moment(values.startDate.date).format('DD/MM/YYYY')} ${
                            values.startHour
                          }`,
                          'DD/MM/YYYY HH:mm:ss'
                        ).format(),
                  endDate:
                    category === 'unsolicited'
                      ? moment(values.endDate.date).format()
                      : moment(
                          `${moment(values.endDate.date).format('DD/MM/YYYY')} ${values.endHour}`,
                          'DD/MM/YYYY HH:mm:ss'
                        ).format(),
                  seats: values.clientId.length,
                })
                .then(console.log('Saved'))
                .catch(err => console.log(err));
            } else {
              axios
                .delete(`${apiBaseUrl()}/api/listing/exceptionDelete`, {
                  data: {
                    id: currentListing.id.uuid,
                  },
                })
                .then(console.log('Saved'))
                .catch(err => console.log(err));
            }
            handleSubmit(e);
          }}
        >
          {errorMessage}
          {errorMessageShowListing}
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="EditListingClientIdForm.subTitle" />
          </h3>
          {category !== 'customService' ? (
            <div className={css.typeContainer}>
              <FieldRadioButton
                className={css.type}
                id="type1"
                name="type"
                label="Solicited"
                value="solicited"
                // showAsRequired={showAsRequired}
                onClick={() => form.change('clientId', [''])}
              />
              <FieldRadioButton
                className={css.type}
                id="type2"
                name="type"
                label="Unsolicited"
                value="unsolicited"
                // showAsRequired={showAsRequired}
                onClick={() => form.change('clientId', [''])}
              />
            </div>
          ) : (
            ''
          )}
          {values.type === 'solicited' ? (
            <div>
              <FieldArray name="clientId">
                {({ fields }) => {
                  return (
                    <div className={css.sectionContainer}>
                      <h3 className={css.sectionTitle}>
                        <FormattedMessage id="EditListingClientIdForm.clientIdLabel" />
                      </h3>

                      {fields.map((name, i) => {
                        return (
                          <div key={name + i}>
                            <div className={css.fromgroup}>
                              <FieldTextInput
                                id={name}
                                name={name}
                                className={css.clientId}
                                type="text"
                                // label={clientIdMessage}
                                placeholder={clientIdPlaceholderMessage}
                                validate={composeValidators(required(clientIdRequiredMessage))}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              </FieldArray>
              <div className={css.infoText}>You can find client ID in client's profile</div>
            </div>
          ) : (
            <div>
              <FieldArray name="clientId">
                {({ fields }) => {
                  return (
                    <div className={css.sectionContainer}>
                      <h3 className={css.sectionTitle}>
                        <FormattedMessage id="EditListingClientIdForm.clientIdLabel" />
                        {/* Practice area */}
                      </h3>

                      {fields.map((name, i) => {
                        return (
                          <div key={name + i}>
                            <div className={css.fromgroup}>
                              <FieldTextInput
                                id={name}
                                name={name}
                                className={css.clientId}
                                type="text"
                                // label={clientIdMessage}
                                placeholder={clientIdPlaceholderMessage}
                                validate={composeValidators(required(clientIdRequiredMessage))}
                              />
                              <MdOutlineClose
                                onClick={() => {
                                  form.change(
                                    'clientId',
                                    values.clientId.filter(f => f !== values.clientId[i])
                                  );
                                  if (values.clientId.length === 1) {
                                    form.change('clientId', ['']);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      <div className={css.inlinefrom}>
                        <InlineTextButton
                          className={css.addMore}
                          type="button"
                          onClick={() => {
                            fields.push();
                          }}
                          // disabled={!values.practice[values.practice?.length - 1]}
                        >
                          <FormattedMessage id="EditListingClientIdForm.addMoreClient" />
                        </InlineTextButton>
                        {/* <Button
                        className={css.remove}
                        type="button"
                        onClick={() => {
                          fields.pop();
                        }}
                        // disabled={values.practice?.length < 2}
                      >
                        <FormattedMessage id="ProfileSettingsForm.remove" />
                      </Button> */}
                      </div>
                    </div>
                  );
                }}
              </FieldArray>
              <div className={css.infoText}>You can find client ID in client's profile</div>

              {/* <FieldTimeZoneSelect
                id="timezone"
                name="timezone"
                className={css.timeZone}
                // type="text"
                label={intl.formatMessage({
                  id: 'EditListingLocationForm.videoTimeZone',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditListingLocationForm.videoTimeZonePlaceholder',
                })}
                // maxLength={TITLE_MAX_LENGTH}
                validate={composeValidators(
                  required(
                    intl.formatMessage({
                      id: 'EditListingLocationForm.videoTimeZoneRequired',
                    })
                  )
                )}
              /> */}

              <div className={`${css.inlinefrom} ${css.cdin} mobiledsd`}>
                <div className={css.cdinwd}>
                  {startDateLabel}
                  <FieldDateInput
                    className={(css.bookingDates, css.startDatePlaceholder)}
                    id="startDate"
                    name="startDate"
                    placeholderText={startDateLabel}
                    useMobileMargins
                    onChange={val => {
                      if (duration) {
                        form.change('endDate', val);
                      } else {
                        form.change('endDate', {});
                      }
                    }}
                    // myClass={true}
                  />
                </div>
                <div className={css.cdinwd}>
                  {endDateLabel}
                  <FieldDateInput
                    id="endDate"
                    className={css.bookingDates}
                    name="endDate"
                    placeholderText={endDateLabel}
                    useMobileMargins
                    isDayBlocked={day => {
                      return moment(values?.startDate.date).isAfter(day);
                    }}
                    disabled={duration ? true : false}
                  />
                </div>
              </div>
              {category !== 'customService' ? (
                <div className={`${css.inlinefrom} ${css.cdin}`}>
                  <div className={css.cdinwd}>
                    {startTimeLabel}
                    <FieldSelect
                      id="startHour"
                      name="startHour"
                      // label={startTimeLabel}
                      className={css.bookingDates}
                      validate={composeValidators(required('Start hour is required'))}
                      onChange={handleStartTimeChange}
                    >
                      <option value="">Choose Start Hour</option>
                      {ALL_HOURS.map(i => (
                        <option value={i}>{i}</option>
                      ))}
                    </FieldSelect>
                  </div>
                  <div className={css.cdinwd}>
                    {endTimeLabel}

                    {endHours && endHours.length > 0 ? (
                      <FieldSelect
                        id="endHour"
                        name="endHour"
                        // label={endTimeLabel}
                        className={css.endTime}
                        validate={composeValidators(required('End hour is required'))}
                        disabled={duration ? true : false}
                      >
                        <option value="">Choose End Hour</option>
                        {endHours.map(i => (
                          <option value={i}>{i}</option>
                        ))}
                      </FieldSelect>
                    ) : initialEndHours ? (
                      <FieldSelect
                        id="endHour"
                        name="endHour"
                        // label={endTimeLabel}
                        className={css.endTime}
                        validate={composeValidators(required('End hour is required'))}
                        disabled={duration ? true : false}
                      >
                        <option value="">Choose End Hour</option>
                        {initialEndHours.map(i => (
                          <option value={i}>{i}</option>
                        ))}
                      </FieldSelect>
                    ) : (
                      <FieldSelect
                        id="endHour"
                        name="endHour"
                        // label={endTimeLabel}
                        className={css.endTime}
                        validate={composeValidators(required('End hour is required'))}
                        disabled={duration ? true : false}
                      >
                        <option value="">Choose End Hour</option>
                        {ALL_HOURS.map(i => (
                          <option value={i}>{i}</option>
                        ))}
                      </FieldSelect>
                    )}
                  </div>
                </div>
              ) : (
                ''
              )}
              {bookingError ? (
                <span style={{ color: ' red' }}>You already have something in this time slot</span>
              ) : (
                ''
              )}
            </div>
          )}
          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled || bookingError}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingClientIdFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  fetchErrors: null,
  areaOfLawOptions: config.custom.areaOfLaw.options,
};

EditListingClientIdFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  areaOfLawOptions: propTypes.areaOfLawOptions,
};

const EditListingClientIdForm = compose(injectIntl)(EditListingClientIdFormComponent);

export default EditListingClientIdForm;
