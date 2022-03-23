import React from 'react';
import css from './Chatbody.module.css';
import { RiCloseFill } from 'react-icons/ri';

function Chat({ sideChat, closeChat }) {
  return (
    <div className={sideChat ? css.backdrop : css.disable}>
      <div className={css.chatopen}>
        <div className={css.insidechat}>
          <div className={css.close}>
            <RiCloseFill onClick={closeChat} />
          </div>
          <div className={css.visible}>
            Masseges can only be seen by people in the call and are deleted when the call ends.
          </div>
          <div>show your messages here</div>
        </div>
        <div>
          <form className={css.input}>
            <input type="text" id="chat" placeholder="enter your text here"></input>
            <button type="submit">send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
