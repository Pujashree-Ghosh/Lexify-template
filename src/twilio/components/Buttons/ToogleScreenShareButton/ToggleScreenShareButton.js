import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import ScreenShareIcon from '../../../icons/ScreenShareIcon';
import StopScreenShareIcon from '../../../icons/StopScreenShareIcon';
import Tooltip from '@material-ui/core/Tooltip';

import useScreenShareParticipant from '../../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';

export const SCREEN_SHARE_TEXT = 'Share Screen';
export const STOP_SCREEN_SHARE_TEXT = 'Stop Sharing';
export const SHARE_IN_PROGRESS_TEXT = 'Cannot share screen when another user is sharing';
export const SHARE_NOT_SUPPORTED_TEXT = 'Screen sharing is not supported with this browser';

const useStyles = makeStyles(theme =>
  createStyles({
    button: {
      margin: theme.spacing(1),
      '&[disabled]': {
        color: '#bbb',
        '& svg *': {
          fill: '#bbb',
        },
      },
    },
  })
);

export default function ToggleScreenShareButton(props) {
  const classes = useStyles();
  const screenShareParticipant = useScreenShareParticipant();
  const { toggleScreenShare, isSharingScreen, room } = useVideoContext();
  const disableScreenShareButton = Boolean(
    screenShareParticipant &&
      !(JSON.stringify(room.localParticipant) === JSON.stringify(screenShareParticipant))
  );
  // const disableScreenShareButton = Boolean(screenShareParticipant);
  const isScreenShareSupported = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  const isDisabled = props.disabled || disableScreenShareButton || !isScreenShareSupported;
  // console.log(
  //   606098,
  //   Array.from(room.participants.values()),
  //   JSON.stringify(room.localParticipant) === JSON.stringify(screenShareParticipant),
  //   screenShareParticipant
  // );
  let tooltipMessage = '';

  if (disableScreenShareButton) {
    tooltipMessage = SHARE_IN_PROGRESS_TEXT;
  }

  if (!isScreenShareSupported) {
    tooltipMessage = SHARE_NOT_SUPPORTED_TEXT;
  }

  return (
    <Tooltip
      title={tooltipMessage}
      placement="top"
      PopperProps={{ disablePortal: true }}
      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
    >
      <span>
        {/* The span element is needed because a disabled button will not emit hover events and we want to display
          a tooltip when screen sharing is disabled */}
        <Button
          className={
            isSharingScreen
              ? `${classes.button} btnmod shareicon`
              : `${classes.button} btnmod shareicon active`
          }
          onClick={toggleScreenShare}
          disabled={isDisabled}
          startIcon={isSharingScreen ? <MdScreenShare /> : <MdStopScreenShare />}
          data-cy-share-screen
        >
          {/* {isSharingScreen ? STOP_SCREEN_SHARE_TEXT : SCREEN_SHARE_TEXT} */}
        </Button>
      </span>
    </Tooltip>
  );
}
