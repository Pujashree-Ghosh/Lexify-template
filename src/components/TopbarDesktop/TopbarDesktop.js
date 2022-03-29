import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES, PROFILE_SETTING_PAGES } from '../../routeConfiguration';
import { propTypes } from '../../util/types';
import {
  Avatar,
  InlineTextButton,
  Logo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  ListingLink,
  OwnListingLink,
} from '../../components';
import { TopbarSearchForm } from '../../forms';

import css from './TopbarDesktop.module.css';

const TopbarDesktop = props => {
  const {
    className,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    currentUserListing,
    currentUserListingFetched,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
  } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const classes = classNames(rootClassName || css.root, className);

  const search = (
    <TopbarSearchForm
      className={css.searchLink}
      desktopInputRoot={css.topbarSearchWithLeftPadding}
      onSubmit={onSearchSubmit}
      initialValues={initialSearchFormValues}
    />
  );

  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;

  const inboxLink = authenticatedOnClientSide ? (
    <NamedLink
      className={css.inboxLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.inbox}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  ) : null;

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    const isProfileSettingPage =
      page === 'ProfileSettingPage' && PROFILE_SETTING_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage || isProfileSettingPage
      ? css.currentPage
      : null;
  };

  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      {currentUser?.attributes?.profile?.protectedData?.isLawyer ? (
        <MenuContent className={css.profileMenuContent}>
          <MenuItem key="MyAppointmentPage">
            <NamedLink
              className={classNames(css.profileSettingsLink, currentPageClass('MyAppointmentPage'))}
              name="MyAppointmentPage"
              params={{ tab: 'pending' }}
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.appointmentsLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="Salespage">
            <NamedLink
              className={classNames(css.profileSettingsLink, currentPageClass('Salespage'))}
              name="Salespage"
              params={{ tab: 'pending' }}
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.mysalesLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="ManageListingsPage">
            <NamedLink
              className={classNames(
                css.profileSettingsLink,
                currentPageClass('ManageListingsPage')
              )}
              name="ManageListingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.manageListingsLink" />
            </NamedLink>
          </MenuItem>

          <MenuItem key="PromotionPage">
            <NamedLink
              className={classNames(css.promotionLink, currentPageClass('PromotionPage'))}
              name="PromotionPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.promotionLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="ServicesPage">
            <NamedLink
              className={classNames(css.promotionLink, currentPageClass('ServicesPage'))}
              name="ServicesPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.ServicesLink" />
            </NamedLink>
          </MenuItem>

          <MenuItem key="ProfileSettingsPage">
            <NamedLink
              className={classNames(
                css.profileSettingsLink,
                currentPageClass('ProfileSettingsPage')
              )}
              name="ProfileSettingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="AccountSettingsPage">
            <NamedLink
              className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
              name="AccountSettingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="logout">
            <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.logout" />
            </InlineTextButton>
          </MenuItem>
        </MenuContent>
      ) : (
        <MenuContent className={css.profileMenuContent}>
          <MenuItem key="MyAppointmentPage">
            <NamedLink
              className={classNames(css.profileSettingsLink, currentPageClass('MyAppointmentPage'))}
              name="MyAppointmentPage"
              params={{ tab: 'pending' }}
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.appointmentsLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="PromotionPage">
            <NamedLink
              className={classNames(css.promotionLink, currentPageClass('PromotionPage'))}
              name="PromotionPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.promotionLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="ServicesPage">
            <NamedLink
              className={classNames(css.promotionLink, currentPageClass('ServicesPage'))}
              name="ServicesPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.ServicesLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="ProfileSettingsPage">
            <NamedLink
              className={classNames(
                css.profileSettingsLink,
                currentPageClass('ProfileSettingsPage')
              )}
              name="ProfileSettingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="AccountSettingsPage">
            <NamedLink
              className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
              name="AccountSettingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
            </NamedLink>
          </MenuItem>
          <MenuItem key="logout">
            <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.logout" />
            </InlineTextButton>
          </MenuItem>
        </MenuContent>
      )}
    </Menu>
  ) : null;

  const signupLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="SignupPage" className={css.signupLink}>
      <span className={css.signup}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );

  const signupLawyer = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="SignupLawyerPage" className={css.signupLink}>
      <span className={css.signup}>
        <FormattedMessage id="TopbarDesktop.signupLawyer" />
      </span>
    </NamedLink>
  );

  const loginLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="LoginPage" className={css.loginLink}>
      <span className={css.login}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );

  const listingLink =
    authenticatedOnClientSide && currentUserListingFetched && currentUserListing ? (
      <ListingLink
        className={css.createListingLink}
        listing={currentUserListing}
        children={
          <span className={css.createListing}>
            <FormattedMessage id="TopbarDesktop.viewListing" />
          </span>
        }
      />
    ) : null;

  const createListingLink =
    isAuthenticatedOrJustHydrated && !currentUserListingFetched ? null : (
      <NamedLink className={css.createListingLink} name="CreateListing">
        <span className={css.createListing}>
          <FormattedMessage id="TopbarDesktop.createListing" />
        </span>
      </NamedLink>
    );

  return (
    <nav className={classes}>
      <NamedLink className={css.logoLink} name="LandingPage">
        <Logo
          format="desktop"
          className={css.logo}
          alt={intl.formatMessage({ id: 'TopbarDesktop.logo' })}
        />
      </NamedLink>
      {/*search*/}
      {/* {currentUser?.attributes?.profile?.protectedData?.isLawyer ? listingLink : ''} */}
      <div className={css.rightdiv}>
        {currentUser?.attributes?.profile?.protectedData?.isLawyer ? createListingLink : ''}
        {inboxLink}
        {profileMenu}
        {signupLawyer}
        {signupLink}
        {loginLink}
      </div>
    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  currentUserListing: null,
  currentUserListingFetched: false,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
};

export default TopbarDesktop;
