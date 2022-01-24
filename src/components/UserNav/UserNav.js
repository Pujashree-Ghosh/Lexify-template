import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES } from '../../routeConfiguration';
import { LinkTabNavHorizontal } from '../../components';
import { ensureOwnListing } from '../../util/data';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { getListingType, createSlug } from '../../util/urlHelpers';

import css from './UserNav.module.css';

const listingTab = (listing, selectedPageName) => {
  return {
    text: <FormattedMessage id="UserNav.newListing" />,
    selected: selectedPageName === 'CreateListing',
    linkProps: {
      name: 'CreateListing',
    },
  };
  // if (!listing) {
  //   return {
  //     text: <FormattedMessage id="UserNav.newListing" />,
  //     selected: selectedPageName === 'NewListingPage',
  //     linkProps: {
  //       name: 'NewListingPage',
  //     },
  //   };
  // }
  // const currentListing = ensureOwnListing(listing);
  // const id = currentListing.id.uuid;
  // const { title = '', state } = currentListing.attributes;
  // const slug = createSlug(title);
  // const isDraft = state === LISTING_STATE_DRAFT;

  // return {
  //   text: <FormattedMessage id="UserNav.editListing" />,
  //   selected: selectedPageName === 'EditListingPage',
  //   linkProps: {
  //     name: 'EditListingPage',
  //     params: {
  //       id,
  //       slug,
  //       type: getListingType(isDraft),
  //       tab: 'photos',
  //     },
  //   },
  // };
};

const UserNav = props => {
  const { className, rootClassName, selectedPageName, listing, currentUser } = props;
  const classes = classNames(rootClassName || css.root, className);
  let tabs = [];
  if (currentUser?.attributes?.profile?.protectedData?.isLawyer) {
    tabs = [
      {
        ...listingTab(listing, selectedPageName),
      },
      {
        text: <FormattedMessage id="UserNav.yourListings" />,
        selected: selectedPageName === 'ManageListingsPage',
        linkProps: {
          name: 'ManageListingsPage',
        },
      },
      {
        text: <FormattedMessage id="UserNav.PromotionPage" />,
        selected: selectedPageName === 'PromotionPage',
        linkProps: {
          name: 'PromotionPage',
        },
      },
      {
        text: <FormattedMessage id="UserNav.ServicesPage" />,
        selected: selectedPageName === 'ServicesPage',
        linkProps: {
          name: 'ServicesPage',
        },
      },
      {
        text: <FormattedMessage id="UserNav.profileSettingsPage" />,
        selected: selectedPageName === 'ProfileSettingsPage',
        disabled: false,
        linkProps: {
          name: 'ProfileSettingsPage',
        },
      },
      {
        text: <FormattedMessage id="UserNav.contactDetailsPage" />,
        selected: ACCOUNT_SETTINGS_PAGES.includes(selectedPageName),
        disabled: false,
        linkProps: {
          name: 'ContactDetailsPage',
        },
      },
    ];
  } else {
    tabs = [
      {
        text: <FormattedMessage id="UserNav.PromotionPage" />,
        selected: selectedPageName === 'PromotionPage',
        linkProps: {
          name: 'PromotionPage',
        },
      },
      {
        text: <FormattedMessage id="UserNav.ServicesPage" />,
        selected: selectedPageName === 'ServicesPage',
        linkProps: {
          name: 'ServicesPage',
        },
      },
      {
        text: <FormattedMessage id="UserNav.profileSettingsPage" />,
        selected: selectedPageName === 'ProfileSettingsPage',
        disabled: false,
        linkProps: {
          name: 'ProfileSettingsPage',
        },
      },
      {
        text: <FormattedMessage id="UserNav.contactDetailsPage" />,
        selected: ACCOUNT_SETTINGS_PAGES.includes(selectedPageName),
        disabled: false,
        linkProps: {
          name: 'ContactDetailsPage',
        },
      },
    ];
  }

  return (
    <LinkTabNavHorizontal className={classes} tabRootClassName={css.tab} tabs={tabs} skin="dark" />
  );
};

UserNav.defaultProps = {
  className: null,
  rootClassName: null,
};

const { string } = PropTypes;

UserNav.propTypes = {
  className: string,
  rootClassName: string,
  selectedPageName: string.isRequired,
};
const mapStateToProps = state => {
  const { currentUser } = state.user;

  return {
    currentUser,
  };
};
export default compose(connect(mapStateToProps, null), injectIntl)(UserNav);
