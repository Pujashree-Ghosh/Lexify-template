import React, { useContext } from 'react';
import useTrack from '../../hooks/useTrack/useTrack';
import AudioTrack from '../AudioTrack/AudioTrack';
import VideoTrack from '../VideoTrack/VideoTrack';

// import { IVideoTrack } from '../../types';
import {
  AudioTrack as IAudioTrack,
  LocalTrackPublication,
  Participant,
  RemoteTrackPublication,
  Track,
} from 'twilio-video-ssr';

// interface PublicationProps {
//   publication: LocalTrackPublication | RemoteTrackPublication;
//   participant: Participant;
//   isLocalParticipant?: boolean;
//   videoOnly?: boolean;
//   videoPriority?: Track.Priority | null;
// }

export default function Publication({ publication, isLocalParticipant, videoOnly, videoPriority }) {
  const track = useTrack(publication);

  if (!track) return null;

  switch (track.kind) {
    case 'video':
      return (
        <VideoTrack
          track={track}
          priority={videoPriority}
          isLocal={track.name.includes('camera') && isLocalParticipant}
        />
      );
    case 'audio':
      return videoOnly ? null : <AudioTrack track={track} />;
    default:
      return null;
  }
}
