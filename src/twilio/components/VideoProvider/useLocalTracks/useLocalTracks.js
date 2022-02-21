import {
  DEFAULT_VIDEO_CONSTRAINTS,
  SELECTED_AUDIO_INPUT_KEY,
  SELECTED_VIDEO_INPUT_KEY,
} from '../../../constants';
import { useCallback, useState } from 'react';
import Video, { LocalVideoTrack, LocalAudioTrack, CreateLocalTrackOptions } from 'twilio-video-ssr';
import { useAudioInputDevices, useVideoInputDevices } from '../../../hooks/deviceHooks/deviceHooks';

export default function useLocalTracks() {
  const [audioTrack, setAudioTrack] = useState();
  const [videoTrack, setVideoTrack] = useState();
  const [isAcquiringLocalTracks, setIsAcquiringLocalTracks] = useState(false);

  const localAudioDevices = useAudioInputDevices();
  const localVideoDevices = useVideoInputDevices();

  const hasAudio = localAudioDevices.length > 0;
  const hasVideo = localVideoDevices.length > 0;

  // const getLocalAudioTrack = useCallback(deviceId) => {
  //   const options = {};

  //   if (deviceId) {
  //     options.deviceId = { exact: deviceId };
  //   }

  //   return Video.createLocalAudioTrack(options).then(newTrack => {
  //     setAudioTrack(newTrack);
  //     return newTrack; 
  //   });
  // }, []);

  const getLocalAudioTrack = useCallback((deviceId) => {
    const options= {};

    if (deviceId) {
      options.deviceId = { exact: deviceId };
    }

    return Video.createLocalAudioTrack(options).then(newTrack => {
      setAudioTrack(newTrack);
      return newTrack;
    });
  }, []);

  const getLocalVideoTrack = useCallback((newOptions) => {
    const options = {
      ...(DEFAULT_VIDEO_CONSTRAINTS),
      name: `camera-${Date.now()}`,
      ...newOptions,
    };

    return Video.createLocalVideoTrack(options).then(newTrack => {
      setVideoTrack(newTrack);
      return newTrack;
    });
  }, []);

  const removeLocalVideoTrack = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(undefined);
    }
  }, [videoTrack]);

  const getAudioAndVideoTracks = useCallback(() => {
    if (!hasAudio && !hasVideo) return Promise.resolve();
    if (isAcquiringLocalTracks || audioTrack || videoTrack) return Promise.resolve();

    setIsAcquiringLocalTracks(true);

    const selectedAudioDeviceId = window.localStorage.getItem(SELECTED_AUDIO_INPUT_KEY);
    const selectedVideoDeviceId = window.localStorage.getItem(SELECTED_VIDEO_INPUT_KEY);

    const hasSelectedAudioDevice = localAudioDevices.some(
      device => selectedAudioDeviceId && device.deviceId === selectedAudioDeviceId
    );
    const hasSelectedVideoDevice = localVideoDevices.some(
      device => selectedVideoDeviceId && device.deviceId === selectedVideoDeviceId
    );

    const localTrackConstraints = {
      video: hasVideo && {
        ...(DEFAULT_VIDEO_CONSTRAINTS ),
        name: `camera-${Date.now()}`,
        ...(hasSelectedVideoDevice && { deviceId }),
      },
      audio: hasSelectedAudioDevice ? { deviceId } : hasAudio,
    };

    return Video.createLocalTracks(localTrackConstraints)
      .then(tracks => {
        const videoTrack = tracks.find(track => track.kind === 'video');
        const audioTrack = tracks.find(track => track.kind === 'audio');
        if (videoTrack) {
          setVideoTrack(videoTrack);
        }
        if (audioTrack) {
          setAudioTrack(audioTrack);
        }
      })
      .finally(() => setIsAcquiringLocalTracks(false));
  }, [
    hasAudio,
    hasVideo,
    audioTrack,
    videoTrack,
    localAudioDevices,
    localVideoDevices,
    isAcquiringLocalTracks,
  ]);

  const localTracks = [audioTrack, videoTrack].filter(track => track !== undefined);

  return {
    localTracks,
    getLocalVideoTrack,
    getLocalAudioTrack,
    isAcquiringLocalTracks,
    removeLocalVideoTrack,
    getAudioAndVideoTracks,
  };
}
