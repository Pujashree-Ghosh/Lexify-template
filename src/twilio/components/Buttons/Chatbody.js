import React from 'react';
import css from './Chatbody.module.css';
import { RiCloseFill } from 'react-icons/ri';

function Chat({ sideChat, closeChat, updateText, sendMessage, text, messages }) {
  console.log(777, messages);
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
          <div>
            {messages.length === 0
              ? 'show your messeges'
              : messages.map(m => (
                  <div className={css.chatDetail}>
                    <div>{m.text}</div>
                    <div>{m.author}</div>
                    <div>{m.dateUpdated}</div>
                  </div>
                ))}
          </div>
        </div>
        <div>
          <form className={css.input} onSubmit={sendMessage}>
            <input
              type="text"
              id="chat"
              placeholder="enter your text here"
              onChange={updateText}
              value={text}
            ></input>
            <button type="submit">send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
