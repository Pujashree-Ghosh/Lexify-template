import { useEffect } from 'react';
// import { Room } from 'twilio-video-ssr';
// import { Callback } from '../../../types';

export default function useHandleOnDisconnect(room, onDisconnect) {
  useEffect(() => {
    room.on('disconnected', onDisconnect);
    return () => {
      room.off('disconnected', onDisconnect);
    };
  }, [room, onDisconnect]);
}
