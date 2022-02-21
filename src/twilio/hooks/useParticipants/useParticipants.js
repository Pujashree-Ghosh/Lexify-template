import { useEffect, useState, useContext } from 'react';
import { RemoteParticipant } from 'twilio-video-ssr';
import useDominantSpeaker from '../useDominantSpeaker/useDominantSpeaker';
import useVideoContext from '../useVideoContext/useVideoContext';
import { ListingContext } from '../../../containers/MeetingNewPage/Meeting';
import { print } from '../../../util/data';
import SignalHelper from '../../../util/signalHelper';

export default function useParticipants() {
  const { room } = useVideoContext();
  const dominantSpeaker = useDominantSpeaker();
  const [participants, setParticipants] = useState(Array.from(room.participants.values()));
  const stateData = useContext(ListingContext);
  // When the dominant speaker changes, they are moved to the front of the participants array.
  // This means that the most recent dominant speakers will always be near the top of the
  // ParticipantStrip component.
  useEffect(() => {
    if (dominantSpeaker) {
      setParticipants(prevParticipants => [
        dominantSpeaker,
        ...prevParticipants.filter(participant => participant !== dominantSpeaker),
      ]);
    }
  }, [dominantSpeaker, stateData]);

  useEffect(() => {
    const participantConnected = participant => {
      print('participant join...');
      // if (!stateData.isProvider) {
      // if (participant.identity == stateData.moderator) {
      //   SignalHelper.emit('moderator', JSON.stringify({ isEnter: true }));
      // }
      // }
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };
    const participantDisconnected = participant => {
      // if (!stateData.isProvider) {
      //   if (participant.identity == stateData.moderator) {
      //     SignalHelper.emit('moderator', JSON.stringify({ isEnter: false }));
      //   }
      // }
      setParticipants(prevParticipants => prevParticipants.filter(p => p !== participant));
    };
    room.on('participantConnected', participantConnected);
    room.on('participantDisconnected', participantDisconnected);
    return () => {
      room.off('participantConnected', participantConnected);
      room.off('participantDisconnected', participantDisconnected);
    };
  }, [room]);

  return participants;
}
