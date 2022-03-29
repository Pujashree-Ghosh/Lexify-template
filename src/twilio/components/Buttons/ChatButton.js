import React from 'react';
import css from './ChatButton.module.css';
import ChatIcon from '../../icons/ChatIcon';
import { BsChatText } from 'react-icons/bs';

function ChatButton({ openChatbar, newmessage, sideChat }) {
  return (
    <div className={css.chbtntw}>
      <button className={css.button} onClick={openChatbar}>
        {newmessage && sideChat ? null : newmessage ? (
          <span className="msgpop" style={{ fontSize: '20px' }}>
            *
          </span>
        ) : null}
        <BsChatText />
        {/* chat */}
      </button>
    </div>
  );
}

export default ChatButton;
