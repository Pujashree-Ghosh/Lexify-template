import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { findOptionsForSelectFilter } from '../../util/search';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingDescriptionForm } from '../../forms';
import config from '../../config';

import css from './EditListingDescriptionPanel.module.css';

const EditListingDescriptionPanel = props => {
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
  const { description, title, publicData } = currentListing.attributes;

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle =
    category === 'publicOral' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingDescriptionPanel.title"
          values={{
            listingTitle: (
              <ListingLink listing={listing}>
                <FormattedMessage id="EditListingDescriptionPanel.publicOralTitle" />
              </ListingLink>
            ),
          }}
        />
      ) : (
        <FormattedMessage id="EditListingDescriptionPanel.publicOralTitle" />
      )
    ) : category === 'customOral' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingDescriptionPanel.title"
          values={{
            listingTitle: (
              <ListingLink listing={listing}>
                <FormattedMessage id="EditListingDescriptionPanel.customOralTitle" />
              </ListingLink>
            ),
          }}
        />
      ) : (
        <FormattedMessage id="EditListingDescriptionPanel.customOralTitle" />
      )
    ) : category === 'customService' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingDescriptionPanel.title"
          values={{
            listingTitle: (
              <ListingLink listing={listing}>
                <FormattedMessage id="EditListingDescriptionPanel.customServiceTitle" />
              </ListingLink>
            ),
          }}
        />
      ) : (
        <FormattedMessage id="EditListingDescriptionPanel.customServiceTitle" />
      )
    ) : (
      ''
    );
  // console.log(panelTitle);
  // isPublished ? (
  //   <FormattedMessage
  //     id="EditListingDescriptionPanel.title"
  //     values={{
  //       listingTitle: (
  //         <ListingLink listing={listing}>
  //           <FormattedMessage id="EditListingDescriptionPanel.listingTitle" />
  //         </ListingLink>
  //       ),
  //     }}
  //   />
  // ) : (
  //   <FormattedMessage id="EditListingDescriptionPanel.createListingTitle" />
  // );

  const certificateOptions = findOptionsForSelectFilter('certificate', config.custom.filters);
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDescriptionForm
        className={css.form}
        initialValues={{ title, description, disclaimer: publicData.disclaimer }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { title, description, disclaimer } = values;
          const updateValues = {
            title: title.trim(),
            description,
            publicData: { disclaimer, category },
          };

          onSubmit(updateValues);
        }}
        onChange={onChange}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
        certificateOptions={certificateOptions}
        category={category}
      />
    </div>
  );
};

EditListingDescriptionPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingDescriptionPanel.propTypes = {
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

export default EditListingDescriptionPanel;
