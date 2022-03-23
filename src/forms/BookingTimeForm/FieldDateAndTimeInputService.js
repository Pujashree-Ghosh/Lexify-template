import React, { Component } from 'react';
import { FieldDateInput } from '../../components';
import classNames from 'classnames';
import { compose } from 'redux';
import moment from 'moment';
import { injectIntl, FormattedMessage } from '../../util/reactIntl';
import css from './FieldDateAndTimeInputService.module.css';

class FieldDateAndTimeInputServiceComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.isOutsideRange = this.isOutsideRange.bind(this);
  }
  isOutsideRange(day, bookingStartDate, selectedTimeSlot, timeZone) {
    if (!selectedTimeSlot) {
      return true;
    }

    // 'day' is pointing to browser's local time-zone (react-dates gives these).
    // However, bookingStartDate and selectedTimeSlot refer to times in listing's timeZone.
    const localizedDay = timeOfDayFromLocalToTimeZone(day, timeZone);
    // Given day (endDate) should be after the start of the day of selected booking start date.
    const startDate = resetToStartOfDay(bookingStartDate, timeZone);
    // 00:00 would return wrong day as the end date.
    // Removing 1 millisecond, solves the exclusivity issue.
    const inclusiveEnd = new Date(selectedTimeSlot.attributes.end.getTime() - 1);
    // Given day (endDate) should be before the "next" day of selected timeSlots end.
    const endDate = resetToStartOfDay(inclusiveEnd, timeZone, 1);
    return !(dateIsAfter(localizedDay, startDate) && dateIsAfter(endDate, localizedDay));
  }

  render() {
    const {
      serviceStartDate,
      serviceEndDate,
      timeZone,
      form,
      values,
      intl,
      className,
      rootClassName,
      expiry,
    } = this.props;
    const startDateLabel = intl.formatMessage({
      id: 'FieldDateAndTimeInputService.startDateLabel',
    });
    const classes = classNames(rootClassName || css.root, className);

    return (
      <div className={classes}>
        <div className={css.formRow}>
          <FieldDateInput
            className={css.fieldDateInput}
            id="bookingStartDate"
            name="bookingStartDate"
            placeholderText={startDateLabel}
            useMobileMargins
            onChange={val => {
              form.change('bookingEndDate', { date: serviceEndDate });

              if (moment(serviceStartDate).isAfter(moment())) {
                form.change('bookingStartDate', serviceStartDate);
                form.change('bookingEndTime', moment(serviceEndDate).valueOf());
                form.change('bookingStartTime', moment(serviceStartDate).valueOf());

                // console.log(
                //   'shkahs',
                //   values,
                //   serviceEndDate,
                //   moment(serviceStartDate).toDate(),
                //   moment(val.date).toDate()
                // );
              }
            }}
            isDayBlocked={day => {
              console.log(
                moment(day).isSameOrBefore(moment(serviceEndDate)),
                moment(day).isSameOrAfter(moment(serviceStartDate)),
                day.toDate(),
                serviceEndDate,
                serviceStartDate
              );
              return !moment(day)
                .clone()
                .startOf('day')
                .isSameOrBefore(
                  moment(expiry)
                    .clone()
                    .startOf('day')
                );
            }}
            //   isOutsideRange={day => this.isOutsideRange(true)}
            // myClass={true}
          />
        </div>
      </div>
    );
  }
}

const FieldDateAndTimeInputService = compose(injectIntl)(FieldDateAndTimeInputServiceComponent);

export default FieldDateAndTimeInputService;
