import React, { Component } from 'react';
import { array, arrayOf, bool, func, number, object, string } from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY,
  txIsAccepted,
  txIsAcceptedOral,
  txIsRescheduled,
  txIsCanceled,
  txIsDeclined,
  txIsEnquired,
  txIsPaymentExpired,
  txIsPaymentPending,
  txIsRequested,
  txHasBeenDelivered,
  txCustomerJoined1,
  txProviderJoined1,
  txBothJoined,
  txIsExpired,
  txIsPendingConfirmation,
  txIsRequestedOral,
} from '../../util/transaction';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes } from '../../util/types';
import {
  ensureListing,
  ensureTransaction,
  ensureUser,
  userDisplayNameAsString,
} from '../../util/data';
import { isMobileSafari } from '../../util/userAgent';
import { formatMoney } from '../../util/currency';
import {
  AvatarLarge,
  BookingPanel,
  NamedLink,
  ReviewModal,
  UserDisplayName,
} from '../../components';
import { SendMessageForm } from '../../forms';
import config from '../../config';
import jsonwebtoken from 'jsonwebtoken';
import { UserAgentApplication } from 'msal';

// These are internal components that make this file more readable.
import AddressLinkMaybe from './AddressLinkMaybe';
import BreakdownMaybe from './BreakdownMaybe';
import DetailCardHeadingsMaybe from './DetailCardHeadingsMaybe';
import DetailCardImage from './DetailCardImage';
import FeedSection from './FeedSection';
import SaleActionButtonsMaybe from './SaleActionButtonsMaybe';
import PanelHeading, {
  HEADING_ENQUIRED,
  HEADING_PAYMENT_PENDING,
  HEADING_PAYMENT_EXPIRED,
  HEADING_REQUESTED,
  HEADING_ACCEPTED,
  HEADING_RESCHEDULED,
  HEADING_DECLINED,
  HEADING_CANCELED,
  HEADING_DELIVERED,
  HEADING_EXPIRED,
} from './PanelHeading';
import Axios from 'axios';
import { PrimaryButton } from '../Button/Button';
import { apiBaseUrl } from '../../util/api';
import { BsCalendar2Plus } from 'react-icons/bs';
import css from './TransactionPanel.module.css';
import axios from 'axios';

// Helper function to get display names for different roles
const displayNames = (currentUser, currentProvider, currentCustomer, intl) => {
  const authorDisplayName = <UserDisplayName user={currentProvider} intl={intl} />;
  const customerDisplayName = <UserDisplayName user={currentCustomer} intl={intl} />;

  let otherUserDisplayName = '';
  let otherUserDisplayNameString = '';
  const currentUserIsCustomer =
    currentUser.id && currentCustomer.id && currentUser.id.uuid === currentCustomer.id.uuid;
  const currentUserIsProvider =
    currentUser.id && currentProvider.id && currentUser.id.uuid === currentProvider.id.uuid;

  if (currentUserIsCustomer) {
    otherUserDisplayName = authorDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(currentProvider, '');
  } else if (currentUserIsProvider) {
    otherUserDisplayName = customerDisplayName;
    otherUserDisplayNameString = userDisplayNameAsString(currentCustomer, '');
  }

  return {
    authorDisplayName,
    customerDisplayName,
    otherUserDisplayName,
    otherUserDisplayNameString,
  };
};

export class TransactionPanelComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendMessageFormFocused: false,
      isReviewModalOpen: false,
      reviewSubmitted: false,
      // selectedFile: null,
      // fileUploadInProgress: false,
      // fileUploadError: null,
      // fileUploadProgress: 0,
      // signedURL: null,
      // fileUploadSuccess: null,
      // cancelError: '',
      inProgress: false,
      joinMeetingProgress: false,
    };
    // this.fileInputRef = React.createRef();

    this.isMobSaf = false;
    this.sendMessageFormName = 'TransactionPanel.SendMessageForm';

    this.onOpenReviewModal = this.onOpenReviewModal.bind(this);
    this.onSubmitReview = this.onSubmitReview.bind(this);
    this.onSendMessageFormFocus = this.onSendMessageFormFocus.bind(this);
    this.onSendMessageFormBlur = this.onSendMessageFormBlur.bind(this);
    this.onMessageSubmit = this.onMessageSubmit.bind(this);
    this.scrollToMessage = this.scrollToMessage.bind(this);
    this.goToConference = this.goToConference.bind(this);
    this.userAgentApplication = new UserAgentApplication({
      auth: {
        clientId: 'c5c3ffe8-8b3e-49a5-8e88-920a883c826f',

        authority: 'https://login.microsoftonline.com/common/',
        redirectUri: 'https://lexify-dev-bitcanny.herokuapp.com/',
        // redirectUri: 'http://localhost:3000/',
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    });
  }

  componentDidMount() {
    this.isMobSaf = isMobileSafari();
  }

  onOpenReviewModal() {
    this.setState({ isReviewModalOpen: true });
  }

  onSubmitReview(values) {
    const { onSendReview, transaction, transactionRole } = this.props;
    const currentTransaction = ensureTransaction(transaction);
    const { reviewRating, reviewContent } = values;
    const rating = Number.parseInt(reviewRating, 10);
    onSendReview(transactionRole, currentTransaction, rating, reviewContent)
      .then(r => this.setState({ isReviewModalOpen: false, reviewSubmitted: true }))
      .catch(e => {
        // Do nothing.
      });
  }

  onSendMessageFormFocus() {
    this.setState({ sendMessageFormFocused: true });
    if (this.isMobSaf) {
      // Scroll to bottom
      window.scroll({ top: document.body.scrollHeight, left: 0, behavior: 'smooth' });
    }
  }

  onSendMessageFormBlur() {
    this.setState({ sendMessageFormFocused: false });
  }

  onMessageSubmit(values, form) {
    const message = values.message ? values.message.trim() : null;
    const { transaction, onSendMessage } = this.props;
    const ensuredTransaction = ensureTransaction(transaction);

    if (!message) {
      return;
    }
    onSendMessage(ensuredTransaction.id, message)
      .then(messageId => {
        form.reset();
        this.scrollToMessage(messageId);
      })
      .catch(e => {
        // Ignore, Redux handles the error
      });
  }

  scrollToMessage(messageId) {
    const selector = `#msg-${messageId.uuid}`;
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }
  }
  goToConference = async transaction => {
    let startTime = transaction?.booking?.attributes?.start;
    let endTime = transaction?.booking?.attributes?.end;
    let transactionId = transaction?.id?.uuid;
    let listingId = transaction?.listing?.id?.uuid;
    let listingTitle = transaction?.listing?.attributes?.title;
    let transaction_customer_id = transaction?.customer?.id?.uuid;
    let transaction_provider_id = transaction?.provider?.id?.uuid;
    let role = this.props.transactionRole;
    const moderator = transaction?.provider?.attributes?.profile?.displayName;

    let actualStartTime;
    let customerJoinTime;

    // [{"transition":"transition/request-payment","createdAt":"2021-06-09T08:50:22.829Z","by":"customer"},{"transition":"transition/confirm-payment","createdAt":"2021-06-09T08:50:25.122Z","by":"customer"},{"transition":"transition/accept-short-booking","createdAt":"2021-06-09T09:01:02.036Z","by":"provider"},{"transition":"transition/short-booking-provider-join-1","createdAt":"2021-06-09T09:04:02.847Z","by":"provider"},{"transition":"transition/short-booking-customer-join-2","createdAt":"2021-06-09T09:04:06.660Z","by":"customer"}]

    let { transitions } = transaction?.attributes;
    // const isShortBooking =
    //   transaction &&
    //   transaction.attributes.protectedData &&
    //   transaction.attributes.protectedData.shortBooking;

    // let findActualStartTime =
    // // isShortBooking ? [TRANSITION_SHORT_BOOKING_PROVIDER_JOIN_2, TRANSITION_SHORT_BOOKING_CUSTOMER_JOIN_2]:
    //   [TRANSITION_PROVIDER_JOIN_1, TRANSITION_PROVIDER_JOIN_2];

    // Array.isArray(transitions) &&
    //   transitions.length &&
    //   transitions.forEach(item => {
    //     if (findActualStartTime.includes(item.transition)) {
    //       actualStartTime = item.createdAt;
    //     }
    //   });

    // let findCustomerJoinTime =
    // // isShortBooking ? [TRANSITION_SHORT_BOOKING_CUSTOMER_JOIN_1, TRANSITION_SHORT_BOOKING_CUSTOMER_JOIN_2] :
    //  [TRANSITION_CUSTOMER_JOIN_1, TRANSITION_CUSTOMER_JOIN_2];

    // Array.isArray(transitions) &&
    //   transitions.length &&
    //   transitions.forEach(item => {
    //     if (findCustomerJoinTime.includes(item.transition)) {
    //       customerJoinTime = item.createdAt;
    //     }
    //   });

    // console.log({ actualStartTime, customerJoinTime });

    if (!transactionId) {
      return;
    }
    const beforeBufferTime =
      transaction?.provider?.attributes?.profile?.publicData?.beforeBufferTime || 0;
    const afterBufferTime =
      transaction?.provider?.attributes?.profile?.publicData?.afterBufferTime || 0;

    let jwtToken = jsonwebtoken.sign(
      {
        startTime,
        endTime,
        transactionId,
        listingId,
        listingTitle,
        transaction_customer_id,
        transaction_provider_id,
        role,
        beforeBufferTime,
        afterBufferTime,
      },
      config.secretCode
    );
    this.setState({ joinMeetingProgress: false });
    window.open(`/meeting-new/${jwtToken}`);
    // this.props.history.push(`/meeting-new/${jwtToken}`);
    // console.log('555 token', jwtToken);
    // console.log('555 conf URL', config.canonicalRootURL + '/meeting-new/' + jwtToken);
  };

  // setFileUploadError = msg => {
  //   this.setState(
  //     {
  //       fileUploadError: msg,
  //     },
  //     () =>
  //       setTimeout(() => {
  //         this.setState({
  //           fileUploadError: null,
  //         });
  //       }, 3000)
  //   );
  // };

  // onFileUpload = e => {
  //   let { name, size, type } = e.target.files.length ? e.target.files[0] : {};
  //   if (!name || !size || !type) {
  //     if (name) this.setFileUploadError('File format not supported');
  //     return;
  //   }
  //   let limit = 64;
  //   let maxSize = limit * 1024 * 1024; //64MB
  //   let fileName = name;
  //   // let fileName = name.split('.')[0] + '_' + new Date().getTime();
  //   const srcFile = e.target.files[0];

  //   if (size > maxSize) {
  //     this.setFileUploadError(`Max file size limit ${limit}mb`);
  //     return null;
  //   }

  //   Axios.post(`${apiBaseUrl()}/fileshare/getSignUrl`, {
  //     fileName: fileName,
  //     fileType: type,
  //   })
  //     .then(res => {
  //       this.setState({
  //         selectedFile: srcFile,
  //         signedURL: res.data,
  //       });
  //     })
  //     .catch(e => console.log(e));
  // };

  // sendFile = () => {
  //   this.setState({
  //     fileUploadInProgress: true,
  //   });
  //   Axios({
  //     method: 'put',
  //     url: this.state.signedURL,
  //     data: this.state.selectedFile,
  //     headers: { 'content-type': this.state.selectedFile.type },
  //     onUploadProgress: progressEvent => {
  //       let progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //       this.setState({
  //         fileUploadProgress: progress,
  //       });
  //     },
  //   })
  //     .then(() => {
  //       this.setState({
  //         fileUploadInProgress: false,
  //         selectedFile: null,
  //         fileUploadSuccess: true,
  //       });

  //       let url = this.state.signedURL.split('?')[0];

  //       this.onMessageSubmit({ message: url });

  //       setTimeout(() => {
  //         this.setState({
  //           fileUploadSuccess: null,
  //         });
  //       }, 3000);
  //     })
  //     .catch(e => {
  //       this.setFileUploadError('Someting went wrong, please try again.');
  //       this.setState({
  //         fileUploadInProgress: false,
  //         selectedFile: null,
  //       });
  //     });
  // };

  render() {
    const {
      rootClassName,
      className,
      currentUser,
      transaction,
      totalMessagePages,
      oldestMessagePageFetched,
      messages,
      initialMessageFailed,
      savePaymentMethodFailed,
      fetchMessagesInProgress,
      fetchMessagesError,
      sendMessageInProgress,
      sendMessageError,
      sendReviewInProgress,
      sendReviewError,
      onFetchTimeSlots,
      onManageDisableScrolling,
      onShowMoreMessages,
      transactionRole,
      intl,
      onAcceptSale,
      onDeclineSale,
      acceptInProgress,
      declineInProgress,
      acceptSaleError,
      declineSaleError,
      onSubmitBookingRequest,
      monthlyTimeSlots,
      nextTransitions,
      onFetchTransactionLineItems,
      lineItems,
      fetchLineItemsInProgress,
      fetchLineItemsError,
      onJoinMeeting,
    } = this.props;
    const currentTransaction = ensureTransaction(transaction);
    const currentListing = ensureListing(currentTransaction.listing);
    const currentProvider = ensureUser(currentTransaction.provider);
    const currentCustomer = ensureUser(currentTransaction.customer);
    const isCustomer = transactionRole === 'customer';
    const isProvider = transactionRole === 'provider';
    const listingLoaded = !!currentListing.id;
    const listingDeleted = listingLoaded && currentListing.attributes.deleted;
    const iscustomerLoaded = !!currentCustomer.id;
    const isCustomerBanned = iscustomerLoaded && currentCustomer.attributes.banned;
    const isCustomerDeleted = iscustomerLoaded && currentCustomer.attributes.deleted;
    const isProviderLoaded = !!currentProvider.id;
    const isProviderBanned = isProviderLoaded && currentProvider.attributes.banned;
    const isProviderDeleted = isProviderLoaded && currentProvider.attributes.deleted;

    const stateDataFn = tx => {
      if (txIsEnquired(tx)) {
        const transitions = Array.isArray(nextTransitions)
          ? nextTransitions.map(transition => {
              return transition.attributes.name;
            })
          : [];
        const hasCorrectNextTransition =
          transitions.length > 0 && transitions.includes(TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY);
        return {
          headingState: HEADING_ENQUIRED,
          showBookingPanel: isCustomer && !isProviderBanned && hasCorrectNextTransition,
        };
      } else if (txIsPaymentPending(tx)) {
        return {
          headingState: HEADING_PAYMENT_PENDING,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txIsPaymentExpired(tx)) {
        return {
          headingState: HEADING_PAYMENT_EXPIRED,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txIsRequested(tx)) {
        return {
          headingState: HEADING_REQUESTED,
          showDetailCardHeadings: isCustomer,
          showSaleButtons: isProvider && !isCustomerBanned,
          showCalendar: true,
        };
      } else if (txIsRequestedOral(tx)) {
        return {
          headingState: HEADING_REQUESTED,
          showDetailCardHeadings: isCustomer,
          showSaleButtons: isProvider && !isCustomerBanned,
          showCalendar: true,
        };
      } else if (txIsPendingConfirmation(tx)) {
        return {
          headingState: HEADING_ACCEPTED,
          showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
          showCalendar: true,
        };
      } else if (txIsAccepted(tx)) {
        return {
          headingState: HEADING_ACCEPTED,
          showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
          showCalendar: true,
        };
      } else if (txIsAcceptedOral(tx)) {
        return {
          headingState: HEADING_ACCEPTED,
          showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
          showCalendar: true,
        };
      }
      // else if (txCustomerJoined1(tx)) {
      //   return {
      //     headingState: HEADING_ACCEPTED,
      //     isShortBooking: false,
      //     customer_joined: true,
      //     bookingAccepted: true,
      //   };
      // } else if (txProviderJoined1(tx)) {
      //   return {
      //     headingState: HEADING_ACCEPTED,
      //     isShortBooking: false,
      //     provider_joined: true,
      //     bookingAccepted: true,
      //   };
      // } else if (txBothJoined(tx)) {
      //   return {
      //     headingState: HEADING_ACCEPTED,
      //     isShortBooking: false,
      //     provider_joined: true,
      //     customer_joined: true,
      //     bookingAccepted: true,
      //   };
      // }
      else if (txIsExpired(tx)) {
        return {
          headingState: HEADING_EXPIRED,
          showDetailCardHeadings: isCustomer,
          allowProviderCancel: false,
          hideCalendars: true,
          cancelledOrDeclined: true,
        };
      } else if (txIsRescheduled(tx)) {
        return {
          headingState: HEADING_RESCHEDULED,
          showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
          showCalendar: true,
        };
      } else if (txIsDeclined(tx)) {
        return {
          headingState: HEADING_DECLINED,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txIsCanceled(tx)) {
        return {
          headingState: HEADING_CANCELED,
          showDetailCardHeadings: isCustomer,
        };
      } else if (txHasBeenDelivered(tx)) {
        return {
          headingState: HEADING_DELIVERED,
          showDetailCardHeadings: isCustomer,
          showAddress: isCustomer,
        };
      } else {
        return { headingState: 'unknown' };
      }
    };
    const stateData = stateDataFn(currentTransaction);

    const deletedListingTitle = intl.formatMessage({
      id: 'TransactionPanel.deletedListingTitle',
    });

    const {
      authorDisplayName,
      customerDisplayName,
      otherUserDisplayName,
      otherUserDisplayNameString,
    } = displayNames(currentUser, currentProvider, currentCustomer, intl);

    const { publicData, geolocation } = currentListing.attributes;
    const location = publicData && publicData.location ? publicData.location : {};
    const listingTitle = currentListing.attributes.deleted
      ? deletedListingTitle
      : currentListing.attributes.title;

    const unitType = config.bookingUnitType;
    const isNightly = unitType === LINE_ITEM_NIGHT;
    const isDaily = unitType === LINE_ITEM_DAY;

    const unitTranslationKey = isNightly
      ? 'TransactionPanel.perNight'
      : isDaily
      ? 'TransactionPanel.perDay'
      : 'TransactionPanel.perUnit';

    const price = currentListing.attributes.price;
    const bookingSubTitle = price ? `${formatMoney(intl, price)} ` : '';

    const firstImage =
      currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;

    const saleButtons = (
      <SaleActionButtonsMaybe
        showButtons={stateData.showSaleButtons}
        acceptInProgress={acceptInProgress}
        declineInProgress={declineInProgress}
        acceptSaleError={acceptSaleError}
        declineSaleError={declineSaleError}
        onAcceptSale={() => onAcceptSale(currentTransaction.id)}
        onDeclineSale={() => onDeclineSale(currentTransaction.id)}
      />
    );

    const showSendMessageForm =
      !isCustomerBanned && !isCustomerDeleted && !isProviderBanned && !isProviderDeleted;

    const sendMessagePlaceholder = intl.formatMessage(
      { id: 'TransactionPanel.sendMessagePlaceholder' },
      { name: otherUserDisplayNameString }
    );

    const sendingMessageNotAllowed = intl.formatMessage({
      id: 'TransactionPanel.sendingMessageNotAllowed',
    });

    const paymentMethodsPageLink = (
      <NamedLink name="PaymentMethodsPage">
        <FormattedMessage id="TransactionPanel.paymentMethodsPageLink" />
      </NamedLink>
    );

    const MS_SCOPES = ['user.read', 'calendars.ReadWrite'];

    const login_ms = async () => {
      try {
        await this.userAgentApplication.loginPopup({
          scopes: MS_SCOPES,
          prompt: 'select_account',
        });

        // After login, get the user's profile
        return await getUserProfile();
      } catch (err) {
        // this.setState({
        //   msOutlookCalenderLogin: false,
        //   user: {},
        //   error: this.normalizeError(err),
        // });
      }
    };
    const logout_ms = () => {
      this.userAgentApplication.logout();
    };

    const getAccessToken = async scopes => {
      try {
        const accounts = this.userAgentApplication.getAccount();
        console.log('119 accounts', accounts);
        if (accounts.length <= 0) throw new Error('login_required');

        var silentResult = await this.userAgentApplication.acquireTokenSilent({
          scopes: scopes,
          account: accounts[0],
        });
        return silentResult.accessToken;
      } catch (err) {
        // If a silent request fails, it may be because the user needs
        // to login or grant consent to one or more of the requested scopes
        if (this.isInteractionRequired(err)) {
          var interactiveResult = await this.userAgentApplication.acquireTokenPopup({
            scopes: scopes,
          });

          return interactiveResult.accessToken;
        } else {
          throw err;
        }
      }
    };

    const getUserProfile = async () => {
      try {
        var accessToken = await getAccessToken(MS_SCOPES);

        if (accessToken) {
          return accessToken;
        }
      } catch (err) {
        console.log(err);
      }
    };

    const addOutlookEvent = async () => {
      this.setState({ msInProgress: true });
      let { displayEnd, displayStart, seats } = currentTransaction.booking
        ? currentTransaction.booking.attributes
        : {};
      let { title } = currentTransaction.listing.attributes;
      const tzone = (displayStart + '').split('(')[1]?.split(')')[0];
      let event = {
        subject: title,
        location: { displayName: location.address },
        // description: 'Really great refreshments',
        start: {
          dateTime: new Date(new Date(displayStart)),
          timeZone: tzone,
        },
        end: {
          dateTime: new Date(new Date(displayEnd)),
          timeZone: tzone,
        },
        transactionId: currentTransaction.id.uuid,
      };

      let token;
      if (!this.state.accessTokenMS) {
        token = await login_ms();
      } else {
        token = this.state.accessTokenMS;
      }

      var graphEndpoint = 'https://graph.microsoft.com/v1.0/me/events';

      Axios({
        method: 'post',
        url: graphEndpoint,
        data: JSON.stringify(event),
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      })
        .then(resp => {
          //do something with response
          this.setState({ msReady: true, msInProgress: false, msDisable: true });
        })
        .catch(e => {
          this.setState({ msInProgress: false });
        });
    };

    const classes = classNames(rootClassName || css.root, className);

    const CLIENT_ID = '250414934125-bppk87i6vqilqe344dsffcdvlgj5ge5k.apps.googleusercontent.com';
    const API_KEY = 'AIzaSyBsDSbBejfmTSfD8JHlqCop0DxP8m-0WMM';
    const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
    const SCOPES = 'https://www.googleapis.com/auth/calendar';

    const handleGoogleCalendarClick = () => {
      let { displayEnd, displayStart } = currentTransaction.booking
        ? currentTransaction.booking.attributes
        : {};
      let { title, availabilityPlan } = currentTransaction.listing.attributes;

      let event = {
        summary: title,
        location: { displayName: location.address },
        // description: 'Really great refreshments',
        start: {
          dateTime: new Date(new Date(displayStart)),
        },
        end: {
          dateTime: new Date(new Date(displayEnd)),
        },
        transactionId: currentTransaction.id.uuid,
      };
      this.setState({ inProgress: true });
      const gapi = window.gapi;
      if (!displayStart || !displayEnd) {
        console.error('No start or end time found in event object');
        return;
      }

      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });

        gapi.client.load('calendar', 'v3', () => console.log('Done'));

        gapi.auth2
          .getAuthInstance()
          .signIn()
          .then(() => {
            let request = gapi.client.calendar.events.insert({
              calendarId: 'primary',
              resource: event,
            });

            request.execute(event => {
              this.setState({ inProgress: false, ready: true, gDisable: true });
              console.log('event', event);
              console.log('event link', event.htmlLink);
            });
          })
          .catch(e => {
            console.error(e);
            this.setState({
              inProgress: false,
            });
          });
      });
      // }
    };

    const category = currentListing.attributes.publicData.category;
    const listingType = currentListing.attributes.publicData.type;

    return (
      <div className={classes}>
        <div className={css.container}>
          <div className={css.txInfo}>
            {/* <DetailCardImage
              rootClassName={css.imageWrapperMobile}
              avatarWrapperClassName={css.avatarWrapperMobile}
              listingTitle={listingTitle}
              image={firstImage}
              provider={currentProvider}
              isCustomer={isCustomer}
              listingId={currentListing.id && currentListing.id.uuid}
              listingDeleted={listingDeleted}
            /> */}
            {/* {isProvider ? (
              <div className={css.avatarWrapperProviderDesktop}>
                <AvatarLarge user={currentCustomer} className={css.avatarDesktop} />
              </div>
            ) : null} */}

            <PanelHeading
              panelHeadingState={stateData.headingState}
              transactionRole={transactionRole}
              providerName={authorDisplayName}
              customerName={customerDisplayName}
              isCustomerBanned={isCustomerBanned}
              listingId={currentListing.id && currentListing.id.uuid}
              listingTitle={listingTitle}
              listingDeleted={listingDeleted}
            />

            <div className={css.bookingDetailsMobile}>
              <AddressLinkMaybe
                rootClassName={css.addressMobile}
                location={location}
                geolocation={geolocation}
                showAddress={stateData.showAddress}
              />
              <BreakdownMaybe transaction={currentTransaction} transactionRole={transactionRole} />

              {category !== 'customService' ? (
                <div className={css.jnbtncon}>
                  {stateData.headingState === 'accepted' ||
                  stateData.headingState === 'rescheduled' ? (
                    <PrimaryButton
                      inProgress={this.state.joinMeetingProgress}
                      className={css.joinMeetingBtn}
                      onClick={() => {
                        this.setState({ joinMeetingProgress: true });
                        // if (isCustomer) {
                        //   if (
                        //     txCustomerJoined1(currentTransaction) ||
                        //     txBothJoined(currentTransaction)
                        //   ) {
                        //     this.goToConference(currentTransaction);
                        //   } else {
                        //     onJoinMeeting(currentTransaction.id, isCustomer)
                        //       .then(res => {
                        //         this.goToConference(currentTransaction);
                        //       })
                        //       .catch(e => {
                        //         console.error(e);
                        //       });
                        //   }
                        // } else {
                        //   if (listingType === 'unsolicited') {
                        //     axios
                        //       .get(
                        //         `${apiBaseUrl()}/api/unsolicitedTransition/${
                        //           currentListing.id.uuid
                        //         }`
                        //       )
                        //       .then(resp => {
                        //         if (resp.data.length > 0) {
                        //           resp.data.map(d => {
                        //             if (d !== currentTransaction.id) {
                        //               onJoinMeeting(d, false);
                        //             }
                        //           });
                        //           onJoinMeeting(currentTransaction.id, isCustomer)
                        //             .then(res => {
                        //               this.goToConference(currentTransaction);
                        //             })
                        //             .catch(e => {
                        //               console.error(e);
                        //             });
                        //         } else {
                        //           this.goToConference(currentTransaction);
                        //         }
                        //       });
                        //   } else {
                        //     if (
                        //       txProviderJoined1(currentTransaction) ||
                        //       txBothJoined(currentTransaction)
                        //     ) {
                        //       this.goToConference(currentTransaction);
                        //     } else {
                        //       onJoinMeeting(currentTransaction.id, isCustomer)
                        //         .then(res => {
                        //           this.goToConference(currentTransaction);
                        //         })
                        //         .catch(e => {
                        //           console.error(e);
                        //         });
                        //     }
                        //   }
                        // }
                        this.goToConference(currentTransaction);
                      }}
                    >
                      Join Meeting
                    </PrimaryButton>
                  ) : (
                    ''
                  )}
                </div>
              ) : (
                ''
              )}
            </div>

            {savePaymentMethodFailed ? (
              <p className={css.genericError}>
                <FormattedMessage
                  id="TransactionPanel.savePaymentMethodFailed"
                  values={{ paymentMethodsPageLink }}
                />
              </p>
            ) : null}
            <FeedSection
              rootClassName={css.feedContainer}
              currentTransaction={currentTransaction}
              currentUser={currentUser}
              fetchMessagesError={fetchMessagesError}
              fetchMessagesInProgress={fetchMessagesInProgress}
              initialMessageFailed={initialMessageFailed}
              messages={messages}
              oldestMessagePageFetched={oldestMessagePageFetched}
              onOpenReviewModal={this.onOpenReviewModal}
              onShowMoreMessages={() => onShowMoreMessages(currentTransaction.id)}
              totalMessagePages={totalMessagePages}
            />
            {showSendMessageForm ? (
              <SendMessageForm
                formId={this.sendMessageFormName}
                rootClassName={css.sendMessageForm}
                messagePlaceholder={sendMessagePlaceholder}
                inProgress={sendMessageInProgress}
                sendMessageError={sendMessageError}
                onFocus={this.onSendMessageFormFocus}
                onBlur={this.onSendMessageFormBlur}
                onSubmit={this.onMessageSubmit}
              />
            ) : (
              <div className={css.sendingMessageNotAllowed}>{sendingMessageNotAllowed}</div>
            )}

            <div className={css.p0btn}>
              {stateData.showCalendar ? (
                <>
                  <PrimaryButton
                    className={css.googleButton}
                    ready={this.state.ready}
                    inProgress={this.state.inProgress}
                    onClick={handleGoogleCalendarClick}
                    disabled={this.state.gDisable}
                  >
                    Add This Order To Google Calendar
                  </PrimaryButton>
                  <PrimaryButton
                    className={css.googleButton}
                    ready={this.state.msReady}
                    inProgress={this.state.msInProgress}
                    onClick={addOutlookEvent}
                    disabled={this.state.msDisable}
                  >
                    Add This Order To Outlook Calendar
                  </PrimaryButton>
                </>
              ) : (
                ''
              )}
            </div>

            {/* {this.state.selectedFile ? (
              <div className={css.fileSelector}>
                <div>{this.state.selectedFile.name}</div>
                <span className={css.fileClearIcon}>
                  <AiOutlineCloseCircle
                    size={20}
                    onClick={() =>
                      this.setState({
                        selectedFile: null,
                      })
                    }
                  />
                </span>
              </div>
            ) : null}
            <PrimaryButton
              className={css.addbtn}
              inProgress={this.state.fileUploadInProgress}
              ready={this.state.fileUploadSuccess}
              onClick={() =>
                this.state.selectedFile ? this.sendFile() : this.fileInputRef.current.click()
              }
            >
              {this.state.selectedFile
                ? 'Send'
                : this.state.fileUploadInProgress
                ? `Uploading ${this.state.fileUploadProgress}%`
                : 'Add file'}
            </PrimaryButton>
            {this.state.fileUploadSuccess ? (
              <div className={css.successMessage}>File uploaded Successfully</div>
            ) : null}
            {this.state.fileUploadError ? (
              <div className={css.failMessage}>{this.state.fileUploadError}</div>
            ) : null}
            <input
              style={{ display: 'none' }}
              ref={this.fileInputRef}
              type="file"
              // accept=".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document, .png, .jpg, .jpeg, .pdf, .xlsx"
              onChange={this.onFileUpload}
            />

            {stateData.showSaleButtons ? (
              <div className={css.mobileActionButtons}>{saleButtons}</div>
            ) : null} */}
          </div>

          <div className={css.asideDesktop}>
            <div className={css.detailCard}>
              {/* <DetailCardImage
                avatarWrapperClassName={css.avatarWrapperDesktop}
                listingTitle={listingTitle}
                image={firstImage}
                provider={currentProvider}
                isCustomer={isCustomer}
                listingId={currentListing.id && currentListing.id.uuid}
                listingDeleted={listingDeleted}
              /> */}

              {/* <DetailCardHeadingsMaybe
                showDetailCardHeadings={stateData.showDetailCardHeadings}
                listingTitle={listingTitle}
                subTitle={bookingSubTitle}
                location={location}
                geolocation={geolocation}
                showAddress={stateData.showAddress}
              /> */}
              {stateData.showBookingPanel ? (
                <BookingPanel
                  className={css.bookingPanel}
                  titleClassName={css.bookingTitle}
                  isOwnListing={false}
                  listing={currentListing}
                  title={listingTitle}
                  subTitle={bookingSubTitle}
                  authorDisplayName={authorDisplayName}
                  onSubmit={onSubmitBookingRequest}
                  onManageDisableScrolling={onManageDisableScrolling}
                  monthlyTimeSlots={monthlyTimeSlots}
                  onFetchTimeSlots={onFetchTimeSlots}
                  onFetchTransactionLineItems={onFetchTransactionLineItems}
                  lineItems={lineItems}
                  fetchLineItemsInProgress={fetchLineItemsInProgress}
                  fetchLineItemsError={fetchLineItemsError}
                />
              ) : null}

              <div className={css.breakdownContainer}>
                <BreakdownMaybe
                  transaction={currentTransaction}
                  transactionRole={transactionRole}
                />
                {category !== 'customService' ? (
                  <div className={css.jnbtncon}>
                    {stateData.headingState === 'accepted' ||
                    stateData.headingState === 'rescheduled' ? (
                      <PrimaryButton
                        inProgress={this.state.joinMeetingProgress}
                        className={css.joinMeetingBtn}
                        onClick={() => {
                          this.setState({ joinMeetingProgress: true });
                          // if (isCustomer) {
                          //   if (
                          //     txCustomerJoined1(currentTransaction) ||
                          //     txBothJoined(currentTransaction)
                          //   ) {
                          //     this.goToConference(currentTransaction);
                          //   } else {
                          //     onJoinMeeting(currentTransaction.id, isCustomer)
                          //       .then(res => {
                          //         this.goToConference(currentTransaction);
                          //       })
                          //       .catch(e => {
                          //         console.error(e);
                          //       });
                          //   }
                          // } else {
                          //   if (listingType === 'unsolicited') {
                          //     axios
                          //       .get(
                          //         `${apiBaseUrl()}/api/unsolicitedTransition/${
                          //           currentListing.id.uuid
                          //         }`
                          //       )
                          //       .then(resp => {
                          //         if (resp.data.length > 0) {
                          //           resp.data.map(d => {
                          //             if (d !== currentTransaction.id) {
                          //               onJoinMeeting(d, false);
                          //             }
                          //           });
                          //           onJoinMeeting(currentTransaction.id, isCustomer)
                          //             .then(res => {
                          //               this.goToConference(currentTransaction);
                          //             })
                          //             .catch(e => {
                          //               console.error(e);
                          //             });
                          //         } else {
                          //           this.goToConference(currentTransaction);
                          //         }
                          //       });
                          //   } else {
                          //     if (
                          //       txProviderJoined1(currentTransaction) ||
                          //       txBothJoined(currentTransaction)
                          //     ) {
                          //       this.goToConference(currentTransaction);
                          //     } else {
                          //       onJoinMeeting(currentTransaction.id, isCustomer)
                          //         .then(res => {
                          //           this.goToConference(currentTransaction);
                          //         })
                          //         .catch(e => {
                          //           console.error(e);
                          //         });
                          //     }
                          //   }
                          // }
                          this.goToConference(currentTransaction);
                        }}
                      >
                        Join Meeting
                      </PrimaryButton>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  ''
                )}
              </div>

              {/* {stateData.showSaleButtons ? (
                <div className={css.desktopActionButtons}>{saleButtons}</div>
              ) : null} */}
            </div>
          </div>
        </div>
        <ReviewModal
          id="ReviewOrderModal"
          isOpen={this.state.isReviewModalOpen}
          onCloseModal={() => this.setState({ isReviewModalOpen: false })}
          onManageDisableScrolling={onManageDisableScrolling}
          onSubmitReview={this.onSubmitReview}
          revieweeName={otherUserDisplayName}
          reviewSent={this.state.reviewSubmitted}
          sendReviewInProgress={sendReviewInProgress}
          sendReviewError={sendReviewError}
        />
      </div>
    );
  }
}

TransactionPanelComponent.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  acceptSaleError: null,
  declineSaleError: null,
  fetchMessagesError: null,
  initialMessageFailed: false,
  savePaymentMethodFailed: false,
  sendMessageError: null,
  sendReviewError: null,
  monthlyTimeSlots: null,
  nextTransitions: null,
  lineItems: null,
  fetchLineItemsError: null,
};

TransactionPanelComponent.propTypes = {
  rootClassName: string,
  className: string,

  currentUser: propTypes.currentUser,
  transaction: propTypes.transaction.isRequired,
  totalMessagePages: number.isRequired,
  oldestMessagePageFetched: number.isRequired,
  messages: arrayOf(propTypes.message).isRequired,
  initialMessageFailed: bool,
  savePaymentMethodFailed: bool,
  fetchMessagesInProgress: bool.isRequired,
  fetchMessagesError: propTypes.error,
  sendMessageInProgress: bool.isRequired,
  sendMessageError: propTypes.error,
  sendReviewInProgress: bool.isRequired,
  sendReviewError: propTypes.error,
  onFetchTimeSlots: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onShowMoreMessages: func.isRequired,
  onSendMessage: func.isRequired,
  onSendReview: func.isRequired,
  onSubmitBookingRequest: func.isRequired,
  monthlyTimeSlots: object,
  nextTransitions: array,

  // Sale related props
  onAcceptSale: func.isRequired,
  onDeclineSale: func.isRequired,
  acceptInProgress: bool.isRequired,
  declineInProgress: bool.isRequired,
  acceptSaleError: propTypes.error,
  declineSaleError: propTypes.error,

  // line items
  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape,
};

const TransactionPanel = injectIntl(TransactionPanelComponent);

export default TransactionPanel;
