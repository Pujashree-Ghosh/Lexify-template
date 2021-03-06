// import { Callback } from '../../../types';
import EventEmitter from 'events';
import { isMobile } from '../../../utils';
import Video, { ConnectOptions, LocalTrack, Room } from 'twilio-video-ssr';
import { useCallback, useEffect, useRef, useState } from 'react';
// import { print } from '../../../../util/data';

// @ts-ignore
typeof window !== 'undefined' && (window.TwilioVideo = Video);

export default function useRoom(localTracks, onError, options) {
  const [room, setRoom] = useState(new EventEmitter());
  const [isConnecting, setIsConnecting] = useState(false);
  const optionsRef = useRef(options);
  const isCSR = typeof window !== 'undefined';
  // if (typeof window === 'undefined') {
  //   global.window = {};
  // }

  useEffect(() => {
    // This allows the connect function to always access the most recent version of the options object. This allows us to
    // reliably use the connect function at any time.
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(
    token => {
      // console.log('131 token', { token, localTracks, options });
      setIsConnecting(true);
      return Video.connect(token, { ...optionsRef.current, tracks: localTracks }).then(
        newRoom => {
          setRoom(newRoom);
          const disconnect = () => newRoom.disconnect();
          // print('test', newRoom);
          // This app can add up to 13 'participantDisconnected' listeners to the room object, which can trigger
          // a warning from the EventEmitter object. Here we increase the max listeners to suppress the warning.
          newRoom.setMaxListeners(15);

          newRoom.once('disconnected', () => {
            // Reset the room only after all other `disconnected` listeners have been called.
            setTimeout(() => setRoom(new EventEmitter()));
            isCSR && window.removeEventListener('beforeunload', disconnect);

            if (isMobile) {
              isCSR && window.removeEventListener('pagehide', disconnect);
            }
          });

          // @ts-ignore
          isCSR && (window.twilioRoom = newRoom);

          newRoom.localParticipant.videoTracks.forEach(publication =>
            // All video tracks are published with 'low' priority because the video track
            // that is displayed in the 'MainParticipant' component will have it's priority
            // set to 'high' via track.setPriority()
            publication.setPriority('low')
          );

          setIsConnecting(false);

          // Add a listener to disconnect from the room when a user closes their browser
          isCSR && window.addEventListener('beforeunload', disconnect);

          if (isMobile) {
            // Add a listener to disconnect from the room when a mobile user closes their browser
            isCSR && window.addEventListener('pagehide', disconnect);
          }
        },
        error => {
          console.log('131 error', error);
          onError(error);
          setIsConnecting(false);
        }
      );
    },
    [localTracks, onError]
  );

  return { room, isConnecting, connect };
}
