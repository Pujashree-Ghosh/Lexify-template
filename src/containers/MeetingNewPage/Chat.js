// import React from 'react';
// import css from '../MeetingNewPage/Meeting.css';
// import { Backdrop, CircularProgress, Grid, IconButton, List, Drawer } from '@material-ui/core';
// import { Send } from '@material-ui/icons';
// import ChatItem from './ChatItem';
// // import Twilio from 'twilio-chat';
// import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
// import { compose } from 'redux';
// import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';

// // import { resolve } from 'url';

// // const backend_server = process.env.REACT_APP_BACKEND_SERVER_URL;
// // let Twilio = {};
// // // if (typeof window !== 'undefined') Twilio = require('twilio-chat');
// // else Twilio = undefined;
// class ChatSreen extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       text: '',
//       messages: [],
//       loading: false,
//       channel: null,
//       isChatOpen: false,
//       email: '',
//       room: '',
//       anchor: 'right',
//       isNewMessage: false,
//     };

//     this.scrollDiv = React.createRef();
//     this.messagesEndRef = React.createRef();
//   }

//   handleMessageAdded = message => {
//     const { messages } = this.state;
//     // console.log('111 handleMessageAdded', this.state);
//     this.setState(
//       {
//         messages: [...messages, message],
//       },
//       this.scrollToBottom
//     );
//   };

//   scrollToBottom = () => {
//     if (this.messagesEndRef.current) this.messagesEndRef.current.scrollIntoView();
//   };
//   componentDidMount = async () => {
//     window.socket &&
//       window.socket.on('meeting-message', message => {
//         this.setState(
//           { isNewMessage: true, messages: [...this.state.messages, message] },
//           this.scrollToBottom
//         );
//       });
//   };

//   updateText = e => {
//     this.setState({
//       text: e.target.value,
//     });
//   };
//   sendMessage = () => {
//     const { currentUser } = this.props;
//     const displayName = currentUser && currentUser.attributes.profile.displayName;
//     const email = currentUser && currentUser.attributes.email;
//     const { text, channel } = this.state;
//     // console.log('111 sendMessage>>>', this.state);
//     if (text) {
//       this.setState({ loading: true });
//       //   channel.sendMessage(String(text).trim());
//       window.socket &&
//         window.socket.emit('meeting-message', { author: email, text, dateUpdated: new Date() });
//       this.setState({ text: '', loading: false });
//     }
//   };
//   toggleDrawer = () => event => {
//     if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
//       return;
//     }
//     // setIsChatOpen(!isChatOpen);
//     this.setState({ ...this.state, isChatOpen: !this.state.isChatOpen, isNewMessage: false });
//   };
//   render() {
//     // console.log('111 props>', this.props);
//     const { currentUser } = this.props;
//     const displayName = currentUser && currentUser.attributes.profile.displayName;
//     const email = currentUser && currentUser.attributes.email;
//     const { anchor, isChatOpen, loading, messages, text, isNewMessage } = this.state;
//     return (
//       <div>
//         <button
//           type="button"
//           onClick={this.toggleDrawer()}
//           className="MuiButtonBase-root MuiButton-root MuiButton-text ct-btn"
//         >
//           <span>
//             <i class="fas fa-comment-alt"></i>
//             {isNewMessage && <sup>*</sup>}
//           </span>
//           {/* <ChatScreen /> */}
//           Chat{' '}
//           {isNewMessage && (
//             <span className="msgpop" style={{ fontSize: '20px' }}>
//               *
//             </span>
//           )}
//         </button>
//         <Drawer anchor={anchor} open={isChatOpen} onClose={this.toggleDrawer()}>
//           {/* <Container component="main" maxWidth="md"> */}
//           <Backdrop open={loading} style={{ zIndex: 99999 }}>
//             <CircularProgress style={{ color: 'white' }} />
//           </Backdrop>

//           <Grid container direction="column" style={styles.mainGrid}>
//             <Grid item style={styles.gridItemChatList}>
//               <List dense={true}>
//                 {messages &&
//                   messages.map((message, index) => (
//                     <ChatItem key={index} message={message} email={email} />
//                   ))}
//                 <div ref={this.messagesEndRef} />
//               </List>
//             </Grid>

//             <Grid item className={css.chatinput} style={styles.gridItemMessage}>
//               <Grid container direction="row" justify="center" alignItems="center">
//                 <Grid item style={styles.textFieldContainer}>
//                   <input
//                     type="text"
//                     placeholder="Enter message"
//                     id="textMessage"
//                     name="textMessage"
//                     value={text}
//                     onChange={event => {
//                       this.updateText(event);
//                     }}
//                     onKeyPress={e => {
//                       if (e.key === 'Enter' && e.shiftKey == false) {
//                         e.preventDefault();
//                         this.sendMessage();
//                       }
//                     }}
//                   />
//                 </Grid>

//                 <Grid item>
//                   <IconButton style={styles.sendButton} onClick={() => this.sendMessage()}>
//                     <Send style={styles.sendIcon} />
//                   </IconButton>
//                 </Grid>
//               </Grid>
//             </Grid>
//           </Grid>
//           {/* </Container> */}
//         </Drawer>
//       </div>
//     );
//   }
// }

// const styles = {
//   textField: { width: '100%', borderWidth: 0, borderColor: 'transparent' },
//   textFieldContainer: { flex: 1, marginRight: 12 },
//   gridItem: { paddingTop: 12, paddingBottom: 12 },
//   gridItemChatList: { overflow: 'auto', height: '70vh' },
//   gridItemMessage: { marginTop: 12, marginBottom: 12 },
//   sendButton: { backgroundColor: '#3f51b5' },
//   sendIcon: { color: 'white' },
//   mainGrid: { paddingTop: 30, borderWidth: 1 },
// };
// const mapStateToProps = state => {
//   const { currentUser } = state.user;
//   return { currentUser };
// };
// export default compose(
//   withRouter,
//   connect(
//     mapStateToProps
//     // mapDispatchToProps
//   ),
//   injectIntl
// )(ChatSreen);

import React, { useState, useRef, useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Backdrop, CircularProgress, Grid, IconButton, List, Drawer } from '@material-ui/core';
import { Send } from '@material-ui/icons';
import ChatItem from './ChatItem';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';

import css from '../MeetingNewPage/Meeting.css';

function ChatComponent(props) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const [anchor, setAnchor] = useState('right');
  const [isNewMessage, setIsNewMessage] = useState(false);
  const messagesEndRef = useRef();
  const scrollDiv = useRef();

  const styles = {
    textField: { width: '100%', borderWidth: 0, borderColor: 'transparent' },
    textFieldContainer: { flex: 1, marginRight: 12 },
    gridItem: { paddingTop: 12, paddingBottom: 12 },
    gridItemChatList: { overflow: 'auto', height: '70vh' },
    gridItemMessage: { marginTop: 12, marginBottom: 12 },
    sendButton: { backgroundColor: '#3f51b5' },
    sendIcon: { color: 'white' },
    mainGrid: { paddingTop: 30, borderWidth: 1 },
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView();
  };

  const handleMessageAdded = message => {
    // console.log('111 handleMessageAdded', this.state);
    setMessages([...messages, message]), scrollToBottom();
  };
  console.log(messages);

  useEffect(() => {
    // async () => {
    window.socket &&
      window.socket.on('meeting-message', message => {
        console.log(12, message);
        setIsNewMessage(true);
        setMessages([...messages, message]);

        scrollToBottom();
      });
    // };
  });

  const updateText = e => {
    setText(e.target.value);
  };
  const sendMessage = () => {
    const { currentUser } = props;
    const displayName = currentUser && currentUser.attributes.profile.displayName;
    const email = currentUser && currentUser.attributes.email;

    // console.log('111 sendMessage>>>', this.state);
    if (text) {
      setLoading(true);
      //   channel.sendMessage(String(text).trim());
      window.socket &&
        window.socket.emit('meeting-message', { author: email, text, dateUpdated: new Date() });
      setText('');
      setLoading(false);
    }
  };
  const toggleDrawer = () => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsChatOpen(!isChatOpen);
    setIsNewMessage(false);
  };
  return (
    <div>
      <button
        type="button"
        onClick={toggleDrawer()}
        className="MuiButtonBase-root MuiButton-root MuiButton-text ct-btn"
      >
        <span>
          <i class="fas fa-comment-alt"></i>
          {isNewMessage && <sup>*</sup>}
        </span>
        {/* <ChatScreen /> */}
        Chat{' '}
        {isNewMessage && (
          <span className="msgpop" style={{ fontSize: '20px' }}>
            *
          </span>
        )}
      </button>
      <Drawer anchor={anchor} open={isChatOpen} onClose={toggleDrawer()}>
        {/* <Container component="main" maxWidth="md"> */}
        <Backdrop open={loading} style={{ zIndex: 99999 }}>
          <CircularProgress style={{ color: 'white' }} />
        </Backdrop>

        <Grid container direction="column" style={styles.mainGrid}>
          <Grid item style={styles.gridItemChatList}>
            <List dense={true}>
              {messages &&
                messages.map((message, index) => (
                  <ChatItem key={index} message={message} email={email} />
                ))}
              <div ref={messagesEndRef} />
            </List>
          </Grid>

          <Grid item className={css.chatinput} style={styles.gridItemMessage}>
            <Grid container direction="row" justify="center" alignItems="center">
              <Grid item style={styles.textFieldContainer}>
                <input
                  type="text"
                  placeholder="Enter message"
                  id="textMessage"
                  name="textMessage"
                  value={text}
                  onChange={event => {
                    updateText(event);
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && e.shiftKey == false) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </Grid>

              <Grid item>
                <IconButton style={styles.sendButton} onClick={() => sendMessage()}>
                  <Send style={styles.sendIcon} />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* </Container> */}
      </Drawer>
    </div>
  );
}

const mapStateToProps = state => {
  const { currentUser } = state.user;
  return { currentUser };
};
const Chat = compose(
  withRouter,
  connect(
    mapStateToProps
    // mapDispatchToProps
  ),
  injectIntl
)(ChatComponent);

export default Chat;
