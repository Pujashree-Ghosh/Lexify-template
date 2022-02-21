// import { Room, TwilioError } from 'twilio-video-ssr';
import { useEffect } from 'react';

// import { Callback } from '../../../types';

export default function useHandleRoomDisconnectionErrors(room, onError) {
  useEffect(() => {
    const onDisconnected = (room, error) => {
      if (error) {
        onError(error);
      }
    };

    room.on('disconnected', onDisconnected);
    return () => {
      room.off('disconnected', onDisconnected);
    };
  }, [room, onError]);
}
