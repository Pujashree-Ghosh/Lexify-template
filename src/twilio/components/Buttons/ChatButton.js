import React from 'react';
import css from './ChatButton.module.css';
import ChatIcon from '../../icons/ChatIcon';
import { RiWechatLine } from 'react-icons/ri';

function ChatButton({ openChatbar }) {
  return (
    <div className={css.chbtntw}>
      <button className={css.button} onClick={openChatbar}>
        <RiWechatLine />
        chat
      </button>
    </div>
  );
}

export default ChatButton;
