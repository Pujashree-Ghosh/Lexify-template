import React from 'react';
import css from './Chatbody.module.css';
import { RiCloseFill } from 'react-icons/ri';
import moment from 'moment-timezone';
import { ExternalLink } from '../../../components';

function Chat({ sideChat, closeChat, updateText, sendMessage, text, messages }) {
  const validURL = str => {
    let regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    if (!regex.test(str)) {
      return false;
    } else {
      return true;
    }
  };
  console.log(
    321,
    messages?.map(m => m.text)
  );
  const extractName = str => {
    if (!str) return 'Not found';
    let newString = str.split('/');
    newString = newString[newString.length - 1];
    console.log({ newString });
    newString = newString.replaceAll('%20', ' ');

    if (!newString) return str;

    return newString;
  };
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
          <div className={css.chatboxvs}>
            {messages.length === 0
              ? ''
              : messages.map(m => (
                  <div
                    key={m}
                    className={
                      m.type
                        ? `${css.chatDetail} ${css.chatDetailme}`
                        : `${css.chatDetail} ${css.chatDetailyou}`
                    }
                  >
                    <div className={css.aut}>{m.author}</div>
                    {validURL(m?.text) ? (
                      // <a
                      //   href={m?.text}
                      //   className={css.msgcnt}
                      //   target="_blank"
                      //   rel="noopener noreferrer"
                      // >
                      //   {extractName(m?.text)}
                      // </a>
                      <ExternalLink href={m?.text} className={css.msgcnt}>
                        {m?.text}
                      </ExternalLink>
                    ) : (
                      <div className={css.msgcnt}>{m.text}</div>
                    )}
                    {/* <div className={css.msgcnt}>{m.text}</div> */}

                    <div className={css.datetm}>{moment(m.dateUpdated).format('lll')}</div>
                  </div>
                ))}
          </div>
        </div>
        <div className={css.chatinput}>
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
