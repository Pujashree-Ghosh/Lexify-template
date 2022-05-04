import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';

import { LISTING_STATE_DRAFT } from '../../util/types';
import { ensureListing } from '../../util/data';
import { EditListingClientIdForm, EditListingDeadlineForm } from '../../forms';
import { ListingLink } from '../../components';

import css from './EditListingDeadlinePanel.module.css';
import moment from 'moment';

const EditListingDeadlinePanel = props => {
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

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingDeadlinePanel.customServiceTitleEdit"
      values={{
        listingTitle: (
          <ListingLink listing={listing}>
            {/* <FormattedMessage id="EditListingDeadlinePanel.listingTitle" /> */}
            {listing?.title}
          </ListingLink>
        ),
      }}
    />
  ) : (
    // <FormattedMessage id="EditListingDeadlinePanel.customServiceTitle" />
    <FormattedMessage
      id="EditListingDeadlinePanel.customServiceTitle"
      values={{
        listingTitle: <div className={css.listingTitle}>{listing.attributes.title}</div>,
      }}
    />
  );

  const Deadline =
    publicData && publicData.Deadline ? { date: moment(publicData.Deadline).toDate() } : {};
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDeadlineForm
        className={css.form}
        initialValues={{ Deadline }}
        onSubmit={values => {
          const { Deadline } = values;
          const updatedValues = {
            publicData: { Deadline: moment(Deadline.date).format() },
          };
          onSubmit(updatedValues);
        }}
        currentListing={currentListing}
        onChange={onChange}
        category={category}
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

EditListingDeadlinePanel.defaultProps = {
  rootClassName: null,
  className: null,
  listing: null,
};

const { bool, func, object, string } = PropTypes;

EditListingDeadlinePanel.propTypes = {
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

export default EditListingDeadlinePanel;
