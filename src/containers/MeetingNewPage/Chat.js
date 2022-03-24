import React from 'react';
import css from '../MeetingNewPage/Meeting.css';
import { Backdrop, CircularProgress, Grid, IconButton, List, Drawer } from '@material-ui/core';
import { Send } from '@material-ui/icons';
import ChatItem from './ChatItem';
// import Twilio from 'twilio-chat';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Chatbody from '../../twilio/components/Buttons/Chatbody';

// import { resolve } from 'url';

// const backend_server = process.env.REACT_APP_BACKEND_SERVER_URL;
// let Twilio = {};
// // if (typeof window !== 'undefined') Twilio = require('twilio-chat');
// else Twilio = undefined;
class ChatSreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      messages: [],
      loading: false,
      channel: null,
      isChatOpen: false,
      email: '',
      room: '',
      anchor: 'right',
      isNewMessage: false,
    };

    this.scrollDiv = React.createRef();
    this.messagesEndRef = React.createRef();
  }

  handleMessageAdded = message => {
    const { messages } = this.state;
    // console.log('111 handleMessageAdded', this.state);
    this.setState(
      {
        messages: [...messages, message],
      },
      this.scrollToBottom
    );
  };

  scrollToBottom = () => {
    if (this.messagesEndRef.current) this.messagesEndRef.current.scrollIntoView();
  };
  componentDidMount = async () => {
    window.socket &&
      window.socket.on('meeting-message', message => {
        this.setState(
          { isNewMessage: true, messages: [...this.state.messages, message] },
          this.scrollToBottom
        );
      });
  };

  updateText = e => {
    this.setState({
      text: e.target.value,
    });
  };
  sendMessage = e => {
    e.preventDefault();
    const { currentUser } = this.props;
    console.log(333, currentUser);
    const type = currentUser?.attributes?.profile?.protectedData?.isLawyer;
    console.log(555, type);
    const displayName = currentUser && currentUser.attributes.profile.displayName;

    const email = currentUser && currentUser.attributes.email;
    const { text, channel } = this.state;
    // console.log('111 sendMessage>>>', this.state);
    if (text) {
      this.setState({ loading: true });
      //   channel.sendMessage(String(text).trim());
      // this.handleMessageAdded(text);
      window.socket &&
        window.socket.emit('meeting-message', {
          author: displayName,
          text,
          dateUpdated: new Date(),
          type: type,
        });
      this.setState({ text: '', loading: false });
    }
  };
  toggleDrawer = () => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    // setIsChatOpen(!isChatOpen);
    this.setState({ ...this.state, isChatOpen: !this.state.isChatOpen, isNewMessage: false });
  };

  render() {
    // console.log('111 props>', this.props);
    const { currentUser } = this.props;
    const displayName = currentUser && currentUser.attributes.profile.displayName;
    const email = currentUser && currentUser.attributes.email;
    const { anchor, isChatOpen, loading, messages, text, isNewMessage } = this.state;
    return (
      <Chatbody
        updateText={this.updateText}
        sendMessage={this.sendMessage}
        sideChat={this.props.sideChat}
        closeChat={this.props.closeChat}
        text={this.state.text}
        messages={this.state.messages}
      />
    );
  }
}

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
const mapStateToProps = state => {
  const { currentUser } = state.user;
  return { currentUser };
};
export default compose(
  withRouter,
  connect(
    mapStateToProps
    // mapDispatchToProps
  ),
  injectIntl
)(ChatSreen);
