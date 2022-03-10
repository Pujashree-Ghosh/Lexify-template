import React, { useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { arrayOf, bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { getDefaultTimeZoneOnBrowser, timestampToDate } from '../../util/dates';
import { LISTING_STATE_DRAFT, DATE_TYPE_DATETIME, propTypes } from '../../util/types';
import {
  Button,
  IconClose,
  IconEdit,
  IconSpinner,
  InlineTextButton,
  ListingLink,
  Modal,
  TimeRange,
} from '../../components';
import AvailabiltyModalForm from '../AvailabilityModalForm/AvailabilityModalForm';
import { EditListingAvailabilityPlanForm, EditListingAvailabilityExceptionForm } from '../../forms';
import { FaRegEdit } from 'react-icons/fa';
import moment from 'moment';
import css from './EditListingAvailabilityPanel.module.css';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
// import structuredClone from '@ungap/structured-clone';
import { apiBaseUrl } from '../../util/api';
import { data } from 'sharetribe-flex-integration-sdk';

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];

// We want to sort exceptions on the client-side, maximum pagination page size is 100,
// so we need to restrict the amount of exceptions to that.
const MAX_EXCEPTIONS_COUNT = 100;

const defaultTimeZone = () =>
  typeof window !== 'undefined' ? getDefaultTimeZoneOnBrowser() : 'Etc/UTC';

/////////////
// Weekday //
/////////////
const findEntry = (availabilityPlan, dayOfWeek) =>
  availabilityPlan.entries.find(d => d.dayOfWeek === dayOfWeek);

const getEntries = (availabilityPlan, dayOfWeek) =>
  availabilityPlan.entries.filter(d => d.dayOfWeek === dayOfWeek);

const Weekday = props => {
  const { availabilityPlan, dayOfWeek, openEditModal } = props;
  const hasEntry = findEntry(availabilityPlan, dayOfWeek);

  return (
    <div
      className={classNames(css.weekDay, { [css.blockedWeekDay]: !hasEntry })}
      onClick={() => openEditModal(true)}
      role="button"
    >
      <div className={css.dayOfWeek}>
        <FormattedMessage id={`EditListingAvailabilityPanel.dayOfWeek.${dayOfWeek}`} />
      </div>
      <div className={css.entries}>
        {availabilityPlan && hasEntry
          ? getEntries(availabilityPlan, dayOfWeek).map(e => {
              return (
                <span className={css.entry} key={`${e.dayOfWeek}${e.startTime}`}>{`${
                  e.startTime
                } - ${e.endTime === '00:00' ? '24:00' : e.endTime}`}</span>
              );
            })
          : null}
      </div>
    </div>
  );
};

///////////////////////////////////////////////////
// EditListingAvailabilityExceptionPanel - utils //
///////////////////////////////////////////////////

// Create initial entry mapping for form's initial values
const createEntryDayGroups = (entries = {}) =>
  entries.reduce((groupedEntries, entry) => {
    const { startTime, endTime: endHour, dayOfWeek } = entry;
    const dayGroup = groupedEntries[dayOfWeek] || [];
    return {
      ...groupedEntries,
      [dayOfWeek]: [
        ...dayGroup,
        {
          startTime,
          endTime: endHour === '00:00' ? '24:00' : endHour,
        },
      ],
    };
  }, {});

// Create initial values
const createInitialValues = availabilityPlan => {
  const { timezone, entries } = availabilityPlan || {};
  const tz = timezone || defaultTimeZone();
  return {
    timezone: tz,
    ...createEntryDayGroups(entries),
  };
};

// Create entries from submit values
const createEntriesFromSubmitValues = values =>
  WEEKDAYS.reduce((allEntries, dayOfWeek) => {
    const dayValues = values[dayOfWeek] || [];
    const dayEntries = dayValues.map(dayValue => {
      const { startTime, endTime } = dayValue;
      // Note: This template doesn't support seats yet.
      return startTime && endTime
        ? {
            dayOfWeek,
            seats: 1,
            startTime,
            endTime: endTime === '24:00' ? '00:00' : endTime,
          }
        : null;
    });

    return allEntries.concat(dayEntries.filter(e => !!e));
  }, []);

// Create availabilityPlan from submit values
const createAvailabilityPlan = values => ({
  availabilityPlan: {
    type: 'availability-plan/time',
    timezone: values.timezone,
    entries: createEntriesFromSubmitValues(values),
  },
});

// Ensure that the AvailabilityExceptions are in sensible order.
//
// Note: if you allow fetching more than 100 exception,
// pagination kicks in and that makes client-side sorting impossible.
const sortExceptionsByStartTime = (a, b) => {
  return a.attributes.start.getTime() - b.attributes.start.getTime();
};

//////////////////////
// AvailabilityForm //
//////////////////////
const AvailabilityForm = props => {
  const {
    className,
    rootClassName,
    listing,
    availabilityExceptions,
    fetchExceptionsInProgress,
    onAddAvailabilityException,
    onDeleteAvailabilityException,
    disabled,
    ready,
    onSubmit,
    onManageDisableScrolling,
    onNextTab,
    submitButtonText,
    updateInProgress,
    errors,
  } = props;
  const currentUser = useSelector(state => state.user.currentUser);
  const currentUserListing = useSelector(state => state.user.currentUserListing);
  const durationUnit = listing?.attributes?.publicData?.durationUnit;
  const durationMinute = currentUserListing?.attributes?.publicData?.durationMinute;
  const durationHour = currentUserListing?.attributes?.publicData?.durationHour;
  const listingDuration = listing?.attributes?.publicData?.duration;
  // const duration = (durationUnit === 'hours' ? listingDuration * 60 : listingDuration) / 60;
  // const duration = ((Number(durationHour) * 60 + Number(durationMinute)) / 60).toFixed(2) + '' ;
  const duration = '0.15';
  const exceptionDuration =
    durationHour && durationMinute ? `${durationHour}.${durationMinute}` : '0.15';

  // console.log(durationUnit === 'hours' ? listingDuration * 60 : listingDuration);
  // Hooks
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isEditExceptionsModalOpen, setIsEditExceptionsModalOpen] = useState(false);
  const [valuesFromLastSubmit, setValuesFromLastSubmit] = useState(null);
  const [exceptionsFromApi, setExceptionsFromApi] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);
<<<<<<< Updated upstream
  const [isExceptionButtonDisabled, setIsExceptionButtonDisabled] = useState(true);
  const [exceptionsLoading, setExceptionsLoading] = useState(true);
  const [exceptionUpdateInProgress, setExceptionUpdateInProgress] = useState(false);
=======

>>>>>>> Stashed changes
  const exceptionHandler = () => {
    const currMoment = new Date(moment()).toISOString();
    // const currMomNew = new Date(currMoment).toISOString();
    const newMoment = new Date(moment().add(2, 'months')).toISOString();
    // const newMomNew = new Date(newMoment).toISOString();
    axios
      .post(`${apiBaseUrl()}/api/fetchexception`, {
        authorId: currentUser.id.uuid,
        startDate: currMoment,
        endDate: newMoment,
      })
      .then(response => {
<<<<<<< Updated upstream
        setExceptionsLoading(false);
=======
>>>>>>> Stashed changes
        const data = response?.data?.data?.data;
        // if(data.length > exceptionsFromApi.length){data.map(i=>setExceptionsFromApi(old => {[...old,i]}))}
        if (JSON.stringify(data) !== JSON.stringify(exceptionsFromApi)) {
          setExceptionsFromApi(data);
        }
      })
      .catch();
  };
  //loading exceptions
  // useEffect(() => {
  //   exceptionHandler()

  // });
<<<<<<< Updated upstream
=======
  console.log('444', exceptionsFromApi);
>>>>>>> Stashed changes
  useEffect(() => {
    exceptionHandler();
  }, []);

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const isNextButtonDisabled = !currentListing.attributes.availabilityPlan;
  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const defaultAvailabilityPlan = {
    type: 'availability-plan/time',
    timezone: defaultTimeZone(),
    entries: [
      // { dayOfWeek: 'mon', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'tue', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'wed', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'thu', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'fri', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'sat', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'sun', startTime: '09:00', endTime: '17:00', seats: 1 },
    ],
  };
  const availabilityPlan =
    currentUser?.attributes?.profile?.protectedData?.availabilityPlan || defaultAvailabilityPlan;
  const initialValues = valuesFromLastSubmit
    ? valuesFromLastSubmit
    : createInitialValues(availabilityPlan);
  const handleSubmit = values => {
    setValuesFromLastSubmit(values);

    // Final Form can wait for Promises to return.
    return onSubmit(createAvailabilityPlan(values))
      ?.then(() => {
        setIsEditPlanModalOpen(false);
      })
      .catch(e => {
        // Don't close modal if there was an error
        console.log('failed');
      });
  };
  const exceptionCount = exceptionsFromApi ? exceptionsFromApi.length : 100;
  const sortedAvailabilityExceptions = availabilityExceptions.sort(sortExceptionsByStartTime);

  // Save exception click handler
  const saveException = values => {
    const { availability, exceptionStartTime, exceptionEndTime } = values;
<<<<<<< Updated upstream
    setExceptionUpdateInProgress(true);
=======
    console.log('est', timestampToDate(exceptionStartTime).toISOString());
>>>>>>> Stashed changes
    // TODO: add proper seat handling
    const seats = availability === 'available' ? 1 : 0;

    return axios
      .post(`${apiBaseUrl()}/api/createException`, {
        authorId: currentUser?.id?.uuid,
        seats,
        startDate: timestampToDate(exceptionStartTime).toISOString(),
        endDate: timestampToDate(exceptionEndTime).toISOString(),
      })
      .then(() => {
        exceptionHandler();
<<<<<<< Updated upstream
        setExceptionUpdateInProgress(false);
=======
>>>>>>> Stashed changes
        setIsEditExceptionsModalOpen(false);
      })
      .catch(e => {
        // Don't close modal if there was an error
      });
  };

  return (
    <main className={classes}>
      <h1 className={css.title}>
        {isPublished ? (
          <FormattedMessage
            id="EditListingAvailabilityPanel.title"
            values={{
              listingTitle: (
                <ListingLink listing={listing}>
                  <FormattedMessage id="EditListingAvailabilityPanel.listingTitle" />
                </ListingLink>
              ),
            }}
          />
        ) : (
          <FormattedMessage id="EditListingAvailabilityPanel.createListingTitle" />
        )}
      </h1>

      <section className={css.section}>
        <header className={css.sectionHeader}>
          <div className={css.headSec}>
            <div className={css.subTitle}>
              <FormattedMessage id="EditListingAvailabilityPanel.subTitle" />
            </div>
            <div className={css.editPlan}>
              <InlineTextButton
                className={css.editPlanButton}
                onClick={() => setIsEditPlanModalOpen(true)}
              >
                {/* <IconEdit className={css.editPlanIcon} />{' '}
              <FormattedMessage id="EditListingAvailabilityPanel.edit" /> */}
                <FaRegEdit />
                <FormattedMessage id="EditListingAvailabilityPanel.defaultScheduleTitle" />
              </InlineTextButton>
            </div>
          </div>
        </header>
        <div className={css.week}>
          {WEEKDAYS.map(w => (
            <Weekday
              dayOfWeek={w}
              key={w}
              availabilityPlan={availabilityPlan}
              openEditModal={setIsEditPlanModalOpen}
            />
          ))}
        </div>
      </section>
      <section className={css.section}>
        <header className={css.sectionHeader}>
          <h2 className={css.sectionTitle}>
            {exceptionsLoading ? (
              <FormattedMessage id="EditListingAvailabilityPanel.availabilityExceptionsTitleNoCount" />
            ) : (
              <FormattedMessage
                id="EditListingAvailabilityPanel.availabilityExceptionsTitle"
                values={{ count: exceptionCount }}
              />
            )}
          </h2>
        </header>
        {exceptionsLoading ? (
          <div className={css.exceptionsLoading}>
            <IconSpinner />
          </div>
        ) : exceptionCount === 0 ? (
          <div className={css.noExceptions}>
            <FormattedMessage id="EditListingAvailabilityPanel.noExceptions" />
          </div>
        ) : (
          <div className={css.exceptions}>
            {exceptionsFromApi.map(availabilityException => {
              const { start, end, seats } = availabilityException.attributes;
<<<<<<< Updated upstream
=======
              console.log('end', new Date(end));
>>>>>>> Stashed changes
              return (
                <div key={availabilityException.id.uuid} className={css.exception}>
                  <div className={css.exceptionHeader}>
                    <div className={css.exceptionAvailability}>
                      <div
                        className={classNames(css.exceptionAvailabilityDot, {
                          [css.isAvailable]: seats > 0,
                        })}
                      />
                      <div className={css.exceptionAvailabilityStatus}>
                        {seats > 0 ? (
                          <FormattedMessage id="EditListingAvailabilityPanel.exceptionAvailable" />
                        ) : (
                          <FormattedMessage id="EditListingAvailabilityPanel.exceptionNotAvailable" />
                        )}
                      </div>
                    </div>
                    <button
                      className={css.removeExceptionButton}
                      disabled={false}
                      onClick={() => {
<<<<<<< Updated upstream
                        setExceptionsLoading(true);
=======
>>>>>>> Stashed changes
                        axios
                          .delete(`${apiBaseUrl()}/api/deleteException`, {
                            data: {
                              authorId: currentUser.id.uuid,
                              startDate: start,
                              endDate: end,
                            },
                          })
<<<<<<< Updated upstream
                          .then(res => {
                            // if (res) {
                            //   console.log('in here');
                            //   exceptionHandler();
                            // }
                            // setIsExceptionButtonDisabled(true);

                            setTimeout(() => {
                              exceptionHandler();
                            }, 2000);
                          })

                          .catch(() => {});
=======
                          .then(() => {
                            setTimeout(() => {
                              exceptionHandler();
                              console.log('478', exceptionsFromApi);
                            }, 2000);

                            console.log('delete done');
                          })

                          .catch(() => {
                            console.log('delete failed');
                          });
>>>>>>> Stashed changes
                      }}
                    >
                      <IconClose size="normal" className={css.removeIcon} />
                    </button>
                  </div>
                  <TimeRange
                    className={css.timeRange}
                    startDate={new Date(start)}
                    endDate={new Date(end)}
                    dateType={DATE_TYPE_DATETIME}
                    timeZone={availabilityPlan.timezone}
                  />
                </div>
              );
            })}
          </div>
        )}
        {exceptionCount <= MAX_EXCEPTIONS_COUNT ? (
          <InlineTextButton
            className={css.addExceptionButton}
            onClick={() => setIsEditExceptionsModalOpen(true)}
            disabled={disabled}
            ready={ready}
          >
            <FormattedMessage id="EditListingAvailabilityPanel.addException" />
          </InlineTextButton>
        ) : null}
      </section>

      {errors?.showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingAvailabilityPanel.showListingFailed" />
        </p>
      ) : null}

      {/* {!isPublished ? (
        <Button
          className={css.goToNextTabButton}
          onClick={onNextTab}
          disabled={isNextButtonDisabled}
        >
          {submitButtonText}
        </Button>
      ) : null} */}
      {true ? (
        <Modal
          id="EditAvailabilityPlan"
          isOpen={isEditPlanModalOpen}
          onClose={() => setIsEditPlanModalOpen(false)}
          onManageDisableScrolling={() => {}}
          containerClassName={css.modalContainer}
          usePortal
        >
          <AvailabiltyModalForm
            formId="EditListingAvailabilityPlanForm"
            listingTitle={currentListing.attributes.title}
            availabilityPlan={availabilityPlan}
            weekdays={WEEKDAYS}
            onSubmit={handleSubmit}
            initialValues={initialValues}
            inProgress={updateInProgress}
            fetchErrors={errors}
            duration={duration}
          />
        </Modal>
      ) : null}
      {true ? (
        <Modal
          id="EditAvailabilityExceptions"
          isOpen={isEditExceptionsModalOpen}
          onClose={() => setIsEditExceptionsModalOpen(false)}
          onManageDisableScrolling={() => {}}
          containerClassName={css.modalContainer}
          usePortal
        >
          <EditListingAvailabilityExceptionForm
            formId="EditListingAvailabilityExceptionForm"
            onSubmit={saveException}
            timeZone={availabilityPlan.timezone}
            availabilityExceptions={sortedAvailabilityExceptions}
            updateInProgress={exceptionUpdateInProgress}
            fetchErrors={errors}
            duration={exceptionDuration}
          />
        </Modal>
      ) : null}
    </main>
  );
};
const mapStateToProps = state => {
  const { currentUser } = state.user;
  return { currentUser };
};
AvailabilityForm.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
  availabilityExceptions: [],
};

AvailabilityForm.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,
  //   disabled: bool.isRequired,
  //   ready: bool.isRequired,
  availabilityExceptions: arrayOf(propTypes.availabilityException),
  //   fetchExceptionsInProgress: bool.isRequired,
  //   onAddAvailabilityException: func.isRequired,
  //   onDeleteAvailabilityException: func.isRequired,
  onSubmit: func.isRequired,
  //   onManageDisableScrolling: func.isRequired,
  //   onNextTab: func.isRequired,
  //   submitButtonText: string.isRequired,
  //   updateInProgress: bool.isRequired,
  //   errors: object.isRequired,
};

export default AvailabilityForm;
