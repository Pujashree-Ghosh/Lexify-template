import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Button } from '@material-ui/core';
import { FcEndCall } from 'react-icons/fc';

import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
// import SignalHelper from '../../../../util/signalHelper';

const useStyles = makeStyles(theme =>
  createStyles({
    button: {
      background: theme.brand,
      color: 'red',
      '&:hover': {
        background: '#600101',
        color: 'white',
      },
    },
  })
);

export default function EndCallButton(props) {
  const classes = useStyles();
  const { room } = useVideoContext();
  const disconnectRoom = () => {
    // SignalHelper.emit('meeting', { status: 'close' });
    // console.log('277777', props);
    window.socket &&
      window.socket.emit('meeting-server', { status: 'close', isProvider: props.isProvider });
    room.disconnect();
  };
  return (
    <Button
      onClick={() => disconnectRoom()}
      className={`${clsx(classes.button, props.className)} vid-end-btn`}
      data-cy-disconnect
    >
      <FcEndCall size={26} />
      {/* End */}
    </Button>
  );
}
