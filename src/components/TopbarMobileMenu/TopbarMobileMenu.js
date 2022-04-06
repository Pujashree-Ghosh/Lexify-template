/**
 *  TopbarMobileMenu prints the menu content for authenticated user or
 * shows login actions for those who are not authenticated.
 */
import React from 'react';
import { bool, func, number, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES } from '../../routeConfiguration';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import {
  AvatarLarge,
  InlineTextButton,
  NamedLink,
  NotificationBadge,
  OwnListingLink,
} from '../../components';

import css from './TopbarMobileMenu.module.css';

const TopbarMobileMenu = props => {
  const {
    isAuthenticated,
    currentPage,
    currentUserHasListings,
    currentUserListing,
    currentUserListingFetched,
    currentUser,
    notificationCount,
    onLogout,
  } = props;

  const user = ensureCurrentUser(currentUser);

  if (!isAuthenticated) {
    const signupLawyer = (
      <NamedLink name="SignupLawyerPage" className={css.signupLink}>
        <FormattedMessage id="TopbarMobileMenu.signupLawyerLink" />
      </NamedLink>
    );

    const signupClient = (
      <NamedLink name="SignupPage" className={css.signupLink}>
        <FormattedMessage id="TopbarMobileMenu.signupClientLink" />
      </NamedLink>
    );

    const login = (
      <NamedLink name="LoginPage" className={css.loginLink}>
        <FormattedMessage id="TopbarMobileMenu.loginLink" />
      </NamedLink>
    );

    const signupOrLogin = (
      <span className={css.authenticationLinks}>
        <FormattedMessage
          id="TopbarMobileMenu.signupOrLogin"
          values={{ signupLawyer, signupClient, login }}
        />
      </span>
    );
    return (
      <div className={css.root}>
        <div className={css.content}>
          <div className={css.authenticationGreeting}>
            <FormattedMessage
              id="TopbarMobileMenu.unauthorizedGreeting"
              values={{ lineBreak: <br /> }}
            />
            <FormattedMessage
              id="TopbarMobileMenu.signupOrLogin"
              values={{ lineBreak: <br />, signupLawyer, signupClient, login }}
            />
          </div>
        </div>
        {/* <div className={css.footer}>
          <NamedLink className={css.createNewListingLink} name="NewListingPage">
            <FormattedMessage id="TopbarMobileMenu.newListingLink" />
          </NamedLink>
        </div> */}
      </div>
    );
  }

  const notificationCountBadge =
    notificationCount > 0 ? (
      <NotificationBadge className={css.notificationBadge} count={notificationCount} />
    ) : null;

  const displayName = user.attributes.profile.firstName;
  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  return (
    <div className={css.root}>
      <AvatarLarge className={css.avatar} user={currentUser} />
      <div className={css.content}>
        <span className={css.greeting}>
          <FormattedMessage id="TopbarMobileMenu.greeting" values={{ displayName }} />
        </span>
        <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
          <FormattedMessage id="TopbarMobileMenu.logoutLink" />
        </InlineTextButton>
        <NamedLink
          className={classNames(css.inbox, currentPageClass('InboxPage'))}
          name="InboxPage"
          params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
        >
          <FormattedMessage id="TopbarMobileMenu.inboxLink" />
          {notificationCountBadge}
        </NamedLink>

        {currentUser?.attributes?.profile?.protectedData?.isLawyer ? (
          <NamedLink
            className={classNames(css.navigationLink, currentPageClass('CreateListingPage'))}
            name="NewListingPage"
          >
            {<FormattedMessage id="OwnListingLink.addYourListingLink" />}
          </NamedLink>
        ) : (
          ''
        )}
        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('MyAppointmentPage'))}
          name="MyAppointmentPage"
          params={{ tab: 'pending' }}
        >
          <FormattedMessage id="TopbarMobileMenu.myAppointment" />
        </NamedLink>
        {currentUser?.attributes?.profile?.protectedData?.isLawyer ? (
          <NamedLink
            className={classNames(css.navigationLink, currentPageClass('ManageListingsPage'))}
            name="ManageListingsPage"
          >
            <FormattedMessage id="TopbarMobile.manageListingsLink" />
          </NamedLink>
        ) : (
          ''
        )}
        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('PromotionPage'))}
          name="PromotionPage"
        >
          <FormattedMessage id="TopbarMobile.promotionLink" />
        </NamedLink>
        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('ServicesPage'))}
          name="ServicesPage"
        >
          <FormattedMessage id="TopbarMobile.ServicesLink" />
        </NamedLink>
        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('ProfileSettingsPage'))}
          name="ProfileSettingsPage"
        >
          <FormattedMessage id="TopbarMobileMenu.profileSettingsLink" />
        </NamedLink>
        <NamedLink
          className={classNames(css.navigationLink, currentPageClass('AccountSettingsPage'))}
          name="AccountSettingsPage"
        >
          <FormattedMessage id="TopbarMobileMenu.accountSettingsLink" />
        </NamedLink>
      </div>
      {!currentUser ? (
        <div className={css.footer}>
          <NamedLink className={css.createNewListingLink} name="NewListingPage">
            <FormattedMessage id="TopbarMobileMenu.newListingLink" />
          </NamedLink>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

TopbarMobileMenu.defaultProps = {
  currentUser: null,
  notificationCount: 0,
  currentPage: null,
  currentUserListing: null,
  currentUserListingFetched: false,
};

TopbarMobileMenu.propTypes = {
  isAuthenticated: bool.isRequired,
  currentUserHasListings: bool.isRequired,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
  currentUser: propTypes.currentUser,
  currentPage: string,
  notificationCount: number,
  onLogout: func.isRequired,
};

export default TopbarMobileMenu;
