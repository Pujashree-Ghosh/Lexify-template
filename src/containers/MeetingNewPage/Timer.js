import React from 'react';
import { useState, useEffect } from 'react';
import css from './Meeting.css';
import SignalHelper from '../../util/signalHelper';
const Timer = props => {
  const { initialMinute, initialSeconds } = props;

  // console.log('timer props', props);
  const [minutes, setMinutes] = useState(initialMinute || 0);
  const [seconds, setSeconds] = useState(initialSeconds || 0);
  useEffect(() => {
    // console.log(2777, minutes, seconds);
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (seconds === 0) {
        if (minutes === 0) {
          if (typeof props.onclose === 'function') {
            props.onclose();
          }
          clearInterval(myInterval);
          SignalHelper.emit(
            'timer',
            JSON.stringify({ message: 'timer end', status: props.status })
          );
        } else {
          // console.log(2777, minutes);
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);
    return () => {
      // console.log(34444);
      clearInterval(myInterval);
    };
  }, [minutes, seconds]);

  useEffect(() => {
    setMinutes(initialMinute || 0);
    setSeconds(initialSeconds || 0);
  }, [initialMinute, initialSeconds]);

  return (
    <div className={css.timer}>
      {minutes === 0 && seconds === 0 ? null : (
        <h1>
          {props.sub} {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </h1>
      )}
    </div>
  );
};

export default Timer;
