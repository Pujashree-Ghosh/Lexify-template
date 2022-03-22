import React from 'react';
import css from './Chatbody.module.css';

function Chat({ sideChat }) {
  return (
    <div className={sideChat ? css.chatopen : css.chat}>
      {/* <div>Masseges can only be seen by people in the call and are deleted when the call ends.</div> */}
      <div>show your messages here</div>
      <form>
        <input type="text" id="chat" placeholder="enter your text here"></input>
        <button type="submit">send</button>
      </form>
    </div>
  );
}

export default Chat;
