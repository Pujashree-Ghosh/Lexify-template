import { useContext, useEffect, useState } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
// import useParticipants from '../useParticipants/useParticipants';
import { print } from '../../../util/data';
import Participant from '../../components/Participant/Participant';
import SignalHelper from '../../../util/signalHelper';
import { ListingContext } from '../../../containers/MeetingNewPage/Meeting';

// type RoomStateType = 'disconnected' | 'connected' | 'reconnecting';
export default function useRoomState() {
  const { room } = useVideoContext();
  const [state, setState] = useState('disconnected');
  const stateData = useContext(ListingContext);
  // const participants = useParticipants();
  // const [participants, setParticipants] = useState(Array.from(room.participants.values()));
  // print('775 useRoomState', room.participants);
  useEffect(() => {
    const setRoomState = () => setState(room.state || 'disconnected');
    const participantConnected = participant => {
      print('participant join', participant);
      if (stateData && !stateData.isProvider) {
        if (participant.identity == stateData.moderator) {
          SignalHelper.emit('moderator', JSON.stringify({ isEnter: true }));
        } else {
          SignalHelper.emit('customer', JSON.stringify({ isEnter: true }));
        }
      }
    };
    const participantDisconnected = participant => {
      if (stateData && !stateData.isProvider) {
        if (participant.identity == stateData.moderator) {
          SignalHelper.emit('moderator', JSON.stringify({ isEnter: false }));
        } else {
          SignalHelper.emit('customer', JSON.stringify({ isEnter: false }));
        }
      }
    };

    setRoomState('waiting');
    room
      .on('disconnected', setRoomState)
      .on('reconnected', setRoomState)
      .on('reconnecting', setRoomState)
      .on('participantConnected', participantConnected)
      .on('participantDisconnected', participantDisconnected);
    // ee.on('message', data => print('123 messageuseRoomState', data));
    return () => {
      room
        .off('disconnected', setRoomState)
        .off('reconnected', setRoomState)
        .off('reconnecting', setRoomState)
        .off('participantConnected', participantConnected)
        .off('participantDisconnected', participantDisconnected);
    };
  }, [room]);
  useEffect(() => {
    const participants =
      (room && room.participants && Array.from(room.participants.values())) || [];
    // const participants = Array.from(room.participants.values());
    if (participants.length > 0) {
      print('443 participants', participants, stateData);
      const moderatorParticipant =
        stateData && participants.filter(p => p.identity == stateData.moderator);
      print('443 moderator participants', moderatorParticipant);
      if (moderatorParticipant && moderatorParticipant.length > 0) {
        SignalHelper.emit('moderator', JSON.stringify({ isEnter: true }));
      }
    }
  }, [room, stateData]);

  return state;
}
