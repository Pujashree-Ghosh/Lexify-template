import React, { useState, createContext, useEffect } from 'react';
import { styled, Theme } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from '../../util/reactIntl';
import MenuBar from './../../twilio/components/MenuBar/MenuBar';
import MobileTopMenuBar from './../../twilio/components/MobileTopMenuBar/MobileTopMenuBar';
import PreJoinScreens from '../../twilio/components/PreJoinScreens/PreJoinScreens';
import ReconnectingNotification from './../../twilio/components/ReconnectingNotification/ReconnectingNotification';
import Room from '../../twilio/components/Room/Room';
import jwt from 'jsonwebtoken';
import useHeight from '../../twilio/hooks/useHeight/useHeight';
import useRoomState from '../../twilio/hooks/useRoomState/useRoomState';
import useParticipants from '../../twilio/hooks/useParticipants/useParticipants';
import Timer from './Timer';
import moment, { unix } from 'moment';
import { timeOfDayFromTimeZoneToLocal } from '../../util/dates';
import SignalHelper from '../../util/signalHelper';
import { print } from '../../util/data';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import Countdown from 'react-countdown';
import css from './Meeting.css';
import { loadData } from '../ListingPage/ListingPage.duck';
import { types as sdkTypes } from '../../util/sdkLoader';

const { UUID } = sdkTypes;
import config from '../../config';
import { apiBaseUrl } from '../../util/api';
// import { MonetizationOn } from '@material-ui/icons';
import io from 'socket.io-client';
const secret = config.secretCode;
const timeZone = moment.tz.guess();
const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: '1fr auto',
});

const Main = styled('main')(({ theme }) => ({
  overflow: 'hidden',
  paddingBottom: `${theme.footerHeight}px`, // Leave some space for the footer
  background: 'black',
  [theme.breakpoints.down('sm')]: {
    paddingBottom: `${theme.mobileFooterHeight + theme.mobileTopBarHeight}px`, // Leave some space for the mobile header and footer
  },
}));
export const ListingContext = createContext(null);
const Meeting = props => {
  const {
    currentUser,
    match: { params },
  } = props;
  const decoded = jwt.verify(params.id, secret);

  // console.log({ decoded }, props.history);
  // const startTime = decoded.startTime;
  // const endTime = decoded.endTime;

  // const isDev = false;

  //button click
  let startTime = decoded.startTime;

  let endTime = decoded.endTime;
  // endTime = moment(endTime).add('40', 'm');

  const transactionId = decoded.transactionId;

  const listingId = decoded.listingId;
  const afterBufferTime = decoded.afterBufferTime;

  const listingTitle = decoded.listingTitle;
  // const isShortBooking = isDev ? false : decoded.shortBooking;

  // const moderator = decoded.moderator;

  const role = decoded.role;
  const currentTime = moment();

  const meetingExpTimeDuration =
    moment(startTime)
      .add('15', 'm')
      .unix() - currentTime.unix();
  const meetingExpTime = moment(startTime).add('15', 'm');
  const isCustomer = role === 'customer';
  const isProvider = role === 'provider';
  const roomState = useRoomState();
  const [name, setName] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isActive, setActive] = useState(false);
  const [meetingState, setMeetingState] = useState(roomState);
  let socket;
  const [customerEnterInWaitingRoom, setcustomerEnterInWaitingRoom] = useState(isCustomer);
  const [customerEnterInMeetingRoom, setcustomerEnterInMeetingRoom] = useState(false);
  const [providerEnterInWaitingRoom, setproviderEnterInWaitingRoom] = useState(isProvider);
  const [providerEnterInMeetingRoom, setproviderEnterInMeetingRoom] = useState(true);
  const [isExtended, setIsExtended] = useState(true);
  const [providerJoinedAt, setproviderJoinedAt] = useState(0);
  const [remainingTime, setremainingTime] = useState(null);
  const [remainingMeetingTime, setremainingMeetingTime] = useState(null);

  const [meetingExpired, setMeetingExpired] = useState(
    false
    // !decoded.actualStartTime && moment().isAfter(meetingExpTime)
  );
  const [actualStartTime, setActualStartTime] = useState(null);
  const [customerJoinTime, setCustomerJoinTime] = useState(decoded.customerJoinTime || 0);
  // const [actualStartTime, setActualStartTime] = useState(tempStartTime);
  const [actualEndTime, setActualEndTime] = useState(endTime);

  // const [customerEnter, setCustomerEnter] = useState(isCustomer || (isProvider && actualStartTime));
  // const {
  //   currentUser,
  //   match: { params },
  // } = props;
  const userId = currentUser && currentUser.id.uuid;
  const suffiex =
    userId &&
    userId
      .split('')
      .splice(0, 3)
      .join('');

  const displayName =
    currentUser && currentUser.attributes.profile.displayName
      ? `${currentUser.attributes.profile.firstName} ${currentUser.attributes.profile.lastName}-${suffiex}`
      : '';

  // Here we would like the height of the main container to be the height of the viewport.
  // On some mobile browsers, 'height: 100vh' sets the height equal to that of the screen,
  // not the viewport. This looks bad when the mobile browsers location bar is open.
  // We will dynamically set the height with 'window.innerHeight', which means that this
  // will look good on mobile browsers even after the location bar opens or closes.
  const height = useHeight();

  const onCancel = () => {
    // console.log('object');
    const path = isProvider ? `/sale/${transactionId}/details` : `/order/${transactionId}/details`;
    props.history.push(path);
  };
  // const moderator = 'Surajit T';

  // console.log({ role });

  // const meetingTimeDuration = moment().isSameOrBefore(startTime)
  //   ? moment(endTime).diff(moment(startTime), 'm')
  //   : moment(endTime).diff(moment(startTime).add(5, 'm'), 'm');
  const roomName = listingId;

  // let estEndTime = moment(actualStartTime).add(meetingTimeDuration, 'm');
  // console.log(
  //   'startend diff',
  //   moment(endTime) - moment(startTime),
  //   moment(startTime).format('lll'),
  //   moment(endTime).format('lll'),
  //   'actualStarttime',
  //   moment(actualStartTime).format('lll'),
  //   moment(actualStartTime).isBefore(moment(startTime))
  //   // 'estEndTime',
  //   // moment(estEndTime).format('lll')
  // );

  const localStartTime = timeOfDayFromTimeZoneToLocal(startTime, timeZone);
  const localEndTime = timeOfDayFromTimeZoneToLocal(endTime, timeZone);

  const timerTimeCalculator = (startTime, endTime) => {
    const duration = moment(endTime).unix() - moment(startTime).unix();
    // console.log(175, duration);
    const m = parseInt(duration / 60);
    const s = parseInt(duration % 60);
    // .clone()
    // .format('ss');
    // print('timerTimeCalculator', startTime, endTime, duration, m, s);
    return { m, s };
  };
  // let waitingTimerData;
  // const meetingTimerData = timerTimeCalculator(currentTime, meetingTimeEnd);

  const isMeetingStart = () => {
    if (localEndTime <= currentTime) {
      setMeetingExpired(true);
      return;
    }
    if (localStartTime <= currentTime && localEndTime >= currentTime) {
      setActive(true);
      // SignalHelper.emit('meeting', JSON.stringify({ isStart: true }));
    } else {
      if (localStartTime > currentTime) {
        // if (isShortBooking) {
        //   setActive(true);
        //   return;
        // }
        let startCount = localStartTime - currentTime;
        let startCountTimer = setTimeout(() => {
          // let endCount = localEndTime - moment();
          // print('endCount', endCount);
          // setTimeout(() => {
          //   print('endCount1', endCount);
          //   setActive(false);
          // }, endCount);
          if (!isActive) setActive(true);
        }, startCount);
      }
    }
  };

  if (displayName && !isLoading) {
    setLoading(true);
    setName(displayName);
  }
  // const moderatorEvent = () => {
  //   print('557 mederator Event');
  //   // if (!isProvider) {
  //   // console.log('moderator enter');
  //   SignalHelper.on('moderator', data => {
  //     print('123 mederator Meeting', data);
  //     // if(JSON.parse(data).isEnter)
  //     data = JSON.parse(data);
  //     // setModeratorEnter(data.isEnter);
  //     setproviderEnterInMeetingRoom(data.isEnter);
  //   });
  //   // } else {
  //   //   setModeratorEnter(true);
  //   // }
  // };
  const customerEvent = () => {
    print('557 customer Event');
    // if (!isCustomer) {
    // console.log('customer enter');
    SignalHelper.on('customer', data => {
      print('123 customer Meeting', data);
      // if(JSON.parse(data).isEnter)
      data = JSON.parse(data);
      // setCustomerEnter(data.isEnter);
      setcustomerEnterInMeetingRoom(data.isEnter);
    });
  };

  useEffect(() => {
    let timeout;

    // if (
    //   isCustomer &&
    //   !providerJoinedAt &&
    //   providerJoinedAt !== 0 &&
    //   currentTime.isAfter(meetingExpTime)
    // ) {
    //   console.log('15111 A');
    //   setMeetingExpired(true);
    //   return;
    // }
    // if (
    //   isProvider &&
    //   !customerJoinTime &&
    //   customerJoinTime !== 0 &&
    //   currentTime.isAfter(meetingExpTime)
    // ) {
    //   console.log('15111 B');
    //   setMeetingExpired(true);
    //   return;
    // }
    if (isCustomer) {
      let timeout;
      if (actualEndTime && moment().isAfter(moment(actualEndTime))) {
        return;
      }
      if (providerEnterInWaitingRoom || providerJoinedAt) {
        setMeetingExpired(false);
        clearTimeout(timeout);
        setremainingTime(null);
        if (actualEndTime) {
          setremainingMeetingTime(timerTimeCalculator(moment(), actualEndTime));
          let meetingEndDuration = moment(actualEndTime).unix() - moment().unix();
          // console.log({ meetingEndDuration });
        }
      } else if (
        !providerEnterInWaitingRoom &&
        !providerJoinedAt &&
        providerJoinedAt !== 0 &&
        currentTime.diff(meetingExpTime) < 0
      ) {
        setremainingTime(meetingExpTime);
      }
    } else {
      // let timeout;
      if (customerJoinTime) {
        if (actualEndTime && moment().isAfter(moment(actualEndTime))) {
          return;
        }
        clearTimeout(timeout);
        setMeetingExpired(false);
        setremainingTime(null);
        if (actualEndTime) {
          setremainingMeetingTime(timerTimeCalculator(moment(), actualEndTime));
          let meetingEndDuration = moment(actualEndTime).unix() - moment().unix();
          timeout = setTimeout(() => {
            //display expired msg
            //optional->disconnect if connected
            setTimeout(() => {
              setMeetingExpired(true);
            }, 3000);
          }, meetingEndDuration * 1000);
        }
      } else if (!customerJoinTime && currentTime.diff(meetingExpTime) < 0) {
        // setremainingTime(timerTimeCalculator(moment(), meetingExpTime));
        setremainingTime(meetingExpTime);
        // timeout = setTimeout(() => {
        //   //display expired msg
        //   //optional->disconnect if connected
        //   // setTimeout(() => {
        //   console.log('15111 D');
        //   setMeetingExpired(true);
        //   setActive(false);
        //   // }, 3000);
        // }, meetingExpTimeDuration * 1000 + 3000);
      }
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [
    isCustomer,
    providerEnterInWaitingRoom,
    actualStartTime,
    customerJoinTime,
    isProvider,
    providerJoinedAt,
    actualEndTime,
  ]);

  useEffect(() => {
    SignalHelper.on('message', data => console.log('123 messageuseRoomState', data));
    SignalHelper.on('timer', data => {
      const timerData = JSON.parse(data);
      if (timerData.status === 'waiting_duration') {
        setActive(false);
        setMeetingState('disconnected');
        setMeetingExpired(true);
      }
      if (timerData.status === 'meeting_duration') {
        setActive(false);
        setMeetingState('disconnected');
        setMeetingExpired(true);
      }
    });
  }, []);
  useEffect(() => {
    // moderatorEvent();
    customerEvent();
  }, []);

  // useEffect(() => {
  //   if (displayName && displayName === moderator) {
  //     // setModeratorEnter(true);
  //   }
  // }, [displayName]);
  useEffect(() => {
    isMeetingStart();
  }, []);

  useEffect(() => {
    let timeOut;
    if (actualEndTime && moment().isAfter(moment(actualEndTime))) {
      setMeetingExpired(true);
    } else {
      let meetingEndDuration = moment(actualEndTime).unix() - moment().unix();
      timeOut = setTimeout(() => {
        //display expired msg
        //optional->disconnect if connected
        setTimeout(() => {
          if (roomState !== 'connected') setMeetingExpired(true);
        }, 1000);
      }, meetingEndDuration * 1000);
    }
    return () => {
      clearTimeout(timeOut);
    };
  }, [actualEndTime, roomState]);

  useEffect(() => {
    const backend_server = apiBaseUrl();
    socket = io(backend_server, {
      query: {
        roomId: listingId,
        // role,
        // ...(decoded.actualStartTime ? { actualStartTime: decoded.actualStartTime } : {}),
        // ...(decoded.customerJoinTime ? { customerJoinTime: decoded.customerJoinTime } : {}),
        // maxStartTime: new Date(meetingExpTime).getTime(),
        // customerJoinTime
      },
    });
    if (typeof window !== undefined) {
      window.socket = socket;
    }
    //   socket.on(
    //     'customer-connected',
    //     ({
    //       providerJoinedAt,
    //       customerJoinedAt,
    //       isProviderJoinedAgain,
    //       isCustomerJoinedAgain,
    //       actualStartTime,
    //       customerJoinTime: customerJoinTimeArg,
    //     }) => {
    //       console.log('socket-->>', 'customer connected');
    //       setcustomerEnterInWaitingRoom(true);
    //       // if(isC)
    //       // setCustomerEnter(true);
    // setproviderJoinedAt(providerJoinedAt);
    //       isMeetingStart();
    //       // if (isProvider) {
    //       console.log('397 B');
    //       setActualStartTime(actualStartTime);
    //       if (actualStartTime) {
    //         let actEndTime = moment(actualStartTime).add(meetingTimeDuration, 'm');
    //         setActualEndTime(actEndTime);
    //         // let meetingEndDuration = actEndTime.unix() - moment().unix();
    //         // let timeout = setTimeout(() => {
    //         //   //display expired msg
    //         //   //optional->disconnect if connected
    //         //   setTimeout(() => {
    //         //     console.log('15111 F');
    //         //     setMeetingExpired(true);
    //         //   }, 3000);
    //         // }, meetingEndDuration * 1000);
    //       }
    //       if (customerJoinTimeArg) {
    //         setCustomerJoinTime(customerJoinTimeArg);
    //       }
    //       // }
    //     }
    //   );
    //   socket.on('customer-disconnected', () => {
    //     console.log('socket-->>', 'customer connected');
    //     setcustomerEnterInWaitingRoom(false);
    //   });
    //   socket.on('provider-disconnected', () => {
    //     console.log('socket-->>', 'customer connected');
    //     setproviderEnterInWaitingRoom(false);
    //   });
    //   socket.on(
    //     'provider-connected',
    //     ({
    //       providerJoinedAt,
    //       customerJoinedAt,
    //       isProviderJoinedAgain,
    //       isCustomerJoinedAgain,
    //       actualStartTime,
    //       customerJoinTime,
    //       isExtended,
    //     }) => {
    //       console.log('socket-->>', 'provider connected');
    //       setproviderEnterInWaitingRoom(true);
    //       setIsExtended(isExtended);
    //       // setModeratorEnter(true);
    //       isMeetingStart();
    //       setproviderJoinedAt(providerJoinedAt);
    //       // if (isCustomer) {
    //       if (actualStartTime) {
    //         console.log('397 C');
    //         setActualStartTime(actualStartTime);
    //       }
    //       // }
    //       // if (customerJoinTime) {
    //       setCustomerJoinTime(customerJoinTime);
    //       // }
    //     }
    //   );

    //   socket.on('meeting', data => {
    //     console.log('signalhelper meeting', data);
    //     // data = JSON.parse(data);
    //     const actualStartTimeFromServer = data.actualStartTime;
    //     if (data.status === 'close') {
    //       console.log('close');
    //       // if (!isProvider && moderatorEnter) setModeratorEnter(false);
    //       // setremainingMeetingTime(null);
    //       if (!data.isProvider) {
    //         // setCustomerEnter(false);
    //         setcustomerEnterInMeetingRoom(false);
    //       } else {
    //         // setModeratorEnter(false);
    //         setproviderEnterInMeetingRoom(false);
    //       }
    //       setMeetingState('disconnected');
    //       // if (estEndTime <= moment().format()) {
    //       //   setActive(false);
    //       // }
    //     } else if (data.status === 'open') {
    //       console.log(223, { data });
    //       if (data.actualStartTime) {
    //         console.log('397 D');
    //         setActualStartTime(data.actualStartTime);
    //       }
    //       if (!data.isProvider) {
    //         // setCustomerEnter(true);
    //         setcustomerEnterInMeetingRoom(true);
    //       } else {
    //         // setModeratorEnter(true);
    //         setproviderEnterInMeetingRoom(true);
    //       }
    //       setMeetingState('connected');

    //       let timeout,
    //         actEndTime = moment(actualStartTimeFromServer).add(meetingTimeDuration, 'm');
    //       setActualEndTime(actEndTime);
    //       // setremainingMeetingTime(timerTimeCalculator(moment(), actEndTime));
    //       // let meetingEndDuration = actEndTime.unix() - moment().unix();
    //       // console.log({ meetingEndDuration });
    //       // timeout = setTimeout(() => {
    //       //   //display expired msg
    //       //   //optional->disconnect if connected
    //       //   setTimeout(() => {
    //       //     console.log('15111 F');
    //       //     setMeetingExpired(true);
    //       //   }, 3000);
    //       // }, meetingEndDuration * 1000);
    //     }
    //   });
    //   socket.on('meeting-time-extend', time => {
    //     setIsExtended(true);
    //     setActualEndTime(time);
    //   });
    //   // socket.on('connection', socket => {
    //   //   // socket.broadcast.emit('hi');
    //   //   console.log({ socket });

    //   // });
    // }, []);

    // const extendMeeting = () => {
    //   window.socket && window.socket.emit('meeting-time-extend', moment(actualEndTime).add(5, 'm'));
    //   setActualEndTime(moment(actualEndTime).add(5, 'm'));
    // };
    // console.log('meeting 390', { isProvider, isActive });
    // // print('123 isactive before return ', isActive);
    // console.log('397 A', {
    //   customerEnterInWaitingRoom,
    //   providerEnterInWaitingRoom,
    //   customerEnterInMeetingRoom,
    //   providerEnterInMeetingRoom,
    //   roomState,
    //   isActive,
    //   actualStartTime: actualStartTime && moment(actualStartTime).format('lll'),
    //   decoded: decoded,
    //   actualEndTime: actualEndTime && moment(actualEndTime).format('lll'),
    //   remainingMeetingTime,
    //   meetingExpired,
    //   customerJoinTime,
    //   meetingExpTime: moment(meetingExpTime).format('lll'),
    //   remainingTime,
    //   providerJoinedAt,
  });

  return (
    <ListingContext.Provider
      value={{
        startTime,
        endTime,
        transactionId,
        listingId,
        listingTitle,
        // isMeetingDisbled,
        isProvider,
        // moderator,
      }}
    >
      <Container style={{ height }}>
        {meetingState === 'disconnected' ? setMeetingState('connected') : null}
        {roomState === 'disconnected' ? (
          <div>
            <PreJoinScreens
              roomName={roomName}
              displayName={name}
              startTime={startTime}
              endTime={endTime}
              listingTitle={listingTitle}
              isProvider={isProvider}
              // socket={socket}
              isMeetingDisbled={
                !isActive ||
                meetingExpired ||
                (isCustomer && !providerEnterInMeetingRoom) ||
                (isProvider && !customerJoinTime)
              }
              providerEnterInMeetingRoom={providerEnterInMeetingRoom}
              customerEnterInWaitingRoom={customerEnterInWaitingRoom}
              meetingExpired={meetingExpired}
              onCancel={onCancel}
            />
            {/* {remainingTime && (
              <Timer
                initialMinute={remainingTime && remainingTime.m}
                initialSeconds={remainingTime && remainingTime.s}
                sub={''}
                status={'waiting_duration'}
              />
            )} */}
            {/* {remainingTime && (
              <Countdown
                date={remainingTime}
                // date={Date.now() + 2000}
                // intervalDelay={0}
                // precision={3}
                daysInHours={true}
                renderer={props => (
                  <div className={css.timer}>
                    {props.hours === 0 && props.minutes === 0 && props.seconds === 0 ? null : (
                      <h1>
                        {props.hours}:{props.minutes}:
                        {props.seconds < 10 ? `0${props.seconds}` : props.seconds}
                      </h1>
                    )}
                  </div>
                )}
                // onTick={prop => console.log(prop, 7566)}
                // onComplete={() => {
                //   console.log('stopped');
                //   SignalHelper.emit(
                //     'timer',
                //     JSON.stringify({ message: 'timer end', status: 'waiting_duration' })
                //   );
                // }}
              />
            )} */}
          </div>
        ) : providerEnterInMeetingRoom ? (
          <Main>
            <ReconnectingNotification />
            <Countdown
              date={moment(actualEndTime)
                .clone()
                .add(afterBufferTime, 'm')}
              daysInHours={true}
              renderer={props => (
                <div className={css.timer}>
                  {/* {props.hours === 0 && props.minutes === 0 && props.seconds === 0 ? null : (
                    <div className="timerMessage">
                      <h1>
                        {moment(currentTime).isAfter(actualEndTime)
                          ? ' Buffer time has started '
                          : ''}
                        {props.hours}:{props.minutes}:
                        {props.seconds < 10 ? `0${props.seconds}` : props.seconds}
                      </h1>
                    </div>
                  )} */}
                </div>
              )}
              onComplete={() => {
                console.log('stopped');
                SignalHelper.emit(
                  'timer',
                  JSON.stringify({ message: 'timer end', status: 'meeting_duration' })
                );
              }}
            />

            <MobileTopMenuBar isProvider={isProvider} />
            <Room />
            {/* {remainingMeetingTime && (
              <Timer
                initialMinute={remainingMeetingTime && remainingMeetingTime.m}
                initialSeconds={remainingMeetingTime && remainingMeetingTime.s}
                sub={''}
                status={'meeting_duration'}
              />
            )} */}
            {/* {actualEndTime && (
              <Countdown
                date={
                  !customerJoinTime && currentTime.diff(meetingExpTime) < 0
                    ? meetingExpTime
                    : actualEndTime
                }
                // date={Date.now() + 2000}
                // intervalDelay={0}
                // precision={3}
                daysInHours={true}
                renderer={props => (
                  <div className={css.timer}>
                    {props.hours === 0 && props.minutes === 0 && props.seconds === 0 ? null : (
                      <h1>
                        {props.hours}:{props.minutes}:
                        {props.seconds < 10 ? `0${props.seconds}` : props.seconds}
                      </h1>
                    )}
                  </div>
                )}
                // onTick={prop => console.log(prop, 7566)}
                onComplete={() => {
                  console.log('stopped');
                  SignalHelper.emit(
                    'timer',
                    JSON.stringify({ message: 'timer end', status: 'meeting_duration' })
                  );
                }}
              />
            )} */}
            <MenuBar
              isProvider={isProvider}
              // extendMeeting={extendMeeting}
              // isExtended={isExtended}
              // isShortBooking={isShortBooking}
            />
          </Main>
        ) : (
          <div>
            <PreJoinScreens
              roomName={roomName}
              displayName={name}
              startTime={startTime}
              endTime={endTime}
              listingTitle={listingTitle}
              isProvider={isProvider}
              // socket={socket}
              isMeetingDisbled={
                !isActive || meetingExpired || (isCustomer && !providerEnterInMeetingRoom)
              }
              providerEnterInMeetingRoom={providerEnterInMeetingRoom}
              customerEnterInWaitingRoom={customerEnterInWaitingRoom}
              meetingExpired={meetingExpired}
              onCancel={onCancel}
            />
            {/* {remainingTime && (
              <Timer
                initialMinute={remainingTime && remainingTime.m}
                initialSeconds={remainingTime && remainingTime.s}
                sub={''}
                status={'waiting_duration'}
              />
            )} */}
            {/* {remainingTime && (
              <Countdown
                date={remainingTime}
                // date={Date.now() + 2000}
                // intervalDelay={0}
                // precision={3}
                daysInHours={true}
                renderer={props => (
                  <div className={css.timer}>
                    {props.hours === 0 && props.minutes === 0 && props.seconds === 0 ? null : (
                      <h1>
                        {props.hours}:{props.minutes}:
                        {props.seconds < 10 ? `0${props.seconds}` : props.seconds}
                      </h1>
                    )}
                  </div>
                )}
                // onTick={prop => console.log(prop, 7566)}
                onComplete={() => {
                  console.log('stopped');
                  SignalHelper.emit(
                    'timer',
                    JSON.stringify({ message: 'timer end', status: 'waiting_duration' })
                  );
                }}
              />
            )} */}
          </div>
        )}
      </Container>
    </ListingContext.Provider>
  );
};
const mapStateToProps = state => {
  const { transactionRef } = state.TransactionPage;
  const { currentUser } = state.user;
  const transactions = getMarketplaceEntities(state, transactionRef ? [transactionRef] : []);
  const transaction = transactions.length > 0 ? transactions[0] : null;
  return {
    currentUser,
    transaction,
  };
};
const mapDispatchToProps = dispatch => {
  return {};
};
export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(Meeting);
