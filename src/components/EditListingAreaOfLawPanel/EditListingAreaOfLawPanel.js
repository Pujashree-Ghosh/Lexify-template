import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';

import { LISTING_STATE_DRAFT } from '../../util/types';
import { ensureListing } from '../../util/data';
import { EditListingAreaOfLawForm } from '../../forms';
import { ListingLink } from '../../components';

import css from './EditListingAreaOfLawPanel.module.css';
import IconSpinner from '../IconSpinner/IconSpinner';

const FEATURES_NAME = 'yogaStyles';

const EditListingAreaOfLawPanel = props => {
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

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const { publicData } = currentListing.attributes;

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingAreaOfLawPanel.publicOralTitleEdit"
      values={{
        listingTitle: (
          <ListingLink listing={listing}>
            {/* <FormattedMessage id="EditListingAreaOfLawPanel.listingTitle" /> */}
            {listing?.title}
          </ListingLink>
        ),
      }}
    />
  ) : (
    <FormattedMessage
      id="EditListingAreaOfLawPanel.publicOralTitle"
      values={{
        listingTitle: <div className={css.listingTitle}>{listing.attributes.title}</div>,
      }}
    />
  );

  const areaOfLaw = publicData && publicData.areaOfLaw;
  const initialValues = areaOfLaw ? areaOfLaw : [{}];

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      {updateInProgress ? (
        <IconSpinner />
      ) : (
        <EditListingAreaOfLawForm
          className={css.form}
          initialValues={{ areaOfLaw: initialValues }}
          onSubmit={values => {
            const { areaOfLaw } = values;
            const updatedValues = {
              publicData: { areaOfLaw },
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
      )}
    </div>
  );
};

EditListingAreaOfLawPanel.defaultProps = {
  rootClassName: null,
  className: null,
  listing: null,
};

const { bool, func, object, string } = PropTypes;

EditListingAreaOfLawPanel.propTypes = {
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

export default EditListingAreaOfLawPanel;
