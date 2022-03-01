/**
 * This is a wrapper component for different Layouts.
 * Navigational 'aside' content should be added to this wrapper.
 */
 import React from 'react';
 import { node, number, string, shape } from 'prop-types';
 import { compose } from 'redux';
 import { FormattedMessage } from '../../util/reactIntl';
 import { withViewport } from '../../util/contextHelpers';
 import { LayoutWrapperSideNav } from '../../components';
 
 const MAX_HORIZONTAL_NAV_SCREEN_WIDTH = 1023;
 
 const scrollToTab = currentTab => {
   const el = document.querySelector(`#${currentTab}Tab`);
 
   if (el) {
     el.scrollIntoView({
       block: 'end',
       inline: 'end',
       behavior: 'smooth',
     });
   }
 };
 
 const ProfilePageSideNavComponent = props => {
   const { currentTab, viewport } = props;
 
   let hasScrolledToTab = false;
 
   const { width } = viewport;
   const hasViewport = width > 0;
   const hasHorizontalTabLayout = hasViewport && width <= MAX_HORIZONTAL_NAV_SCREEN_WIDTH;
   const hasVerticalTabLayout = hasViewport && width > MAX_HORIZONTAL_NAV_SCREEN_WIDTH;
   const hasFontsLoaded = hasViewport && document.documentElement.classList.contains('fontsLoaded');
 
   // Check if scrollToTab call is needed (tab is not visible on mobile)
   if (hasVerticalTabLayout) {
     hasScrolledToTab = true;
   } else if (hasHorizontalTabLayout && !hasScrolledToTab && hasFontsLoaded) {
     scrollToTab(currentTab);
     hasScrolledToTab = true;
   }
 
   const tabs = [
     {
       text: <FormattedMessage id="ProfilePageSideNav.generalInfo" />,
       selected: currentTab === 'GeneralInfoPage',
       id: 'GeneralInfoPage',
       linkProps: {
         name: 'GeneralInfoPage',
       },
     },
     {
       text: <FormattedMessage id="ProfilePageSideNav.jurisdiction" />,
       selected: currentTab === 'JurisdictionPage',
       id: 'JurisdictionPage',
       linkProps: {
         name: 'JurisdictionPage',
       },
     },
     {
       text: <FormattedMessage id="ProfilePageSideNav.education" />,
       selected: currentTab === 'EducationPage',
       id: 'EducationPage',
       linkProps: {
         name: 'EducationPage',
       },
     },
     {
       text: <FormattedMessage id="ProfilePageSideNav.practiceArea" />,
       selected: currentTab === 'PracticeAreaPage',
       id: 'PracticeAreaPage',
       linkProps: {
         name: 'PracticeAreaPage',
       },
     },
     {
      text: <FormattedMessage id="ProfilePageSideNav.availability" />,
      selected: currentTab === 'AvailabilityPage',
      id: 'AvailabilityPage',
      linkProps: {
        name: 'AvailabilityPage',
      },
    },
    {
      text: <FormattedMessage id="ProfilePageSideNav.verification" />,
      selected: currentTab === 'VerificationPage',
      id: 'VerificationPage',
      linkProps: {
        name: 'VerificationPage',
      },
    },
   ];
 
   return <LayoutWrapperSideNav tabs={tabs} />;
 };
 
 ProfilePageSideNavComponent.defaultProps = {
   className: null,
   rootClassName: null,
   children: null,
   currentTab: null,
 };
 
 ProfilePageSideNavComponent.propTypes = {
   children: node,
   className: string,
   rootClassName: string,
   currentTab: string,
 
   // from withViewport
   viewport: shape({
     width: number.isRequired,
     height: number.isRequired,
   }).isRequired,
 };
 
 const ProfilePageSideNav = compose(withViewport)(
   ProfilePageSideNavComponent
 );
 
 export default ProfilePageSideNav;
 