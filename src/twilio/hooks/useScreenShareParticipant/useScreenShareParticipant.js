import { useEffect, useState } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';

import { Participant, TrackPublication } from 'twilio-video-ssr';

/*
  Returns the participant that is sharing their screen (if any). This hook assumes that only one participant
  can share their screen at a time.
*/
export default function useScreenShareParticipant() {
  const { room } = useVideoContext();
  const [screenShareParticipant, setScreenShareParticipant] = useState();
  // console.log(
  //   6060911,
  //   // Array.from < Participant > room,
  //   // screenShareParticipant,
  //   Array.from(room.participants.values()),
  //   // &&
  //   room.participants,
  //   // room.localParticipant,
  //   // room.participants.entries().value,
  //   // // the screenshare participant could be the localParticipant
  //   Array.from(room.participants.values()).concat(room.localParticipant),
  //   Array.from(room.participants.values())
  //     .concat(room.localParticipant)
  //     .map(m => Array.from(m.tracks.values())),
  //   // .map(v => v),
  //   Array.from(room.participants.values())
  //     .concat(room.localParticipant)
  //     .find(participant =>
  //       Array.from(participant.tracks.values()).find(track => track.trackName.includes('screen'))
  //     )
  // );

  useEffect(() => {
    if (room.state === 'connected') {
      const updateScreenShareParticipant = () => {
        setScreenShareParticipant(
          // Array.from < Participant > room &&
          //   room.participants
          //     .values()
          //     // the screenshare participant could be the localParticipant
          //     .concat(room.localParticipant)
          //     .find(
          //       participant =>
          //         Array.from <
          //         TrackPublication >
          //         participant.tracks.values().find(track => track.trackName.includes('screen'))
          //     )
          Array.from(room.participants.values())
            .concat(room.localParticipant)
            .find(participant =>
              Array.from(participant.tracks.values()).find(track =>
                track.trackName.includes('screen')
              )
            )
        );
      };
      updateScreenShareParticipant();

      room.on('trackPublished', updateScreenShareParticipant);
      room.on('trackUnpublished', updateScreenShareParticipant);
      room.on('participantDisconnected', updateScreenShareParticipant);

      // the room object does not emit 'trackPublished' events for the localParticipant,
      // so we need to listen for them here.
      room.localParticipant.on('trackPublished', updateScreenShareParticipant);
      room.localParticipant.on('trackUnpublished', updateScreenShareParticipant);
      return () => {
        room.off('trackPublished', updateScreenShareParticipant);
        room.off('trackUnpublished', updateScreenShareParticipant);
        room.off('participantDisconnected', updateScreenShareParticipant);

        room.localParticipant.off('trackPublished', updateScreenShareParticipant);
        room.localParticipant.off('trackUnpublished', updateScreenShareParticipant);
      };
    }
  }, [room]);

  return screenShareParticipant;
}
