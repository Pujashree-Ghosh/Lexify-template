import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { findOptionsForSelectFilter } from '../../util/search';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingExpiryForm } from '../../forms';
import config from '../../config';

import css from './EditListingExpiryPanel.module.css';
import moment from 'moment';
import IconSpinner from '../IconSpinner/IconSpinner';

const EditListingExpiryPanel = props => {
  const {
    className,
    rootClassName,
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
  const currentListing = ensureOwnListing(listing);
  const { publicData } = currentListing.attributes;

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle =
    category === 'customOral' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingExpiryPanel.customOralTitleEdit"
          values={{
            listingTitle: (
              <ListingLink listing={listing}>
                {/* <FormattedMessage id="EditListingExpiryPanel.title" /> */}
                {listing?.title}
              </ListingLink>
            ),
          }}
        />
      ) : (
        // <FormattedMessage id="EditListingExpiryPanel.customOralTitle" />
        <FormattedMessage
          id="EditListingExpiryPanel.customOralTitle"
          values={{
            listingTitle: <div className={css.listingTitle}>{listing.attributes.title}</div>,
          }}
        />
      )
    ) : isPublished ? (
      <FormattedMessage
        id="EditListingExpiryPanel.customServiceTitleEdit"
        values={{
          listingTitle: (
            <ListingLink listing={listing}>
              {/* <FormattedMessage id="EditListingExpiryPanel.title" /> */}
              {listing?.title}
            </ListingLink>
          ),
        }}
      />
    ) : (
      // <FormattedMessage id="EditListingExpiryPanel.customServiceTitle" />
      <FormattedMessage
        id="EditListingExpiryPanel.customServiceTitle"
        values={{
          listingTitle: <div className={css.listingTitle}>{listing.attributes.title}</div>,
        }}
      />
    );
  const expiry =
    publicData && publicData.expiry ? { date: moment(publicData.expiry).toDate() } : {};
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      {updateInProgress ? (
        <IconSpinner />
      ) : (
        <EditListingExpiryForm
          className={css.form}
          initialValues={{ expiry }}
          saveActionMsg={submitButtonText}
          onSubmit={values => {
            const { expiry } = values;
            const updateValues = {
              publicData: {
                expiry: moment(expiry.date)
                  .clone()
                  .endOf('day')
                  .valueOf(),
              },
            };

            onSubmit(updateValues);
          }}
          onChange={onChange}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
          category={category}
          listing={currentListing}
        />
      )}
    </div>
  );
};

EditListingExpiryPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingExpiryPanel.propTypes = {
  className: string,
  rootClassName: string,

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

export default EditListingExpiryPanel;
