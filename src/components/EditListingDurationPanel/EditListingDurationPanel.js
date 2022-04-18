import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';

import { LISTING_STATE_DRAFT } from '../../util/types';
import { ensureListing } from '../../util/data';
import { EditListingDurationForm } from '../../forms';
import { ListingLink } from '../../components';

import css from './EditListingDurationPanel.module.css';

const EditListingDurationPanel = props => {
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
    category,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const { publicData } = currentListing.attributes;
  //   const { duration, durationUnit } = publicData;

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle =
    category === 'customOral' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingDurationPanel.customOralTitleEdit"
          values={{
            listingTitle: (
              <ListingLink listing={listing}>
                {/* <FormattedMessage id="EditListingDurationPanel.listingTitle" /> */}
                {listing?.title}
              </ListingLink>
            ),
          }}
        />
      ) : (
        <FormattedMessage
          id="EditListingDurationPanel.publicOralTitle"
          values={{
            listingTitle: (
              <ListingLink listing={listing}>
                {/* <FormattedMessage id="EditListingDurationPanel.listingTitle" /> */}
                {listing?.title}
              </ListingLink>
            ),
          }}
        />
      )
    ) : isPublished ? (
      <FormattedMessage
        id="EditListingDurationPanel.publicOralTitleEdit"
        values={{
          listingTitle: (
            <ListingLink listing={listing}>
              {/* <FormattedMessage id="EditListingDurationPanel.listingTitle" /> */}
              {listing?.title}
            </ListingLink>
          ),
        }}
      />
    ) : (
      <FormattedMessage
        id="EditListingDurationPanel.publicOralTitle"
        values={{
          listingTitle: (
            <ListingLink listing={listing}>
              {/* <FormattedMessage id="EditListingDurationPanel.listingTitle" /> */}
              {listing?.title}
            </ListingLink>
          ),
        }}
      />
    );

  const durationHour = publicData && publicData.durationHour;
  const durationMinute = publicData && publicData.durationMinute;

  //   const initialValues = areaOfLaw ? areaOfLaw : [{}];

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDurationForm
        className={css.form}
        initialValues={{ durationHour, durationMinute }}
        onSubmit={values => {
          const { durationHour, durationMinute } = values;
          const updatedValues = {
            publicData: { durationHour, durationMinute },
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
      />
    </div>
  );
};

EditListingDurationPanel.defaultProps = {
  rootClassName: null,
  className: null,
  listing: null,
};

const { bool, func, object, string } = PropTypes;

EditListingDurationPanel.propTypes = {
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

export default EditListingDurationPanel;
