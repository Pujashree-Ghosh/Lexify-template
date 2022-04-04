import React, { useContext, useEffect } from 'react';
import { makeStyles, Typography, Grid, Button, Theme, Hidden } from '@material-ui/core';
import LocalVideoPreview from './LocalVideoPreview/LocalVideoPreview';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import { Steps } from '../PreJoinScreens';
import ToggleAudio from '../../Buttons/ToggleAudio/ToggleAudio';
import ToggleVideo from '../../Buttons/ToggleVideo/ToggleVideo';
import { useAppState } from '../../../state';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { ListingContext } from './../../../../containers/MeetingNewPage/Meeting';
import { print } from '../../../../util/data';
const { detect } = require('detect-browser');
// import SignalHelper from '../../../../util/signalHelper';

const useStyles = makeStyles(theme => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  marginTop: {
    marginTop: '1em',
  },
  deviceButton: {
    width: '100%',
    border: '2px solid #aaa',
    margin: '1em 0',
  },
  localPreviewContainer: {
    paddingRight: '2em',
    [theme.breakpoints.down('sm')]: {
      padding: '0 2.5em',
    },
  },
  joinButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      width: '100%',
      '& button': {
        margin: '0.5em 0',
      },
    },
  },
  mobileButtonBar: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '1.5em 0 1em',
    },
  },
  mobileButton: {
    padding: '0.8em 0',
    margin: 0,
  },
}));

// interface DeviceSelectionScreenProps {
//   name: string;
//   roomName: string;
//   setStep: (step: Steps) => void;
// }

export default function DeviceSelectionScreen({
  name,
  roomName,
  setStep,
  listingTitle,
  isMeetingDisbled,
  isProvider,
  socket,
  onCancel,
}) {
  const classes = useStyles();
  const { getToken, isFetching } = useAppState();
  const { connect, isAcquiringLocalTracks, isConnecting } = useVideoContext();
  const stateData = useContext(ListingContext);
  const disableButtons = isMeetingDisbled || isFetching || isAcquiringLocalTracks || isConnecting;
  const browser = detect();

  const isFirefox = browser && browser.name === 'firefox';
  const handleJoin = () => {
    getToken(name, roomName).then(token => {
      //
      // connect(token);
      connect(token, {
        region: 'gll',
      });
      // setTimeout(() => {
      // SignalHelper.emit('meeting', JSON.stringify({ status: 'open', isProvider }));
      if (typeof window !== undefined) {
        // console.log('socket----->>>>>', window.socket);
        window.socket && window.socket.emit('meeting-server', { status: 'open', isProvider });
      }

      // }, 1000);
    });
  };
  // useEffect(() => {
  //   SignalHelper.on('meeting', data => {
  //     print('meeting', data);
  //     if (JSON.parse(data).isStart) {
  //       disableButtons = disableButtons || true;
  //     }
  //   });
  // }, []);

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join {listingTitle}
      </Typography>

      <Grid container justify="center">
        <Grid item md={7} sm={12} xs={12}>
          <div className={`${classes.localPreviewContainer} lpc-mod`}>
            <LocalVideoPreview identity={name} />
          </div>
          <div className={`${classes.mobileButtonBar} mbb`}>
            <Hidden mdUp>
              <ToggleAudio className={classes.mobileButton} />
              <ToggleVideo className={classes.mobileButton} />
            </Hidden>
            <SettingsMenu mobileButtonClass={classes.mobileButton} />
          </div>
        </Grid>
        <Grid item md={5} sm={12} xs={12}>
          <Grid container direction="column" justify="space-between" style={{ height: '100%' }}>
            <div>
              <Hidden smDown>
                <ToggleAudio className={classes.deviceButton} />
                <ToggleVideo className={classes.deviceButton} />
              </Hidden>
            </div>
            {!isFirefox && (
              <div className={`${classes.joinButtons} hm-btn-con`}>
                <Button variant="outlined" color="primary" onClick={onCancel}>
                  Back
                </Button>
                {
                  <Button
                    variant="contained"
                    color="primary"
                    data-cy-join-now
                    onClick={handleJoin}
                    // disabled={disableButtons}
                  >
                    Join Now
                  </Button>
                }
              </div>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
