import React from 'react';

function Chat() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>Masseges can only be seen by people in the call and are deleted when the call ends.</div>
      <div>show your messages here</div>
      <form style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input type="text" id="chat" placeholder="enter your text here"></input>
        <button type="submit">send</button>
      </form>
    </div>
  );
}

export default Chat;
