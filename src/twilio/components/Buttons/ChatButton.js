import React from 'react';
import css from './ChatButton.module.css';
import ChatIcon from '../../icons/ChatIcon';
import { BsFillChatRightTextFill } from 'react-icons/bs';
import Button from '@material-ui/core/Button';

function ChatButton({ openChatbar, newmessage, sideChat }) {
  return (
    <div className={css.chbtntw}>
      <Button
        className={!sideChat ? css.btnmod : `${css.btnmod} ${css.active}`}
        onClick={openChatbar}
      >
        {newmessage && sideChat ? null : newmessage ? (
          <div className={css.notificationDot} />
        ) : null}

        <BsFillChatRightTextFill />

        {/* chat */}
      </Button>
    </div>
  );
}

export default ChatButton;
