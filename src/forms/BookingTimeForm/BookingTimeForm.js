import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { timestampToDate } from '../../util/dates';
import { propTypes } from '../../util/types';
import config from '../../config';
import { FieldCheckbox, Form, IconSpinner, Modal, PrimaryButton } from '../../components';
import EstimatedBreakdownMaybe from './EstimatedBreakdownMaybe';
import FieldDateAndTimeInput from './FieldDateAndTimeInput';
import FieldDateAndTimeInputService from './FieldDateAndTimeInputService';

import css from './BookingTimeForm.module.css';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';
import moment from 'moment';
// import { FieldCheckbox } from '../../examples';
// import FieldCheckbox from './FieldCheckbox';

import { Checkbox } from '@material-ui/core';
import FieldCheckboxComponent from '../../components/FieldCheckbox/FieldCheckbox';

export class BookingTimeFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // bookingDetails: [],
      // startDate: '',
      showDisclaimer: false,
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleFormSubmit(e) {
    this.props.onSubmit(e);
  }

  // When the values of the form are updated we need to fetch
  // lineItems from FTW backend for the EstimatedTransactionMaybe
  // In case you add more fields to the form, make sure you add
  // the values here to the bookingData object.
  handleOnChange(formValues) {
    const { bookingStartTime, bookingEndTime } = formValues.values;
    const startDate = bookingStartTime ? timestampToDate(bookingStartTime) : null;
    const endDate = bookingEndTime ? timestampToDate(bookingEndTime) : null;

    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    // We expect values bookingStartTime and bookingEndTime to be strings
    // which is the default case when the value has been selected through the form
    const isSameTime = bookingStartTime === bookingEndTime;
    if (bookingStartTime && bookingEndTime && !isSameTime && !this.props.fetchLineItemsInProgress) {
      this.props.onFetchTransactionLineItems({
        bookingData: { startDate, endDate },
        listingId,
        isOwnListing,
      });
    }
  }

  render() {
    const { rootClassName, className, price: unitPrice, ...rest } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    if (!unitPrice) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingPriceMissing" />
          </p>
        </div>
      );
    }
    if (unitPrice.currency !== config.currency) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingCurrencyInvalid" />
          </p>
        </div>
      );
    }

    return (
      <FinalForm
        {...rest}
        unitPrice={unitPrice}
        onSubmit={this.handleFormSubmit}
        render={fieldRenderProps => {
          const {
            endDatePlaceholder,
            startDatePlaceholder,
            form,
            pristine,
            handleSubmit,
            intl,
            isOwnListing,
            listingId,
            listing,
            submitButtonWrapperClassName,
            unitType,
            values,
            monthlyTimeSlots,
            onFetchTimeSlots,
            timeZone,
            lineItems,
            fetchLineItemsInProgress,
            fetchLineItemsError,
            duration,
            vat,
          } = fieldRenderProps;
          const startTime = values && values.bookingStartTime ? values.bookingStartTime : null;
          const endTime = values && values.bookingEndTime ? values.bookingEndTime : null;

          const category = listing?.attributes?.publicData?.category;
          const type = listing?.attributes?.publicData?.type;
          // console.log(type, category);
          const listingStartDate = listing?.attributes?.publicData?.startDate;
          const listingStartTime = listing?.attributes?.publicData?.startHour;
          const listingeEndDate = listing?.attributes?.publicData?.endDate;
          const listingeEndTime = listing?.attributes?.publicData?.endHour;
          const expTime = listing?.attributes?.publicData?.expiry;
          const serviceStartDate = moment(
            `${moment(listingStartDate).format('DD/MM/YYYY')} ${listingStartTime}`,
            'DD/MM/YYYY HH:mm:ss'
          ).format();
          const deadline = listing?.attributes?.publicData?.Deadline;
          const serviceEndDate = moment(
            `${moment(listingeEndDate).format('DD/MM/YYYY')} ${listingeEndTime}`,
            'DD/MM/YYYY HH:mm:ss'
          ).format();
          const expiry = moment(expTime).toDate();
          const bookingStartLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingStartTitle',
          });
          const bookingEndLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingEndTitle',
          });

          const startDate = startTime ? timestampToDate(startTime) : null;
          const endDate = endTime ? timestampToDate(endTime) : null;
          const beforeBufferTime =
            this.props?.listing?.author?.attributes?.profile?.publicData?.beforeBufferTime || 0;
          const afterBufferTime =
            this.props?.listing?.author?.attributes?.profile?.publicData?.afterBufferTime || 0;
          // console.log(beforeBufferTime, afterBufferTime, beforeBufferTime + afterBufferTime);

          // if (startDate && !moment(startDate).isSame(this.state.startDate)) {
          //   if (beforeBufferTime > 0 || afterBufferTime > 0) {
          //     axios
          //       .post(`${apiBaseUrl()}/api/booking/getBooking`, {
          //         providerId: this.props?.listing?.author?.id.uuid,
          //         start: moment(startDate)
          //           .clone()
          //           .subtract(beforeBufferTime + afterBufferTime - 1, 'm')
          //           .toDate(),
          //         end: moment(endDate)
          //           .clone()
          //           .add(beforeBufferTime + afterBufferTime - 1, 'm')
          //           .toDate(),
          //       })
          //       .then(resp => {
          //         this.setState({
          //           bookingDetails: resp.data,
          //           startDate: startDate,
          //         });
          //       })
          //       .catch(err => {
          //         console.log(err);
          //       });
          //   } else {
          //     axios
          //       .post(`${apiBaseUrl()}/api/booking/getBooking`, {
          //         providerId: this.props?.listing?.author?.id.uuid,
          //         start: moment(startDate)
          //           .clone()
          //           .add(1, 'm')

          //           .toDate(),
          //         end: moment(endDate)
          //           .clone()
          //           .subtract(1, 'm')
          //           .toDate(),
          //       })
          //       .then(resp => {
          //         this.setState({
          //           bookingDetails: resp.data,
          //           startDate: startDate,
          //         });
          //       })
          //       .catch(err => {
          //         console.log(err);
          //       });
          //   }
          // }

          // This is the place to collect breakdown estimation data. See the
          // EstimatedBreakdownMaybe component to change the calculations
          // for customized payment processes.
          const bookingData =
            startDate && endDate
              ? {
                  unitType,
                  startDate,
                  endDate,
                  timeZone,
                  quantity: 1,
                  vat,
                }
              : null;

          const showEstimatedBreakdown =
            bookingData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

          // console.log(6725, showEstimatedBreakdown, bookingData, startTime, endTime);

          const bookingInfoMaybe = showEstimatedBreakdown ? (
            <div className={css.priceBreakdownContainer}>
              <h3 className={css.priceBreakdownTitle}>
                <FormattedMessage id="BookingTimeForm.priceBreakdownTitle" />
              </h3>
              <EstimatedBreakdownMaybe bookingData={bookingData} lineItems={lineItems} />
            </div>
          ) : null;

          const loadingSpinnerMaybe = fetchLineItemsInProgress ? (
            <IconSpinner className={css.spinner} />
          ) : null;

          const bookingInfoErrorMaybe = fetchLineItemsError ? (
            <span className={css.sideBarError}>
              <FormattedMessage id="BookingDatesForm.fetchLineItemsError" />
            </span>
          ) : null;

          const submitButtonClasses = classNames(
            submitButtonWrapperClassName || css.submitButtonWrapper
          );

          const startDateInputProps = {
            label: bookingStartLabel,
            placeholderText: startDatePlaceholder,
          };
          const endDateInputProps = {
            label: bookingEndLabel,
            placeholderText: endDatePlaceholder,
          };

          const dateInputProps = {
            startDateInputProps,
            endDateInputProps,
          };
          // console.log(672, values);

          return (
            <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
              <FormSpy
                subscription={{ values: true }}
                onChange={values => {
                  this.handleOnChange(values);
                }}
              />
              <Modal
                id="boolingPageDisclaimer"
                isOpen={this.state.showDisclaimer}
                onClose={() => this.setState({ showDisclaimer: false })}
                usePortal
                onManageDisableScrolling={() => {}}
              >
                <div className={css.disclaimer}>{listing?.attributes?.publicData?.disclaimer}</div>
                <PrimaryButton
                  className={css.modalOk}
                  onClick={() => this.setState({ showDisclaimer: false })}
                >
                  Ok
                </PrimaryButton>
              </Modal>
              {monthlyTimeSlots && timeZone ? (
                type === 'unsolicited' ? (
                  <FieldDateAndTimeInputService
                    {...dateInputProps}
                    className={css.bookingDates}
                    listingId={listingId}
                    bookingStartLabel={bookingStartLabel}
                    onFetchTimeSlots={onFetchTimeSlots}
                    monthlyTimeSlots={monthlyTimeSlots}
                    values={values}
                    intl={intl}
                    form={form}
                    pristine={pristine}
                    timeZone={timeZone}
                    duration={duration}
                    listing={listing}
                    serviceStartDate={serviceStartDate}
                    serviceEndDate={serviceEndDate}
                    deadline={deadline}
                    category={category}
                    expiry={expiry}
                  />
                ) : (
                  <FieldDateAndTimeInput
                    {...dateInputProps}
                    className={css.bookingDates}
                    listingId={listingId}
                    bookingStartLabel={bookingStartLabel}
                    onFetchTimeSlots={onFetchTimeSlots}
                    monthlyTimeSlots={monthlyTimeSlots}
                    values={values}
                    intl={intl}
                    form={form}
                    pristine={pristine}
                    timeZone={timeZone}
                    duration={duration}
                    listing={listing}
                    afterBufferTime={afterBufferTime}
                    beforeBufferTime={beforeBufferTime}
                  />
                )
              ) : null}
              {/* {this.state.bookingDetails && this.state.bookingDetails.length > 0 ? (
                <span style={{ color: '#d92153' }}>
                  <FormattedMessage id="BookingTimeForm.slotNotAvailableMessage" />
                </span>
              ) : (
                <> */}
              {bookingInfoMaybe}
              {loadingSpinnerMaybe}
              {/* </>
              )} */}

              {bookingInfoErrorMaybe}

              <p className={css.smallPrint}>
                <FormattedMessage
                  id={
                    isOwnListing
                      ? 'BookingTimeForm.ownListing'
                      : 'BookingTimeForm.youWontBeChargedInfo'
                  }
                />
              </p>
              {/* <div className={css.disclaimercheckbox}>
                <input type="checkbox" className={css.Checkbox} />
                <div className={css.disclaimer}>
                  I have read the{' '}
                  <span onClick={() => console.log('clieck')}>
                    <u>disclaimer</u>
                  </span>
                </div>
              </div> */}
              {/* </checkbox> */}
              {listing?.attributes?.publicData?.disclaimer ? (
                <div className={css.disclaimercheckbox}>
                  <FieldCheckbox id="disclaimer" name="disclaimer" label={''} value="disclaimer" />
                  <div className={css.disclaimerLink}>
                    <div>
                      I have read the{' '}
                      <span
                        className={css.linkUl}
                        onClick={() => this.setState({ showDisclaimer: true })}
                      >
                        disclaimer
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                ''
              )}

              {!isOwnListing && (
                <div className={submitButtonClasses}>
                  <PrimaryButton
                    type="submit"
                    disabled={
                      (listing?.attributes?.publicData?.disclaimer &&
                        !values.disclaimer?.length > 0) ||
                      !startTime ||
                      !endTime
                    }
                  >
                    <FormattedMessage id="BookingTimeForm.requestToBook" />
                  </PrimaryButton>
                </div>
              )}
            </Form>
          );
        }}
      />
    );
  }
}

BookingTimeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  price: null,
  isOwnListing: false,
  listingId: null,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  monthlyTimeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

BookingTimeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  unitType: propTypes.bookingUnitType.isRequired,
  price: propTypes.money,
  isOwnListing: bool,
  listingId: propTypes.uuid,
  monthlyTimeSlots: object,
  onFetchTimeSlots: func.isRequired,

  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,
};

const BookingTimeForm = compose(injectIntl)(BookingTimeFormComponent);
BookingTimeForm.displayName = 'BookingTimeForm';

export default BookingTimeForm;
