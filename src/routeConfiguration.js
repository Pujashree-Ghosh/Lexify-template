import React from 'react';
import loadable from '@loadable/component';
import getPageDataLoadingAPI from './containers/pageDataLoadingAPI';
import { NotFoundPage } from './containers';

// routeConfiguration needs to initialize containers first
// Otherwise, components will import form container eventually and
// at that point css bundling / imports will happen in wrong order.
import { NamedRedirect } from './components';
import CreateListing from './components/CreateListing/CreateListing';
import PromotionBasePage from './containers/SearchPage/PromotionBasePage';


const pageDataLoadingAPI = getPageDataLoadingAPI();

const AboutPage = loadable(() => import(/* webpackChunkName: "AboutPage" */ './containers/AboutPage/AboutPage'));
const AuthenticationPage = loadable(() => import(/* webpackChunkName: "AuthenticationPage" */ './containers/AuthenticationPage/AuthenticationPage'));
const CheckoutPage = loadable(() => import(/* webpackChunkName: "CheckoutPage" */ './containers/CheckoutPage/CheckoutPage'));
const ContactDetailsPage = loadable(() => import(/* webpackChunkName: "ContactDetailsPage" */ './containers/ContactDetailsPage/ContactDetailsPage'));
const EditListingPage = loadable(() => import(/* webpackChunkName: "EditListingPage" */ './containers/EditListingPage/EditListingPage'));
const EmailVerificationPage = loadable(() => import(/* webpackChunkName: "EmailVerificationPage" */ './containers/EmailVerificationPage/EmailVerificationPage'));
const InboxPage = loadable(() => import(/* webpackChunkName: "InboxPage" */ './containers/InboxPage/InboxPage'));
const Salespage = loadable(() => import(/* webpackChunkName: "Salespage" */ './containers/Salespage/Salespage'));

const MyAppointmentPage = loadable(() => import(/* webpackChunkName: "MyAppointmentPage" */ './containers/MyAppointmentPage/MyAppointmentPage'));
const LandingPage = loadable(() => import(/* webpackChunkName: "LandingPage" */ './containers/LandingPage/LandingPage'));
const ListingPage = loadable(() => import(/* webpackChunkName: "ListingPage" */ /* webpackPrefetch: true */ './containers/ListingPage/ListingPage'));
const PasswordChangePage = loadable(() => import(/* webpackChunkName: "PasswordChangePage" */ './containers/PasswordChangePage/PasswordChangePage'));
const PasswordRecoveryPage = loadable(() => import(/* webpackChunkName: "PasswordRecoveryPage" */ './containers/PasswordRecoveryPage/PasswordRecoveryPage'));
const PasswordResetPage = loadable(() => import(/* webpackChunkName: "PasswordResetPage" */ './containers/PasswordResetPage/PasswordResetPage'));
const ManageListingsPage = loadable(() => import(/* webpackChunkName: "ManageListingsPage" */ './containers/ManageListingsPage/ManageListingsPage'));
const PaymentMethodsPage = loadable(() => import(/* webpackChunkName: "PaymentMethodsPage" */ './containers/PaymentMethodsPage/PaymentMethodsPage'));
const PrivacyPolicyPage = loadable(() => import(/* webpackChunkName: "PrivacyPolicyPage" */ './containers/PrivacyPolicyPage/PrivacyPolicyPage'));
const ProfilePage = loadable(() => import(/* webpackChunkName: "ProfilePage" */ './containers/ProfilePage/ProfilePage'));
const ProfileSettingsPage = loadable(() => import(/* webpackChunkName: "ProfileSettingsPage" */ './containers/ProfileSettingsPage/ProfileSettingsPage'));
const SearchPage = loadable(() => import(/* webpackChunkName: "SearchPage" */ /* webpackPrefetch: true */  './containers/SearchPage/SearchPage'));
const PromotionPage = loadable(() => import(/* webpackChunkName: "PromotionPage" */ /* webpackPrefetch: true */  './containers/SearchPage/PromotionPage'));
const ServicesPage = loadable(() => import(/* webpackChunkName: "ServicesPage" */ /* webpackPrefetch: true */  './containers/SearchPage/ServicesPage'));
const StripePayoutPage = loadable(() => import(/* webpackChunkName: "StripePayoutPage" */ './containers/StripePayoutPage/StripePayoutPage'));
const TermsOfServicePage = loadable(() => import(/* webpackChunkName: "TermsOfServicePage" */ './containers/TermsOfServicePage/TermsOfServicePage'));
const TransactionPage = loadable(() => import(/* webpackChunkName: "TransactionPage" */ './containers/TransactionPage/TransactionPage'));
const MeetingNewPage = loadable(() => import(/* webpackChunkName: "MeetingNewPage" */ './containers/MeetingNewPage/MeetingNewPage'));
const GeneralInfoPage = loadable(() => import(/* webpackChunkName: "GeneralInfoPage" */ './components/GeneralInfoPage/GeneralInfoPage'));
const JurisdictionPage = loadable(() => import(/* webpackChunkName: "JurisdictionPage" */ './components/JurisdictionPage/JurisdictionPage'));
const EducationPage = loadable(() => import(/* webpackChunkName: "EducationPage" */ './components/EducationPage/EducationPage'));
const PracticeAreaPage = loadable(() => import(/* webpackChunkName: "PracticeAreaPage" */ './components/PracticeAreaPage/PracticeAreaPage'));
const AvailabilityPage = loadable(() => import(/* webpackChunkName: "AvailabilityPage" */ './components/AvailabilityPage/AvailabilityPage'));
const BufferTimePage = loadable(() => import(/* webpackChunkName: "BufferTimePage" */ './components/BufferTimePage/BufferTimePage'));
const VerificationPage = loadable(() => import(/* webpackChunkName: "VerificationPage" */ './components/VerificationPage/VerificationPage'));
// const AppointmentPage = loadable(() => import(/* webpackChunkName: "AppointmentPage" */ './components/AppointmentPage/AppointmentPage'));

// Styleguide helps you to review current components and develop new ones
const StyleguidePage = loadable(() => import(/* webpackChunkName: "StyleguidePage" */ './containers/StyleguidePage/StyleguidePage'));

export const ACCOUNT_SETTINGS_PAGES = [
  'ContactDetailsPage',
  'PasswordChangePage',
  'StripePayoutPage',
  'PaymentMethodsPage',
];
export const PROFILE_SETTING_PAGES = [
  'GeneralInfoPage',
  'JurisdictionPage',
  'EducationPage',
  'PracticeAreaPage',
  'AvailabilityPage',
  'VerificationPage',
];

// https://en.wikipedia.org/wiki/Universally_unique_identifier#Nil_UUID
const draftId = '00000000-0000-0000-0000-000000000000';
const draftSlug = 'draft';

const RedirectToLandingPage = () => <NamedRedirect name="LandingPage" />;

// NOTE: Most server-side endpoints are prefixed with /api. Requests to those
// endpoints are indended to be handled in the server instead of the browser and
// they will not render the application. So remember to avoid routes starting
// with /api and if you encounter clashing routes see server/index.js if there's
// a conflicting route defined there.

// Our routes are exact by default.
// See behaviour from Routes.js where Route is created.
const routeConfiguration = () => {
  return [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage,
    },
    {
      path: '/about',
      name: 'AboutPage',
      component: AboutPage,
    },
    {
      path: '/s',
      name: 'SearchPage',
      component: SearchPage,
      loadData: pageDataLoadingAPI.SearchPage.loadData,
    },
    {
      path: '/promotion',
      name: 'PromotionBasePage',
      auth: true,
      authPage: 'LoginPage',
      component: PromotionBasePage,
      // loadData: pageDataLoadingAPI.SearchPage.loadData,
      // component: () => <NamedRedirect name="PromotionPage" params={{ tab: 'One_N_One' }} />,

    },
    {
      path: '/promotion/:tab',
      name: 'PromotionPage',
      auth: true,
      authPage: 'LoginPage',
      component: PromotionPage,
      loadData: pageDataLoadingAPI.PromotionPage.loadData,
    },
    {
      path: '/Services',
      name: 'ServicesPage',
      auth: true,
      authPage: 'LoginPage',
      component: ServicesPage,
      loadData: pageDataLoadingAPI.SearchPage.loadData,
    },
    {
      path: '/l',
      name: 'ListingBasePage',
      component: RedirectToLandingPage,
    },
    {
      path: '/l/:slug/:id',
      name: 'ListingPage',
      component: ListingPage,
      loadData: pageDataLoadingAPI.ListingPage.loadData,
    },
    {
      path: '/l/:slug/:id/checkout',
      name: 'CheckoutPage',
      auth: true,
      component: CheckoutPage,
      authPage: 'LoginPage',
      setInitialValues: pageDataLoadingAPI.CheckoutPage.setInitialValues,
    },
    {
      path: '/l/:slug/:id/:variant',
      name: 'ListingPageVariant',
      auth: true,
      authPage: 'LoginPage',
      component: ListingPage,
      loadData: pageDataLoadingAPI.ListingPage.loadData,
    },
    {
      path: '/create-listing',
      name:'CreateListing',
      auth:true,
      component:CreateListing,
    },
    {
      path: '/l-public-oral/new',
      name: 'NewListingPublicOralPage',
      auth: true,
      component: () => (
        <NamedRedirect
          name="EditListingPublicOralPage"
          params={{ slug: draftSlug, id: draftId, type: 'new', tab: 'description' }}
        />
      ),
    },
    {
      path: '/l-custom-oral/new',
      name: 'NewListingCustomOralPage',
      auth: true,
      component: () => (
        <NamedRedirect
          name="EditListingCustomOralPage"
          params={{ slug: draftSlug, id: draftId, type: 'new', tab: 'description' }}
        />
      ),
    },
    {
      path: '/l-custom-service/new',
      name: 'NewListingCustomServicePage',
      auth: true,
      component: () => (
        <NamedRedirect
          name="EditListingCustomServicePage"
          params={{ slug: draftSlug, id: draftId, type: 'new', tab: 'description' }}
        />
      ),
    },
    {
      path: '/l/new',
      name: 'NewListingPage',
      auth: true,
      component: () => (
        <NamedRedirect
          name="EditListingPage"
          params={{ slug: draftSlug, id: draftId, type: 'new', tab: 'description' }}
        />
      ),
    },
    // {
    //   path: '/appointment-page',
    //   name: 'AppointmentPage',
    //   auth:true,
    //   authPage: 'LoginPage',
    //   component: AppointmentPage,
    // },
    {
      path: '/listings',
      name: 'ManageListingsPage',
      auth: true,
      authPage: 'LoginPage',
      component: ManageListingsPage,
      loadData: pageDataLoadingAPI.ManageListingsPage.loadData,
    },
    {
      path: '/l/:slug/:id/:type/:tab/',
      name: 'EditListingPage',
      auth: true,
      component: EditListingPage,
      // extraProps: { allowOnlyOneListing: true },
      loadData: pageDataLoadingAPI.EditListingPage.loadData,
    },
    {
      path: '/l-public-oral/:slug/:id/:type/:tab/',
      name: 'EditListingPublicOralPage',
      auth: true,
      component: EditListingPage,
      // extraProps: { allowOnlyOneListing: true },
      extraProps: { category:'publicOral' },
      loadData: pageDataLoadingAPI.EditListingPage.loadData,
    },
    {
      path: '/l-custom-oral/:slug/:id/:type/:tab/',
      name: 'EditListingCustomOralPage',
      auth: true,
      component: EditListingPage,
      // extraProps: { allowOnlyOneListing: true },
      extraProps: { category:'customOral' },
      loadData: pageDataLoadingAPI.EditListingPage.loadData,
    },
    {
      path: '/l-custom-service/:slug/:id/:type/:tab/',
      name: 'EditListingCustomServicePage',
      auth: true,
      component: EditListingPage,
      // extraProps: { allowOnlyOneListing: true },
      extraProps: { category: 'customService' },
      loadData: pageDataLoadingAPI.EditListingPage.loadData,
    },
    {
      path: '/l/:slug/:id/:type/:tab/:returnURLType',
      name: 'EditListingStripeOnboardingPage',
      auth: true,
      component: EditListingPage,
      loadData: pageDataLoadingAPI.EditListingPage.loadData,
    },

    // Canonical path should be after the `/l/new` path since they
    // conflict and `new` is not a valid listing UUID.
    {
      path: '/l/:id',
      name: 'ListingPageCanonical',
      component: ListingPage,
      loadData: pageDataLoadingAPI.ListingPage.loadData,
    },
    {
      path: '/u',
      name: 'ProfileBasePage',
      component: RedirectToLandingPage,
    },
    {
      path: '/u/:id',
      name: 'ProfilePage',
      component: ProfilePage,
      loadData: pageDataLoadingAPI.ProfilePage.loadData,
    },
    {
      path: '/profile-settings',
      name: 'ProfileSettingsPage',
      auth: true,
      authPage: 'LoginPage',
      component: ProfileSettingsPage,
    },

    // Note: authenticating with IdP (e.g. Facebook) expects that /login path exists
    // so that in the error case users can be redirected back to the LoginPage
    // In case you change this, remember to update the route in server/api/auth/loginWithIdp.js
    {
      path: '/login',
      name: 'LoginPage',
      component: AuthenticationPage,
      extraProps: { tab: 'login' },
    },
    {
      path: '/signup',
      name: 'SignupPage',
      component: AuthenticationPage,
      extraProps: { tab: 'signup' },
    },
    {
      path: '/signup-lawyer',
      name: 'SignupLawyerPage',
      component: AuthenticationPage,
      extraProps: { tab: 'signup-lawyer' },
    },
    {
      path: '/confirm',
      name: 'ConfirmPage',
      component: AuthenticationPage,
      extraProps: { tab: 'confirm' },
    },
    {
      path: '/recover-password',
      name: 'PasswordRecoveryPage',
      component: PasswordRecoveryPage,
    },
    {
      path: '/inbox',
      name: 'InboxBasePage',
      auth: true,
      authPage: 'LoginPage',
      component: () => <NamedRedirect name="InboxPage" params={{ tab: 'sales' }} />,
    },
    {
      path: '/inbox/:tab',
      name: 'InboxPage',
      auth: true,
      authPage: 'LoginPage',
      component: InboxPage,
      loadData: pageDataLoadingAPI.InboxPage.loadData,
    },
    {
      path: '/sales',
      name: 'SalesBasepage',
      auth: true,
      authPage: 'LoginPage',
      component: () => <NamedRedirect name="Salespage" params={{ tab: 'pending' }} />,
    },
    {
      path: '/sales/:tab',
      name: 'Salespage',
      auth: true,
      authPage: 'LoginPage',
      component: Salespage,
      loadData: pageDataLoadingAPI.Salespage.loadData,
    },
    {
      path: '/appointment',
      name: 'MyAppoinmentBasePage',
      auth: true,
      authPage: 'LoginPage',
      component: () => <NamedRedirect name="MyAppointmentPage" params={{ tab: 'pending' }} />,
    },
    {
      path: '/appointment/:tab',
      name: 'MyAppointmentPage',
      auth: true,
      authPage: 'LoginPage',
      component: MyAppointmentPage,
      loadData: pageDataLoadingAPI.MyAppointmentPage.loadData,
    },
    {
      path: '/order/:id',
      name: 'OrderPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <NamedRedirect name="OrderDetailsPage" params={{ ...props.params }} />,
    },
    {
      path: '/order/:id/details',
      name: 'OrderDetailsPage',
      auth: true,
      authPage: 'LoginPage',
      component: TransactionPage,
      extraProps: { transactionRole: 'customer' },
      loadData: params =>
        pageDataLoadingAPI.TransactionPage.loadData({ ...params, transactionRole: 'customer' }),
      setInitialValues: pageDataLoadingAPI.TransactionPage.setInitialValues,
    },
    {
      path: '/sale/:id',
      name: 'SalePage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <NamedRedirect name="SaleDetailsPage" params={{ ...props.params }} />,
    },
    {
      path: '/sale/:id/details',
      name: 'SaleDetailsPage',
      auth: true,
      authPage: 'LoginPage',
      component: TransactionPage,
      extraProps: { transactionRole: 'provider' },
      loadData: params =>
        pageDataLoadingAPI.TransactionPage.loadData({ ...params, transactionRole: 'provider' }),
    },
    {
      path: '/account',
      name: 'AccountSettingsPage',
      auth: true,
      authPage: 'LoginPage',
      component: () => <NamedRedirect name="ContactDetailsPage" />,
    },
    {
      path: '/account/contact-details',
      name: 'ContactDetailsPage',
      auth: true,
      authPage: 'LoginPage',
      component: ContactDetailsPage,
      loadData: pageDataLoadingAPI.ContactDetailsPage.loadData,
    },
    {
      path: '/account/change-password',
      name: 'PasswordChangePage',
      auth: true,
      authPage: 'LoginPage',
      component: PasswordChangePage,
    },
    {
      path: '/account/payments',
      name: 'StripePayoutPage',
      auth: true,
      authPage: 'LoginPage',
      component: StripePayoutPage,
      loadData: pageDataLoadingAPI.StripePayoutPage.loadData,
    },
    {
      path: '/account/payments/:returnURLType',
      name: 'StripePayoutOnboardingPage',
      auth: true,
      authPage: 'LoginPage',
      component: StripePayoutPage,
      loadData: pageDataLoadingAPI.StripePayoutPage.loadData,
    },
    {
      path: '/account/payment-methods',
      name: 'PaymentMethodsPage',
      auth: true,
      authPage: 'LoginPage',
      component: PaymentMethodsPage,
      loadData: pageDataLoadingAPI.PaymentMethodsPage.loadData,
    },
    {
      path: '/terms-of-service',
      name: 'TermsOfServicePage',
      component: TermsOfServicePage,
    },
    {
      path: '/privacy-policy',
      name: 'PrivacyPolicyPage',
      component: PrivacyPolicyPage,
    },
    {
      path: '/styleguide',
      name: 'Styleguide',
      component: StyleguidePage,
    },
    {
      path: '/styleguide/g/:group',
      name: 'StyleguideGroup',
      component: StyleguidePage,
    },
    {
      path: '/styleguide/c/:component',
      name: 'StyleguideComponent',
      component: StyleguidePage,
    },
    {
      path: '/styleguide/c/:component/:example',
      name: 'StyleguideComponentExample',
      component: StyleguidePage,
    },
    {
      path: '/styleguide/c/:component/:example/raw',
      name: 'StyleguideComponentExampleRaw',
      component: StyleguidePage,
      extraProps: { raw: true },
    },
    {
      path: '/notfound',
      name: 'NotFoundPage',
      component: props => <NotFoundPage {...props} />,
    },

    // Do not change this path!
    //
    // The API expects that the application implements /reset-password endpoint
    {
      path: '/reset-password',
      name: 'PasswordResetPage',
      component: PasswordResetPage ,
    },

    // Do not change this path!
    //
    // The API expects that the application implements /verify-email endpoint
    {
      path: '/verify-email',
      name: 'EmailVerificationPage',
      auth: true,
      authPage: 'LoginPage',
      component: EmailVerificationPage,
      loadData: pageDataLoadingAPI.EmailVerificationPage.loadData,
    },
    {
      path: '/meeting-new/:id',
      name: 'MeetingNewPage',
      auth: true,
      authPage: 'LoginPage',
      component: props => <MeetingNewPage {...props} />,
      // loadData: pageDataLoadingAPI.ListingPage.loadData,

    },
    {
      path: '/profile-setting',
      name: 'ProfileSettingPage',
      auth: true,
      authPage: 'LoginPage',
      component: () => <NamedRedirect name="GeneralInfoPage" />,
    },
    {
      path: '/profile-setting/general-info',
      name: 'GeneralInfoPage',
      auth: true,
      authPage: 'LoginPage',
      component: GeneralInfoPage,
      // loadData: pageDataLoadingAPI.GeneralInfoPage.loadData,
    },
    {
      path: '/profile-setting/jurisdiction',
      name: 'JurisdictionPage',
      auth: true,
      authPage: 'LoginPage',
      component: JurisdictionPage,
      // loadData: pageDataLoadingAPI.GeneralInfoPage.loadData,
    },
    {
      path: '/profile-setting/education',
      name: 'EducationPage',
      auth: true,
      authPage: 'LoginPage',
      component: EducationPage,
      // loadData: pageDataLoadingAPI.GeneralInfoPage.loadData,
    },
    {
      path: '/profile-setting/practice-area-and-industries',
      name: 'PracticeAreaPage',
      auth: true,
      authPage: 'LoginPage',
      component: PracticeAreaPage,
      // loadData: pageDataLoadingAPI.GeneralInfoPage.loadData,
    },
    {
      path: '/profile-setting/availability',
      name: 'AvailabilityPage',
      auth: true,
      authPage: 'LoginPage',
      component: AvailabilityPage,
      // loadData: pageDataLoadingAPI.GeneralInfoPage.loadData,
    },
    {
      path: '/profile-setting/buffer',
      name: 'BufferTimePage',
      auth: true,
      authPage: 'LoginPage',
      component: BufferTimePage,
      // loadData: pageDataLoadingAPI.GeneralInfoPage.loadData,
    },
    {
      path: '/profile-setting/verification',
      name: 'VerificationPage',
      auth: true,
      authPage: 'LoginPage',
      component: VerificationPage,
      // loadData: pageDataLoadingAPI.GeneralInfoPage.loadData,
    },
  ];
};

export default routeConfiguration;
