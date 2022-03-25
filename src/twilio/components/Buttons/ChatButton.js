import React from 'react';
import css from './ChatButton.module.css';
import ChatIcon from '../../icons/ChatIcon';
import { RiWechatLine } from 'react-icons/ri';

function ChatButton({ openChatbar, newmessage, sideChat }) {
  return (
    <div className={css.chbtntw}>
      <button className={css.button} onClick={openChatbar}>
        {newmessage && sideChat ? null : newmessage ? (
          <span className="msgpop" style={{ fontSize: '20px' }}>
            *
          </span>
        ) : null}
        <RiWechatLine />
        {/* chat */}
      </button>
    </div>
  );
}

export default ChatButton;
