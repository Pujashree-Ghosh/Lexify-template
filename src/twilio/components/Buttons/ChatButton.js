import React from 'react';

import css from './ChatButton.module.css';

function ChatButton({ openChatbar }) {
  return (
    <div>
      <button className={css.button} onClick={openChatbar}>
        chat
      </button>
    </div>
  );
}

export default ChatButton;
