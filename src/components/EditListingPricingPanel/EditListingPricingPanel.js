import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingPricingForm } from '../../forms';
import { ensureOwnListing } from '../../util/data';
import { types as sdkTypes } from '../../util/sdkLoader';
import config from '../../config';

import css from './EditListingPricingPanel.module.css';

const { Money } = sdkTypes;

const EditListingPricingPanel = props => {
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
  const { price } = currentListing.attributes;
  const vatData = publicData.vatData ? currentListing?.attributes?.publicData?.vatData : [{}];
  const vattype = currentListing?.attributes?.publicData?.vattype;

  const durationHour = publicData && publicData.durationHour;
  const durationMinute = publicData && publicData.durationMinute;

  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle =
    category === 'publicOral' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingPricePanel.publicOralTitleEdit"
          values={{
            listingTitle: <ListingLink listing={listing}>{listing?.title}</ListingLink>,
          }}
        />
      ) : (
        // <FormattedMessage id="EditListingPricePanel.publicOralTitle" />
        <FormattedMessage
          id="EditListingPricePanel.publicOralTitle"
          values={{
            listingTitle: <div className={css.listingTitle}>{listing.attributes.title}</div>,
          }}
        />
      )
    ) : category === 'customOral' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingPricePanel.customOralTitleEdit"
          values={{
            listingTitle: <ListingLink listing={listing}>{listing?.title}</ListingLink>,
          }}
        />
      ) : (
        // <FormattedMessage id="EditListingPricePanel.customOralTitle" />
        <FormattedMessage
          id="EditListingPricePanel.customOralTitle"
          values={{
            listingTitle: <div className={css.listingTitle}>{listing.attributes.title}</div>,
          }}
        />
      )
    ) : category === 'customService' ? (
      isPublished ? (
        <FormattedMessage
          id="EditListingPricePanel.customServiceTitleEdit"
          values={{
            listingTitle: (
              <ListingLink listing={listing}>
                {/* <FormattedMessage id="EditListingDescriptionPanel.customServiceTitle" /> */}
                {listing.title}
              </ListingLink>
            ),
          }}
        />
      ) : (
        // <FormattedMessage id="EditListingPricePanel.customServiceTitle" />
        <FormattedMessage
          id="EditListingPricePanel.customServiceTitle"
          values={{
            listingTitle: <div className={css.listingTitle}>{listing.attributes.title}</div>,
          }}
        />
      )
    ) : (
      ''
    );
  // const panelTitle = isPublished ? (
  //   (category === 'publicOral'|| category === 'customOral')
  //     ?<FormattedMessage
  //         id="EditListingDuraionPricingPanel.title"
  //         values={{
  //           listingTitle: (
  //             <ListingLink listing={listing}>
  //               <FormattedMessage id="EditListingPricingPanel.listingTitle" />
  //             </ListingLink>
  //           ),
  //         }}
  //       />
  //     :<FormattedMessage
  //       id="EditListingPricingPanel.title"
  //       values={{
  //         listingTitle: (
  //           <ListingLink listing={listing}>
  //             <FormattedMessage id="EditListingPricingPanel.listingTitle" />
  //           </ListingLink>
  //         ),
  //       }}
  //     />
  // ) : (
  //   <FormattedMessage id="EditListingPricingPanel.createListingTitle" />
  // );

  const priceCurrencyValid = price instanceof Money ? price.currency === config.currency : true;
  const form = priceCurrencyValid ? (
    <EditListingPricingForm
      className={css.form}
      initialValues={{ price, vatData, durationHour, durationMinute }}
      onSubmit={values => {
        const { price, vatData, durationHour, durationMinute } = values;
        const updatedValues = {
          publicData: { vatData, durationHour, durationMinute },
          price: price,
        };

        onSubmit(updatedValues);
      }}
      onChange={onChange}
      saveActionMsg={submitButtonText}
      category={category}
      disabled={disabled}
      ready={ready}
      updated={panelUpdated}
      updateInProgress={updateInProgress}
      fetchErrors={errors}
    />
  ) : (
    <div className={css.priceCurrencyInvalid}>
      <FormattedMessage id="EditListingPricingPanel.listingPriceCurrencyInvalid" />
    </div>
  );

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      {form}
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingPricingPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingPricingPanel.propTypes = {
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

export default EditListingPricingPanel;
