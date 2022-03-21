import React, { useContext, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import EndCallButton from '../Buttons/EndCallButton/EndCallButton';
import FlipCameraButton from './FlipCameraButton/FlipCameraButton';
import Menu from './Menu/Menu';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Typography, Grid, Hidden } from '@material-ui/core';
import ToggleAudioButton from '../Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../Buttons/ToggleVideoButton/ToggleVideoButton';
import ToggleScreenShareButton from '../Buttons/ToogleScreenShareButton/ToggleScreenShareButton';
import ChatScreen from './../../../containers/MeetingNewPage/Chat';
import { ListingContext } from './../../../containers/MeetingNewPage/Meeting';
import SignalHelper from '../../../util/signalHelper';
import { print } from '../../../util/data';
import ChatButton from '../Buttons/ChatButton';
import Chatbody from '../Buttons/Chatbody';
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
  useEffect(() => {
    SignalHelper.on('timer', data => {
      // console.log('timer', data);
      const timerData = JSON.parse(data);
      if (timerData.status == 'meeting_duration') room.disconnect();
      if (timerData.status == 'waiting_duration') room.disconnect();
    });
  }, [room]);
  return (
    <>
      {isSharingScreen && (
        <Grid container justify="center" alignItems="center" className={classes.screenShareBanner}>
          <Typography variant="h6">You are sharing your screen</Typography>
          <Button onClick={() => toggleScreenShare()}>Stop Sharing</Button>
        </Grid>
      )}
      {/* <div
        style={{
          backgroundColor: 'blue',
          right: '0',
          top: '0px',
          position: 'fixed',
          height: '100vh',
          width: '20vw',
        }}
      >
        <Chatbody />
      </div> */}

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
              <ToggleAudioButton disabled={isReconnecting} />
              <ToggleVideoButton disabled={isReconnecting} />
              <Hidden smDown>
                {<ToggleScreenShareButton disabled={isReconnecting} />}

                <ChatButton />

                {/* {!isSharingScreen && <ToggleScreenShareButton disabled={isReconnecting} />} */}
              </Hidden>
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
