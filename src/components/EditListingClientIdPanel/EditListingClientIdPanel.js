import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';

import { LISTING_STATE_DRAFT } from '../../util/types';
import { ensureListing } from '../../util/data';
import { EditListingClientIdForm } from '../../forms';
import { ListingLink } from '../../components';
import { useSelector } from 'react-redux';
import moment from 'moment';
import css from './EditListingClientIdPanel.module.css';

const EditListingClientIdPanel = props => {
  const {
    rootClassName,
    className,
    listing,
    disabled,
    ready,
    onSubmit,
    onChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  //

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const duration =
    currentListing?.attributes?.publicData?.durationHour &&
    currentListing?.attributes?.publicData?.durationMinute
      ? parseInt(currentListing?.attributes?.publicData?.durationHour * 60) +
        parseInt(currentListing?.attributes?.publicData?.durationMinute)
      : null;
  const { publicData } = currentListing.attributes;
  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingClientIdPanel.title"
      values={{
        listingTitle: (
          <ListingLink listing={listing}>
            <FormattedMessage id="EditListingClientIdPanel.listingTitle" />
          </ListingLink>
        ),
      }}
    />
  ) : (
    <FormattedMessage id="EditListingClientIdPanel.listingTitle" />
  );

  const type = publicData && publicData.type ? publicData.type : 'solicited';
  const clientId = publicData && publicData?.clientId?.length > 0 ? publicData.clientId : [''];
  const startDate =
    publicData && publicData.startDate ? { date: moment(publicData.startDate).toDate() } : '';
  const endDate =
    publicData && publicData.endDate ? { date: moment(publicData.endDate).toDate() } : '';
  const startHour = publicData && publicData.startHour ? publicData.startHour : '';
  const endHour = publicData && publicData.endHour ? publicData.endHour : '';
  const globalAvailabilityPlan = useSelector(
    state => state?.user?.currentUser?.attributes?.profile?.protectedData?.availabilityPlan
  );
  const availabilityPlan = currentListing?.attributes?.availabilityPlan;

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingClientIdForm
        className={css.form}
        initialValues={{ clientId, type, startDate, endDate, startHour, endHour }}
        onSubmit={values => {
          const { clientId, type, startDate, endDate, startHour, endHour } = values;
          const updatedValues = {
            publicData: {
              clientId,
              type,
              startDate: moment(startDate.date).format(),
              endDate: moment(endDate.date).format(),
              startHour,
              endHour,
              alreadyBooked: [],
            },
            availabilityPlan:
              type !== 'unsolicited'
                ? globalAvailabilityPlan
                : {
                    entries: [],
                    timezone: availabilityPlan.timezone,
                    type: availabilityPlan.type,
                  },
          };
          onSubmit(updatedValues);
        }}
        onChange={onChange}
        saveActionMsg={submitButtonText}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
        currentListing={currentListing}
        duration={duration}
      />
    </div>
  );
};

EditListingClientIdPanel.defaultProps = {
  rootClassName: null,
  className: null,
  listing: null,
};

const { bool, func, object, string } = PropTypes;

EditListingClientIdPanel.propTypes = {
  rootClassName: string,
  className: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingClientIdPanel;
