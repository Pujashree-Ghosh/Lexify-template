import React, { useContext } from 'react';
import clsx from 'clsx';
import Participant from '../Participant/Participant';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import useMainParticipant from '../../hooks/useMainParticipant/useMainParticipant';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useSelectedParticipant from '../VideoProvider/useSelectedParticipant/useSelectedParticipant';
import useScreenShareParticipant from '../../hooks/useScreenShareParticipant/useScreenShareParticipant';
import { ListingContext } from '../../../containers/MeetingNewPage/Meeting';
import { print } from '../../../util/data';
import SignalHelper from '../../../util/signalHelper';
const useStyles = makeStyles(theme =>
  createStyles({
    container: {
      // padding: '2em',
      minWidth: '300px',
      position: 'absolute',
      right: '0',
      overflowY: 'auto',
      // background: 'rgba(79, 83, 85, 0.8)',
      gridArea: '1 / 2 / 1 / 3',
      zIndex: 5,
      [theme.breakpoints.down('sm')]: {
        gridArea: '2 / 1 / 3 / 3',
        overflowY: 'initial',
        overflowX: 'auto',
        display: 'flex',
        padding: `${theme.sidebarMobilePadding}px`,
      },
      maxHeight: '100vh',
      overflowY: 'auto',
      padding: '5px 5px 70px',
    },

    transparentBackground: {
      background: 'transparent',
    },
    scrollContainer: {
      [theme.breakpoints.down('sm')]: {
        display: 'flex',
      },
    },
  })
);

export default function ParticipantList() {
  const classes = useStyles();
  const {
    room: { localParticipant },
  } = useVideoContext();
  const participants = useParticipants();

  const [selectedParticipant, setSelectedParticipant] = useSelectedParticipant();
  const screenShareParticipant = useScreenShareParticipant();
  const mainParticipant = useMainParticipant();
  const isRemoteParticipantScreenSharing =
    screenShareParticipant && screenShareParticipant !== localParticipant;

  const stateData = useContext(ListingContext);
  if (participants.length === 0) return null; // Don't render this component if there are no remote participants.
  if (participants.length > 0) {
    const moderatorParticipant = participants.filter(p => p.identity == stateData.moderator);
    if (moderatorParticipant.length > 0) {
      SignalHelper.emit('moderator', JSON.stringify({ isEnter: true }));
    }
    if (moderatorParticipant.length !== participants.length) {
      SignalHelper.emit('customer', JSON.stringify({ isEnter: true }));
    }
  }
  return (
    <aside
      className={clsx(classes.container, {
        [classes.transparentBackground]: !isRemoteParticipantScreenSharing,
      })}
    >
      <div className={classes.scrollContainer}>
        <Participant participant={localParticipant} isLocalParticipant={true} />
        {participants.map(participant => {
          const isSelected = participant === selectedParticipant;
          const hideParticipant =
            participant === mainParticipant &&
            participant !== screenShareParticipant &&
            !isSelected;
          return (
            <Participant
              key={participant.sid}
              participant={participant}
              isSelected={participant === selectedParticipant}
              onClick={() => {
                setSelectedParticipant(participant);
              }}
              hideParticipant={hideParticipant}
            />
          );
        })}
      </div>
    </aside>
  );
}
