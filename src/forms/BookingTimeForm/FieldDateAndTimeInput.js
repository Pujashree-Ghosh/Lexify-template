import React, { Component } from 'react';
import { func, object, string } from 'prop-types';
import classNames from 'classnames';
import config from '../../config';
import { intlShape } from '../../util/reactIntl';
import {
  getStartHours,
  getEndHours,
  isInRange,
  isSameDate,
  isDayMomentInsideRange,
  resetToStartOfDay,
  timeOfDayFromLocalToTimeZone,
  timeOfDayFromTimeZoneToLocal,
  dateIsAfter,
  findNextBoundary,
  timestampToDate,
  localizeAndFormatTime,
  monthIdStringInTimeZone,
  getMonthStartInTimeZone,
  nextMonthFn,
  prevMonthFn,
} from '../../util/dates';
import { propTypes } from '../../util/types';
import { bookingDateRequired } from '../../util/validators';
import { FieldDateInput, FieldSelect } from '../../components';

import NextMonthIcon from './NextMonthIcon';
import PreviousMonthIcon from './PreviousMonthIcon';
import moment from 'moment';
import css from './FieldDateAndTimeInput.module.css';
import axios from 'axios';
import { apiBaseUrl } from '../../util/api';

// MAX_TIME_SLOTS_RANGE is the maximum number of days forwards during which a booking can be made.
// This is limited due to Stripe holding funds up to 90 days from the
// moment they are charged:
// https://stripe.com/docs/connect/account-balances#holding-funds
//
// See also the API reference for querying time slots:
// https://www.sharetribe.com/api-reference/marketplace.html#query-time-slots

const MAX_TIME_SLOTS_RANGE = config.dayCountAvailableForBooking;

const TODAY = new Date();

const endOfRange = (date, timeZone) => {
  return resetToStartOfDay(date, timeZone, MAX_TIME_SLOTS_RANGE - 1);
};

const getAvailableStartTimes = (
  intl,
  timeZone,
  bookingStart,
  timeSlotsOnSelectedDate,
  duration,
  providerId
) => {
  if (timeSlotsOnSelectedDate.length === 0 || !timeSlotsOnSelectedDate[0] || !bookingStart) {
    return [];
  }
  const bookingStartDate = resetToStartOfDay(bookingStart, timeZone);
  const availableTimes = timeSlotsOnSelectedDate.map(t => ({
    start: moment(t.attributes.start).toDate(),
    end: moment(t.attributes.end).toDate(),
  }));

  let allStartHour = [];

  const allHours = timeSlotsOnSelectedDate.reduce((availableHours, t) => {
    const startDate = t.attributes.start;
    const endDate = t.attributes.end;
    const nextDate = resetToStartOfDay(bookingStartDate, timeZone, 1);

    // If the start date is after timeslot start, use the start date.
    // Otherwise use the timeslot start time.
    const startLimit = dateIsAfter(bookingStartDate, startDate) ? bookingStartDate : startDate;

    // If date next to selected start date is inside timeslot use the next date to get the hours of full day.
    // Otherwise use the end of the timeslot.
    const endLimit = dateIsAfter(endDate, nextDate) ? nextDate : endDate;

    const hours = getStartHours(intl, timeZone, startLimit, endLimit, '0.5');
    return availableHours.concat(hours);
  }, []);
  timeSlotsOnSelectedDate.map(m => {
    const start = moment(m.attributes.start).clone();
    const end = moment(m.attributes.end).clone();
    const min = duration && duration.split('.')[1];
    const hour = duration && duration.split('.')[0];

    while (
      start
        .clone()
        .add(hour, 'h')
        .add(min, 'm')
        .isSameOrBefore(moment(end))
    ) {
      allStartHour.push({
        timeOfDay: start.format('HH:mm'),
        timestamp: start.valueOf(),
      });
      start.add(5, 'm');
    }
  });
  return allStartHour;
};

const getAvailableEndTimes = (
  intl,
  timeZone,
  bookingStartTime,
  bookingEndDate,
  selectedTimeSlot,
  duration
) => {
  const m = duration && parseInt(duration.split('.')[1]);
  const min = duration ? parseInt(duration.split('.')[0]) * 60 + m : 0;

  if (!selectedTimeSlot || !selectedTimeSlot.attributes || !bookingEndDate || !bookingStartTime) {
    return [];
  }

  const endDate = selectedTimeSlot.attributes.end;
  const bookingStartTimeAsDate = timestampToDate(bookingStartTime);

  const dayAfterBookingEnd = resetToStartOfDay(bookingEndDate, timeZone, 1);
  const dayAfterBookingStart = resetToStartOfDay(bookingStartTimeAsDate, timeZone, 1);
  const startOfEndDay = resetToStartOfDay(bookingEndDate, timeZone);

  let startLimit;
  let endLimit;

  if (!dateIsAfter(startOfEndDay, bookingStartTimeAsDate)) {
    startLimit = bookingStartTimeAsDate;
    endLimit = dateIsAfter(dayAfterBookingStart, endDate) ? endDate : dayAfterBookingStart;
  } else {
    // If the end date is on the same day as the selected booking start time
    // use the start time as limit. Otherwise use the start of the selected end date.
    startLimit = dateIsAfter(bookingStartTimeAsDate, startOfEndDay)
      ? bookingStartTimeAsDate
      : startOfEndDay;

    // If the selected end date is on the same day as timeslot end, use the timeslot end.
    // Else use the start of the next day after selected date.
    endLimit = isSameDate(resetToStartOfDay(endDate, timeZone), startOfEndDay)
      ? endDate
      : dayAfterBookingEnd;
  }
  return getEndHours(intl, timeZone, startLimit, endLimit, duration);
};

const getTimeSlots = (timeSlots, date, timeZone) => {
  return timeSlots && timeSlots[0]
    ? timeSlots.filter(t => isInRange(date, t.attributes.start, t.attributes.end, 'day', timeZone))
    : [];
};

// Use start date to calculate the first possible start time or times, end date and end time or times.
// If the selected value is passed to function it will be used instead of calculated value.
const getAllTimeValues = (
  intl,
  timeZone,
  timeSlots,
  startDate,
  selectedStartTime,
  selectedEndDate,
  duration,
  providerId
) => {
  const startTimes = selectedStartTime
    ? []
    : getAvailableStartTimes(
        intl,
        timeZone,
        startDate,
        getTimeSlots(timeSlots, startDate, timeZone),
        duration,
        providerId
      );

  // console.log(9725, startTimes);

  // Value selectedStartTime is a string when user has selected it through the form.
  // That's why we need to convert also the timestamp we use as a default
  // value to string for consistency. This is expected later when we
  // want to compare the sartTime and endTime.
  const startTime = selectedStartTime
    ? selectedStartTime
    : startTimes.length > 0 && startTimes[0] && startTimes[0].timestamp
    ? startTimes[0].timestamp.toString()
    : null;

  const startTimeAsDate = startTime ? timestampToDate(startTime) : null;

  // Note: We need to remove 1ms from the calculated endDate so that if the end
  // date would be the next day at 00:00 the day in the form is still correct.
  // Because we are only using the date and not the exact time we can remove the
  // 1ms.
  const endDate = selectedEndDate
    ? selectedEndDate
    : startTimeAsDate
    ? new Date(findNextBoundary(timeZone, startTimeAsDate).getTime() - 1)
    : null;

  const selectedTimeSlot = timeSlots.find(t =>
    isInRange(startTimeAsDate, t.attributes.start, t.attributes.end)
  );

  const endTimes = getAvailableEndTimes(
    intl,
    timeZone,
    startTime,
    endDate,
    selectedTimeSlot,
    duration
  );

  // We need to convert the timestamp we use as a default value
  // for endTime to string for consistency. This is expected later when we
  // want to compare the sartTime and endTime.
  const endTime =
    endTimes.length > 0 && endTimes[0] && endTimes[0].timestamp
      ? endTimes[0].timestamp.toString()
      : null;
  // console.log(9898, endTimes);
  return { startTime, endDate, endTime, selectedTimeSlot };
};

const getMonthlyTimeSlots = (monthlyTimeSlots, date, timeZone) => {
  const monthId = monthIdStringInTimeZone(date, timeZone);

  return !monthlyTimeSlots || Object.keys(monthlyTimeSlots).length === 0
    ? []
    : monthlyTimeSlots[monthId] && monthlyTimeSlots[monthId].timeSlots
    ? monthlyTimeSlots[monthId].timeSlots
    : [];
};

const Next = props => {
  const { currentMonth, timeZone } = props;
  const nextMonthDate = nextMonthFn(currentMonth, timeZone);

  return dateIsAfter(nextMonthDate, endOfRange(TODAY, timeZone)) ? null : <NextMonthIcon />;
};
const Prev = props => {
  const { currentMonth, timeZone } = props;
  const prevMonthDate = prevMonthFn(currentMonth, timeZone);
  const currentMonthDate = getMonthStartInTimeZone(TODAY, timeZone);

  return dateIsAfter(prevMonthDate, currentMonthDate) ? <PreviousMonthIcon /> : null;
};

/////////////////////////////////////
// FieldDateAndTimeInput component //
/////////////////////////////////////
class FieldDateAndTimeInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMonth: getMonthStartInTimeZone(TODAY, props.timeZone),
      startDate: null,
      globalAvailability: [],
      bookedSlot: [],
      timeSlots: [],
      availableTimeSlots: [],
      allStart: [],
    };

    this.fetchMonthData = this.fetchMonthData.bind(this);
    this.onMonthClick = this.onMonthClick.bind(this);
    this.onBookingStartDateChange = this.onBookingStartDateChange.bind(this);
    this.onBookingStartTimeChange = this.onBookingStartTimeChange.bind(this);
    this.onBookingEndDateChange = this.onBookingEndDateChange.bind(this);
    this.isOutsideRange = this.isOutsideRange.bind(this);
  }

  fetchMonthData(date) {
    const { listingId, timeZone, onFetchTimeSlots } = this.props;
    const endOfRangeDate = endOfRange(TODAY, timeZone);

    // Don't fetch timeSlots for past months or too far in the future
    if (isInRange(date, TODAY, endOfRangeDate)) {
      // Use "today", if the first day of given month is in the past
      const start = dateIsAfter(TODAY, date) ? TODAY : date;

      // Use endOfRangeDate, if the first day of the next month is too far in the future
      const nextMonthDate = nextMonthFn(date, timeZone);
      const end = dateIsAfter(nextMonthDate, endOfRangeDate)
        ? resetToStartOfDay(endOfRangeDate, timeZone, 0)
        : nextMonthDate;

      // Fetch time slots for given time range
      onFetchTimeSlots(listingId, start, end, timeZone);
    }
  }

  onMonthClose(date) {
    const { onMonthChanged, timeZone } = this.props;

    this.setState(
      {
        currentMonth: timeZone
          ? moment(date)
              .clone()
              .tz(timeZone)
              .startOf('month')
              .toDate()
          : moment(date)
              .clone()
              .startOf('month')
              .toDate(),
      },
      () => {
        // Callback function after month has been updated.
        // react-dates component has next and previous months ready (but inivisible).
        // we try to populate those invisible months before user advances there.
        this.fetchMonthData(this.state.currentMonth);

        // If previous fetch for month data failed, try again.
        const monthId = monthIdStringInTimeZone(this.state.currentMonth, timeZone);
        const currentMonthData = this.props.monthlyTimeSlots[monthId];
        if (currentMonthData && currentMonthData.fetchTimeSlotsError) {
          this.fetchMonthData(this.state.currentMonth, timeZone);
        }

        // Call onMonthChanged function if it has been passed in among props.
        if (onMonthChanged) {
          onMonthChanged(monthId);
        }
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const providerId = this.props?.listing?.author?.id.uuid;
    const { timeZone, monthlyTimeSlots, duration, beforeBufferTime, afterBufferTime } = this.props;
    const timeSlots = getMonthlyTimeSlots(monthlyTimeSlots, this.state.currentMonth, timeZone);

    const getTimeSlots = (timeSlots, date, timeZone) => {
      return timeSlots && timeSlots[0]
        ? timeSlots.filter(t =>
            isInRange(date, t.attributes.start, t.attributes.end, 'day', timeZone)
          )
        : [];
    };
    if (this.state.startDate !== prevState.startDate) {
      // console.log(555900, getTimeSlots(timeSlots, this.state.startDate?.date, timeZone));
      this.setState({ timeSlots: getTimeSlots(timeSlots, this.state.startDate?.date, timeZone) });
    }

    let allAvailableTime = [];
    let allAvailableTime2 = [];

    // console.log(timeSlots);

    this.state.timeSlots.map(m => {
      let start = moment();
      // console.log(start);
      if (
        Number(
          moment(m.attributes.start)
            .clone()
            .format('mm')
        ) % 5
      ) {
        const min = moment(m.attributes.start)
          .clone()
          .format('mm');
        const minToAdd = 5 * (parseInt(min / 5) + 1);

        start = moment(m.attributes.start)
          .clone()
          .startOf('hour')
          .add(minToAdd, 'm');

        // console.log(
        //   min,
        //   minToAdd,
        //   parseInt(min / 5) + 1,
        //   moment(m.attributes.start)
        //     .clone()
        //     .startOf('hour')
        //     .add(minToAdd, 'm')
        //     .toDate()
        // );
      } else {
        start = moment(m.attributes.start).clone();
      }
      const end = moment(m.attributes.end).clone();
      while (
        start
          .clone()
          // .add(5, 'm')
          .isSameOrBefore(moment(end))
      ) {
        // console.log(
        //   start
        //     .clone()
        //     .add(5, 'm')
        //     .isSameOrBefore(moment(end)),
        //   start
        //     .clone()
        //     .add(5, 'm')
        //     .toDate(),
        //   moment(end).toDate()
        // );
        // let allAvailableTime = [];
        allAvailableTime.push(start.format());
        allAvailableTime2.push(start.format('HH:mm'));

        start.add(5, 'm');
      }
    });
    // console.log(6967, allAvailableTime);

    if (providerId && prevState.startDate !== this.state.startDate) {
      axios
        .post(`${apiBaseUrl()}/api/booking/getProviderBooking`, {
          providerId: providerId,
          start: moment(resetToStartOfDay(this.state.startDate.date, timeZone))
            .clone()
            .startOf('day')
            .toDate(),
          end: moment(resetToStartOfDay(this.state.startDate.date, timeZone))
            .clone()
            .endOf('day')
            .toDate(),
        })
        .then(result => {
          // console.log(5556, result);
          let bk = [];
          // console.log(beforeBufferTime, afterBufferTime);
          result?.data?.map((r, i) => {
            if (beforeBufferTime > 0 || afterBufferTime > 0) {
              if (moment(r.start).isSame(moment(allAvailableTime[0]))) {
                bk.push({
                  start: moment(r.start).toDate(),
                  end: moment(r.end)
                    .clone()
                    .add(afterBufferTime, 'm')
                    .toDate(),
                });
              } else if (
                moment(r.end).isSame(moment(allAvailableTime[allAvailableTime.length - 1]))
              ) {
                bk.push({
                  start: moment(r.start)
                    .clone()
                    .add(beforeBufferTime, 'm')
                    .toDate(),
                  end: moment(r.end).toDate(),
                });
              } else {
                bk.push({
                  start: moment(r.start)
                    .clone()
                    .add(beforeBufferTime, 'm')
                    .toDate(),
                  end: moment(r.end)
                    .clone()
                    .add(afterBufferTime, 'm')
                    .toDate(),
                });
              }
            } else {
              bk.push({ start: moment(r.start).toDate(), end: moment(r.end).toDate() });
            }
          });
          this.setState({ bookedSlot: bk });
        });
    }
    // console.log(this.state.bookedSlot);
    let allBookedSlot = [];
    let allBookedSlot2 = [];
    this.state.bookedSlot.map((b, i) => {
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
          allBookedSlot2.push(
            start
              .clone()
              .add(1, 'm')
              .format('HH:mm')
          );
        } else {
          allBookedSlot.push(start.format());
          allBookedSlot2.push(start.format('HH:mm'));
        }
        start.add(5, 'm');
        count += 1;
      }
    });

    let availableTimeSlots = allAvailableTime.filter(f => !allBookedSlot.includes(f));

    // console.log(allAvailableTime, allBookedSlot);

    const allStartHour = [];
    availableTimeSlots.map(m => {
      const start = moment(m).clone();
      const min = duration && duration.split('.')[1];
      const hour = duration && duration.split('.')[0];

      const totalMin = hour * 60 + min * 1;

      if (
        availableTimeSlots.includes(
          start
            .clone()
            .add(hour, 'h')
            .add(min, 'm')
            .format()
        ) &&
        availableTimeSlots.indexOf(
          start
            .clone()
            .add(hour, 'h')
            .add(min, 'm')
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

    if (this.state.allStart.length !== allStartHour.length) {
      this.setState({ allStart: allStartHour });
    }
    // console.log(allStartHour, availableTimeSlots, timeSlots);
    // console.log(5556, this.state, availableTimeSlots, this.state.allStart, allStartHour);
  }

  onMonthClick(monthFn) {
    const { onMonthChanged, timeZone } = this.props;

    this.setState(
      prevState => ({ currentMonth: monthFn(prevState.currentMonth, timeZone) }),
      () => {
        // Callback function after month has been updated.
        // react-dates component has next and previous months ready (but inivisible).
        // we try to populate those invisible months before user advances there.
        this.fetchMonthData(monthFn(this.state.currentMonth, timeZone));

        // If previous fetch for month data failed, try again.
        const monthId = monthIdStringInTimeZone(this.state.currentMonth, timeZone);
        const currentMonthData = this.props.monthlyTimeSlots[monthId];
        if (currentMonthData && currentMonthData.fetchTimeSlotsError) {
          this.fetchMonthData(this.state.currentMonth, timeZone);
        }

        // Call onMonthChanged function if it has been passed in among props.
        if (onMonthChanged) {
          onMonthChanged(monthId);
        }
      }
    );
  }

  onBookingStartDateChange = value => {
    this.setState({ startDate: value });

    const { monthlyTimeSlots, timeZone, intl, form, duration } = this.props;
    if (!value || !value.date) {
      form.batch(() => {
        form.change('bookingStartTime', null);
        form.change('bookingEndDate', { date: null });
        form.change('bookingEndTime', null);
      });
      // Reset the currentMonth too if bookingStartDate is cleared
      this.setState({ currentMonth: getMonthStartInTimeZone(TODAY, timeZone) });

      return;
    }

    // This callback function (onBookingStartDateChange) is called from react-dates component.
    // It gets raw value as a param - browser's local time instead of time in listing's timezone.
    const startDate = timeOfDayFromLocalToTimeZone(value.date, timeZone);
    const timeSlots = getMonthlyTimeSlots(monthlyTimeSlots, this.state.currentMonth, timeZone);
    const timeSlotsOnSelectedDate = getTimeSlots(timeSlots, startDate, timeZone);
    const providerId = this.props?.listing?.author?.id.uuid;

    const { startTime, endDate, endTime } = getAllTimeValues(
      intl,
      timeZone,
      timeSlotsOnSelectedDate,
      startDate,
      null,
      null,
      duration,
      providerId
    );

    form.batch(() => {
      // form.change('bookingStartTime', startTime);
      form.change('bookingEndDate', { date: endDate });
      // form.change('bookingEndTime', endTime);
    });
  };

  onBookingStartTimeChange = value => {
    const { monthlyTimeSlots, timeZone, intl, form, values, duration } = this.props;
    const timeSlots = getMonthlyTimeSlots(monthlyTimeSlots, this.state.currentMonth, timeZone);
    const startDate = values.bookingStartDate.date;
    const timeSlotsOnSelectedDate = getTimeSlots(timeSlots, startDate, timeZone);
    const providerId = this.props?.listing?.author?.id.uuid;

    const { endDate, endTime } = getAllTimeValues(
      intl,
      timeZone,
      timeSlotsOnSelectedDate,
      startDate,
      value,
      null,
      duration,
      providerId
    );

    // console.log(696, endDate, moment(endTime).toDate(), endTime, moment(value).toDate(), value);

    form.batch(() => {
      form.change('bookingEndDate', { date: endDate });
      form.change('bookingEndTime', endTime);
      form.change('bookingStartTime', value);
    });
  };

  onBookingEndDateChange = value => {
    const { monthlyTimeSlots, timeZone, intl, form, values, duration } = this.props;
    if (!value || !value.date) {
      form.change('bookingEndTime', null);
      return;
    }

    // This callback function (onBookingStartDateChange) is called from react-dates component.
    // It gets raw value as a param - browser's local time instead of time in listing's timezone.
    const endDate = timeOfDayFromLocalToTimeZone(value.date, timeZone);

    const { bookingStartDate, bookingStartTime } = values;
    const startDate = bookingStartDate.date;
    const timeSlots = getMonthlyTimeSlots(monthlyTimeSlots, this.state.currentMonth, timeZone);
    const timeSlotsOnSelectedDate = getTimeSlots(timeSlots, startDate, timeZone);

    const { endTime } = getAllTimeValues(
      intl,
      timeZone,
      timeSlotsOnSelectedDate,
      startDate,
      bookingStartTime,
      endDate,
      duration
    );
    form.change('bookingEndTime', endTime);
  };

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
      rootClassName,
      className,
      formId,
      startDateInputProps,
      endDateInputProps,
      values,
      monthlyTimeSlots,
      timeZone,
      intl,
      duration,
      listing,
    } = this.props;

    const classes = classNames(rootClassName || css.root, className);
    const providerId = listing?.author?.id.uuid;

    const bookingStartDate =
      values.bookingStartDate && values.bookingStartDate.date ? values.bookingStartDate.date : null;
    const bookingStartTime = values.bookingStartTime ? values.bookingStartTime : null;
    const bookingEndDate =
      values.bookingEndDate && values.bookingEndDate.date ? values.bookingEndDate.date : null;

    const startTimeDisabled = !bookingStartDate;
    const endDateDisabled = !bookingStartDate || !bookingStartTime;
    const endTimeDisabled = !bookingStartDate || !bookingStartTime || !bookingEndDate;

    const timeSlotsOnSelectedMonth = getMonthlyTimeSlots(
      monthlyTimeSlots,
      this.state.currentMonth,
      timeZone
    );
    const timeSlotsOnSelectedDate = getTimeSlots(
      timeSlotsOnSelectedMonth,
      bookingStartDate,
      timeZone
    );

    const availableStartTimes = getAvailableStartTimes(
      intl,
      timeZone,
      bookingStartDate,
      timeSlotsOnSelectedDate,
      duration,
      providerId
    );

    // console.log(availableStartTimes);
    const firstAvailableStartTime =
      availableStartTimes.length > 0 && availableStartTimes[0] && availableStartTimes[0].timestamp
        ? availableStartTimes[0].timestamp
        : null;

    const { startTime, endDate, selectedTimeSlot } = getAllTimeValues(
      intl,
      timeZone,
      timeSlotsOnSelectedDate,
      bookingStartDate,
      bookingStartTime, //|| firstAvailableStartTime,
      bookingEndDate || bookingStartDate,
      duration
    );

    const availableEndTimes = getAvailableEndTimes(
      intl,
      timeZone,
      bookingStartTime || startTime,
      bookingEndDate || endDate,
      selectedTimeSlot,
      duration
    );

    const isDayBlocked = timeSlotsOnSelectedMonth
      ? day =>
          !timeSlotsOnSelectedMonth.find(timeSlot =>
            isDayMomentInsideRange(
              day,
              timeSlot.attributes.start,
              timeSlot.attributes.end,
              timeZone
            )
          )
      : () => false;

    const placeholderTime = localizeAndFormatTime(
      intl,
      timeZone,
      findNextBoundary(timeZone, TODAY)
    );

    const startTimeLabel = intl.formatMessage({ id: 'FieldDateTimeInput.startTime' });
    const endTimeLabel = intl.formatMessage({ id: 'FieldDateTimeInput.endTime' });
    /**
     * NOTE: In this template the field for the end date is hidden by default.
     * If you want to enable longer booking periods, showing the end date in the form requires some code changes:
     * 1. Move the bookingStartTime field to the same formRow with the bookingStartDate field
     * 2. Remove the div containing the line between dates
     * 3. Remove the css related to hiding the booking end date from the bottom of the FieldDateAndTimeInput.css field
     */

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
    const hour = Array(96).fill();
    const ALL_START_HOURS = hour.map((v, i) => printTimeStrings(i * 15));
    // console.log(availableStartTimes);

    return (
      <div className={classes}>
        <div className={css.formRow}>
          <div className={classNames(css.field, css.startDate)}>
            <FieldDateInput
              className={`${css.fieldDateInput} stdtupmob`}
              name="bookingStartDate"
              id={formId ? `${formId}.bookingStartDate` : 'bookingStartDate'}
              label={startDateInputProps.label}
              placeholderText={startDateInputProps.placeholderText}
              format={v =>
                v && v.date ? { date: timeOfDayFromTimeZoneToLocal(v.date, timeZone) } : v
              }
              parse={v =>
                v && v.date ? { date: timeOfDayFromLocalToTimeZone(v.date, timeZone) } : v
              }
              isDayBlocked={isDayBlocked}
              onChange={this.onBookingStartDateChange}
              onPrevMonthClick={() => this.onMonthClick(prevMonthFn)}
              onNextMonthClick={() => this.onMonthClick(nextMonthFn)}
              onClose={e => {
                this.onMonthClose(e.date || moment());
              }}
              navNext={<Next currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              navPrev={<Prev currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              useMobileMargins
              showErrorMessage={false}
              validate={bookingDateRequired('Required')}
              // onClose={() =>
              //   this.setState({ currentMonth: getMonthStartInTimeZone(TODAY, this.props.timeZone) })
              // }
            />
          </div>
        </div>
        <div className={css.formRow}>
          <div className={classNames(css.field, css.endDateHidden)}>
            <FieldDateInput
              {...endDateInputProps}
              name="bookingEndDate"
              id={formId ? `${formId}.bookingEndDate` : 'bookingEndDate'}
              className={css.fieldDateInput}
              label={endDateInputProps.label}
              placeholderText={endDateInputProps.placeholderText}
              format={v =>
                v && v.date ? { date: timeOfDayFromTimeZoneToLocal(v.date, timeZone) } : v
              }
              parse={v =>
                v && v.date ? { date: timeOfDayFromLocalToTimeZone(v.date, timeZone) } : v
              }
              isDayBlocked={isDayBlocked}
              onChange={this.onBookingEndDateChange}
              onPrevMonthClick={() => this.onMonthClick(prevMonthFn)}
              onNextMonthClick={() => this.onMonthClick(nextMonthFn)}
              navNext={<Next currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              navPrev={<Prev currentMonth={this.state.currentMonth} timeZone={timeZone} />}
              isOutsideRange={day =>
                this.isOutsideRange(day, bookingStartDate, selectedTimeSlot, timeZone)
              }
              useMobileMargins
              showErrorMessage={false}
              validate={bookingDateRequired('Required')}
              disabled={endDateDisabled}
              showLabelAsDisabled={endDateDisabled}
            />
          </div>
          {/* {this.state.allStart.length > 10 ? (
            <select>
              {this.state.allStart.length > 10 ? (
                this.state.allStart.map(p => (
                  <option key={p.timeOfDay} value={p.timestamp}>
                    {p.timeOfDay}
                  </option>
                ))
              ) : (
                <option>{placeholderTime}</option>
              )}
            </select>
          ) : (
            ''
          )} */}
          <div className={`${css.field} ${css.bookinghhmm}`}>
            <select
              name="bookingStartTime"
              id={formId ? `${formId}.bookingStartTime` : 'bookingStartTime'}
              className={bookingStartDate ? css.fieldSelect : css.fieldSelectDisabled}
              selectclassname={bookingStartDate ? css.select : css.selectDisabled}
              label={startTimeLabel}
              disabled={startTimeDisabled}
              onChange={e => {
                // console.log(6967, e.target.value);
                this.onBookingStartTimeChange(e.target.value);
              }}
            >
              <option>{'HH:MM'}</option>

              {bookingStartDate ? (
                this.state.allStart.map(p => (
                  <option key={p.timestamp} value={p.timestamp}>
                    {p.timeOfDay}
                  </option>
                ))
              ) : (
                <option>{placeholderTime}</option>
              )}
              {/* {ALL_START_HOURS.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))} */}
            </select>
          </div>
          {/* <div className={bookingStartDate ? css.lineBetween : css.lineBetweenDisabled}>-</div> */}
        </div>
      </div>
    );
  }
}

FieldDateAndTimeInput.defaultProps = {
  rootClassName: null,
  className: null,
  startDateInputProps: null,
  endDateInputProps: null,
  startTimeInputProps: null,
  endTimeInputProps: null,
  listingId: null,
  monthlyTimeSlots: null,
  timeZone: null,
};

FieldDateAndTimeInput.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,
  bookingStartLabel: string,
  startDateInputProps: object,
  endDateInputProps: object,
  startTimeInputProps: object,
  endTimeInputProps: object,
  form: object.isRequired,
  values: object.isRequired,
  listingId: propTypes.uuid,
  monthlyTimeSlots: object,
  onFetchTimeSlots: func.isRequired,
  timeZone: string,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default FieldDateAndTimeInput;
