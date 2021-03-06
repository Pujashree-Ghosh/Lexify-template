import { Room } from 'twilio-video-ssr';
import { useEffect } from 'react';

// import { Callback } from '../../../types';

export default function useHandleTrackPublicationFailed(room, onError) {
  const { localParticipant } = room;
  useEffect(() => {
    if (localParticipant) {
      localParticipant.on('trackPublicationFailed', onError);
      return () => {
        localParticipant.off('trackPublicationFailed', onError);
      };
    }
  }, [localParticipant, onError]);
}
