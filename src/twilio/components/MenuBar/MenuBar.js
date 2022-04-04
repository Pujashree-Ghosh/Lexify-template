import React, { useContext, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import FlipCameraButton from './FlipCameraButton/FlipCameraButton';
import Menu from './Menu/Menu';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Typography, Grid, Hidden, Backdrop } from '@material-ui/core';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import ToggleScreenShareButton from '../Buttons/ToogleScreenShareButton/ToggleScreenShareButton';
// import ChatScreen from './../../../containers/MeetingNewPage/Chat';
import { ListingContext } from './../../../containers/MeetingNewPage/Meeting';
import SignalHelper from '../../../util/signalHelper';
// import { print } from '../../../util/data';
import ChatButton from '../Buttons/ChatButton';
import useLocalAudioToggle from '../../../twilio/hooks/useLocalAudioToggle/useLocalAudioToggle';
import useLocalVideoToggle from '../../../twilio/hooks/useLocalVideoToggle/useLocalVideoToggle';

import Chat from '../../../containers/MeetingNewPage/Chat';
// import Back from '../Buttons/Back';
const useStyles = makeStyles(theme =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.default,
      bottom: 0,
      left: 0,
      right: 0,
      height: `${theme.footerHeight}px`,
      position: 'fixed',
      display: 'flex',
      padding: '0 1.43em',
      zIndex: 10,
      [theme.breakpoints.down('sm')]: {
        height: `${theme.mobileFooterHeight}px`,
        padding: 0,
      },
    },
    screenShareBanner: {
      position: 'fixed',
      zIndex: 10,
      bottom: `${theme.footerHeight}px`,
      left: 0,
      right: 0,
      height: '104px',
      background: 'rgba(0, 0, 0, 0.5)',
      '& h6': {
        color: 'white',
      },
      '& button': {
        background: 'white',
        color: theme.brand,
        border: `2px solid ${theme.brand}`,
        margin: '0 2em',
        '&:hover': {
          color: '#600101',
          border: `2px solid #600101`,
          background: '#FFE9E7',
        },
      },
    },
    hideMobile: {
      display: 'initial',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  })
);

export default function MenuBar({ isProvider, extendMeeting, isShortBooking, isExtended }) {
  const classes = useStyles();
  const { isSharingScreen, toggleScreenShare } = useVideoContext();
  const roomState = useRoomState();
  const isReconnecting = roomState === 'reconnecting';
  const { room } = useVideoContext();
  const { listingTitle, listingId, transactionId } = useContext(ListingContext);
  const [newmessage, setNewmessage] = useState(false);
  useEffect(() => {
    SignalHelper.on('timer', data => {
      const timerData = JSON.parse(data);
      if (timerData.status == 'meeting_duration') room.disconnect();
      if (timerData.status == 'waiting_duration') room.disconnect();
    });
  }, [room]);
  const [sideChat, setSidechat] = useState(false);
  const toggleChat = () => {
    document.body.setAttribute('style', 'overflow:hidden');
    setSidechat(prevState => !prevState);
    setNewmessage(false);
  };
  const closeChat = () => {
    document.body.setAttribute('style', '');
    setSidechat(!sideChat);

    setNewmessage(false);
  };
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();

  console.log(555444, isAudioEnabled);
  return (
    <>
      {isSharingScreen && (
        <Grid container justify="center" alignItems="center" className={classes.screenShareBanner}>
          <Typography variant="h6">You are sharing your screen</Typography>
          <Button onClick={() => toggleScreenShare()}>Stop Sharing</Button>
        </Grid>
      )}
      <Chat sideChat={sideChat} closeChat={closeChat} setNewmessage={setNewmessage} />
      {/* <Back sideChat={sideChat} /> */}

      <footer className={`${classes.container} footer-mod`}>
        <Grid container justify="space-around" alignItems="center">
          <Hidden smDown>
            <Grid style={{ flex: 1 }}>
              {/* <Typography variant="body1">{room.name}</Typography> */}
              <Typography variant="body1">{listingTitle}</Typography>
              {isShortBooking && isProvider && !isExtended && (
                <Button onClick={() => extendMeeting()}>Extend Time</Button>
              )}
            </Grid>
          </Hidden>
          <Grid item className="mob-wid">
            <Grid container justify="center" className="mob-inline">
              <ToggleAudioButton
                className={isAudioEnabled ? 'btnmod' : 'btnmod active'}
                disabled={isReconnecting}
              />
              <ToggleVideoButton
                className={isVideoEnabled ? 'btnmod' : 'btnmod active'}
                disabled={isReconnecting}
              />

              <Hidden smDown>
                {
                  <ToggleScreenShareButton
                    // className={isSharingScreen ? '' : 'active'}
                    disabled={isReconnecting}
                  />
                }

                {/* {!isSharingScreen && <ToggleScreenShareButton disabled={isReconnecting} />} */}
              </Hidden>
              <ChatButton openChatbar={toggleChat} newmessage={newmessage} sideChat={sideChat} />
              <FlipCameraButton />

              {/* <button className="MuiButtonBase-root MuiButton-root MuiButton-text ct-btn">
                <span>
                  <i class="fas fa-comment-alt"></i>
                </span>
                <ChatScreen />
                Chat
              </button> */}
              {/* <ChatScreen
                listingTitle={listingTitle}
                room={`chat_${listingId}mkh${transactionId}`}
              /> */}
            </Grid>
          </Grid>
          {/* <Grid item>
            <Grid container justify="center">
              <ChatScreen />
            </Grid>
          </Grid> */}

          <Hidden smDown>
            <Grid style={{ flex: 1 }}>
              <Grid container justify="flex-end">
                <Menu />
                <EndCallButton isProvider={isProvider} />
              </Grid>
            </Grid>
          </Hidden>
        </Grid>
      </footer>
    </>
  );
}
