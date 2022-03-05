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
import { ensureCurrentUser, ensureUser } from '../../util/data';
import { useSelector } from 'react-redux';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import unionWith from 'lodash/unionWith';
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

  const country = useSelector(state =>
    state?.user?.currentUser?.attributes?.profile?.publicData?.jurisdictionPractice.map(
      m => m.country
    )
  );
  const state = useSelector(state =>
    state?.user?.currentUser?.attributes?.profile?.publicData?.jurisdictionPractice.map(
      m => m.state
    )
  );
  const city = useSelector(state =>
    state?.user?.currentUser?.attributes?.profile?.publicData?.jurisdictionPractice.map(m => m.city)
  );
  // const languages = JSON.parse(useSelector(state => state?.user?.currentUser?.attributes?.profile?.publicData?.languages.map(m=>m.value)));
  const practiceArea = useSelector(state =>
    state?.user?.currentUser?.attributes?.profile?.publicData?.practice.map(m => m)
  );
  const industry = useSelector(state =>
    state?.user.currentUser?.attributes?.profile?.publicData.industry.map(m => m.industryName)
  );

  const languagesObject = JSON.parse(
    useSelector(state => state?.user?.currentUser?.attributes?.profile?.publicData?.languages)
  );

  const globalAvailabilityPlan = useSelector(
    state => state?.user?.currentUser?.attributes?.profile?.protectedData?.availabilityPlan
  );
  // console.log(availabilityPlan);
  const languages = languagesObject.map(m => m.value);
  // const languagesParsed = JSON.parse(languages);
  // const languagesFinal = languagesParsed.map(m=>m.value);

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const { description, title, publicData, availabilityPlan } = listing.attributes;
  // console.log(availabilityPlan);

  // const { country, language, industry, practiceArea } = listing.attributes
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
  const savedCategory = publicData?.category;
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDescriptionForm
        className={css.form}
        // initialValues={{ title, description, disclaimer: publicData.disclaimer }}
        initialValues={{
          title: savedCategory !== category ? '' : title,
          description: savedCategory !== category ? '' : description,
          disclaimer: savedCategory !== category ? '' : publicData.disclaimer,
        }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { title, description, disclaimer } = values;
          const updateValues = {
            title: title.trim(),
            description,
            publicData: {
              disclaimer,
              category,
              country,
              state,
              city,
              practiceArea,
              industry,
              languages,
            },
            availabilityPlan: availabilityPlan ? availabilityPlan : globalAvailabilityPlan,
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
