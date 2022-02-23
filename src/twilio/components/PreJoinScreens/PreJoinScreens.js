import React, { useState, useEffect, FormEvent } from 'react';
import DeviceSelectionScreen from './DeviceSelectionScreen/DeviceSelectionScreen';
import IntroContainer from '../../components/IntroContainer/IntroContainer';
import MediaErrorSnackbar from './MediaErrorSnackbar/MediaErrorSnackbar';
import PreflightTest from './PreflightTest/PreflightTest';
import RoomNameScreen from './RoomNameScreen/RoomNameScreen';
// import { useAppState } from '../../state';
import { useParams } from 'react-router-dom';
import useVideoContext from './../../hooks/useVideoContext/useVideoContext';
import Video from 'twilio-video-ssr';
import { print } from '../../../util/data';
const { detect } = require('detect-browser');

export const Steps = {
  roomNameStep: null,
  deviceSelectionStep: null,
};

export default function PreJoinScreens({ meetingExpired, ...props }) {
  // const { user } = useAppState();

  const { getAudioAndVideoTracks } = useVideoContext();
  // const { URLRoomName } = useParams();
  const [step, setStep] = useState(Steps.roomNameStep);

  // const [name, setName] = useState(props && props.displayName);
  // const [name, setName] = useState((user && user.displayName) || '');
  const [roomName, setRoomName] = useState(props && props.roomName);
  const name = props && props.displayName;
  const [mediaError, setMediaError] = useState('');
  const [listingTitle, setListingTitle] = useState(props && props.listingTitle);
  const [shouldShowMessage, setShouldShowMessage] = useState(false);
  // console.log('1234 name>>>', props, name, roomName);
  useEffect(() => {
    // if (URLRoomName) {
    //   setRoomName(URLRoomName);
    //   // if (user && user.displayName) {
    //   setStep(Steps.deviceSelectionStep);
    //   // }
    // }
    setTimeout(() => {
      setShouldShowMessage(true);
    }, 2000);
  }, []);
  // , [user, URLRoomName]);

  useEffect(() => {
    if (step === Steps.deviceSelectionStep && !mediaError) {
      getAudioAndVideoTracks().catch(error => {
        console.log('Error acquiring local media:');
        console.dir(error);
        setMediaError(error);
      });
    }
  }, [getAudioAndVideoTracks, step, mediaError]);

  const handleSubmit = event => {
    event.preventDefault();
    // If this app is deployed as a twilio function, don't change the URL because routing isn't supported.
    // if (!window.location.origin.includes('twil.io')) {
    //   window.history.replaceState(
    //     null,
    //     '',
    //     window.encodeURI(`/room/${roomName}${window.location.search || ''}`)
    //   );
    // }
    setStep(Steps.deviceSelectionStep);
  };

  const SubContent = (
    <>
      {Video.testPreflight && <PreflightTest />}
      <MediaErrorSnackbar error={mediaError} />
    </>
  );
  print('preJoin screen', Steps, step);
  const browser = detect();

  // console.log(799, meetingExpired);

  const isFirefox = browser && browser.name === 'firefox';
  return (
    <IntroContainer subContent={step === Steps.deviceSelectionStep && SubContent}>
      {/* {step === Steps.roomNameStep && (
        <RoomNameScreen
          name={name}
          roomName={roomName}
          setName={setName}
          setRoomName={setRoomName}
          handleSubmit={handleSubmit}
        />
      )} */}

      {/* {step === Steps.deviceSelectionStep && ( */}
      <DeviceSelectionScreen
        name={name}
        roomName={roomName}
        setStep={setStep}
        listingTitle={listingTitle}
        isMeetingDisbled={props.isMeetingDisbled}
        isProvider={props.isProvider}
        // socket={props.socket}
        onCancel={props.onCancel}
      />
      {!isFirefox &&
        !meetingExpired &&
        !props.isProvider &&
        (props.providerEnterInMeetingRoom ? (
          <div style={{ textAlign: 'center' }}>
            Mentor has entered the meeting, Please click join now.
          </div>
        ) : (
          <div className="mJMText">
            Please wait for Mentor to join the meeting, do not leave the waiting room until the
            timer clock reaches Zero otherwise you could be still charged or not paid.
          </div>
        ))}
      {!isFirefox && !meetingExpired && props.isProvider && props.customerEnterInWaitingRoom && (
        <div style={{ textAlign: 'center' }}>
          Mentee has entered the meeting, Please click join now.
        </div>
      )}
      {!isFirefox && !meetingExpired && props.isProvider && !props.customerEnterInWaitingRoom && (
        <div className="mJMText">
          Mentee has not entered in the meeting. Please do not leave the waiting room until the
          timer clock reaches Zero otherwise you could be still charged or not paid.
        </div>
      )}
      {!isFirefox && meetingExpired && (
        <div style={{ textAlign: 'center', color: 'red' }}>Meeting has been expired!</div>
      )}

      {isFirefox && (
        <div style={{ textAlign: 'center', color: 'red' }}>
          Twilio meeting currently does not support Mozilla kindly log in via Google Chrome or
          Safari
        </div>
      )}

      {/* )} */}
    </IntroContainer>
  );
}
