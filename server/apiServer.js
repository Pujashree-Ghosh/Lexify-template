// NOTE: this server is purely a dev-mode server. In production, the
// server/index.js server also serves the API routes.

// Configure process.env with .env.* files
require('./env').configureEnv();
// require('./globalHelpers');
const http = require('http');
const https = require('https');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./apiRouter');
const wellKnownRouter = require('./wellKnownRouter');
require('./globalHelpers');
const radix = 10;
const PORT = parseInt(process.env.REACT_APP_DEV_API_SERVER_PORT, radix);
const app = express();
const socketIo = require('socket.io');
const server = http.createServer(app);

app.use(express.json());

// const io = socketIo(3502, {
//   cors: {
//     origin: '*',
//   },
// });
// //socket backend
// var interval;
// const connectedUsers = [];
// io.on('connection', socket => {
//   console.log('New client connected', socket.handshake.query);
//   const roomId = socket.handshake.query.roomId; //listingid-transectionid
//   // const actualStartTime = socket.handshake.query.actualStartTime || false;
//   const customerJoinTime = socket.handshake.query.customerJoinTime || false;
//   const maxStartTime = socket.handshake.query.maxStartTime || false;
//   // maxStartTime
//   // customerJoinTime
//   socket.join(roomId);
//   // const clients = io.sockets.adapter.rooms.get('1');
//   // console.log('clients', clients);
//   const role = socket.handshake.query.role;
//   connectedUsers[roomId] = connectedUsers[roomId] || {
//     waitingRoom: [],
//     meetingRoom: [],
//     providerJoinedAt: null,
//     customerJoinedAt: null,
//     isCustomerJoinedAgain: false,
//     isProviderJoinedAgain: false,
//     isExtended: false,
//     // actualStartTime,
//     // customerJoinTime,
//   };
//   connectedUsers[roomId] = {
//     ...connectedUsers[roomId],
//     actualStartTime: connectedUsers[roomId].actualStartTime,
//     customerJoinTime: connectedUsers[roomId].customerJoinTime || customerJoinTime,
//     maxStartTime: connectedUsers[roomId].maxStartTime || maxStartTime,
//   };
//   if (role === 'customer') {
//     if (!connectedUsers[roomId].customerJoinedAt) {
//       connectedUsers[roomId].customerJoinedAt = Date.now();
//     } else {
//       connectedUsers[roomId].isCustomerJoinedAgain = true;
//     }
//     if (!connectedUsers[roomId].customerJoinTime) {
//       connectedUsers[roomId].customerJoinTime = Date.now();
//     }
//   }
//   if (role === 'provider') {
//     if (!connectedUsers[roomId].providerJoinedAt) {
//       connectedUsers[roomId].providerJoinedAt = Date.now();
//     } else {
//       connectedUsers[roomId].isProviderJoinedAgain = true;
//     }
//   }
//   connectedUsers[roomId].waitingRoom = [role, ...(connectedUsers[roomId].waitingRoom || [])];
//   console.log(connectedUsers[roomId], role);
//   if (role === 'customer' || connectedUsers[roomId].waitingRoom.includes('customer')) {
//     io.in(roomId).emit('customer-connected', connectedUsers[roomId]);
//     // socket.to(roomId).broadcast.emit('customer connected');
//   }
//   if (role === 'provider' || connectedUsers[roomId].waitingRoom.includes('provider')) {
//     // socket.to(roomId).broadcast.emit('provider connected');
//     console.log(180);
//     io.in(roomId).emit('provider-connected', connectedUsers[roomId]);
//   }
//   if (
//     connectedUsers[roomId].meetingRoom &&
//     connectedUsers[roomId].meetingRoom.includes('provider')
//   ) {
//     io.in(roomId).emit('meeting', {
//       status: 'open',
//       isProvider: true,
//       actualStartTime: connectedUsers[roomId].actualStartTime,
//       customerJoinTime: connectedUsers[roomId].customerJoinTime,
//     });
//   }
//   if (
//     connectedUsers[roomId].meetingRoom &&
//     connectedUsers[roomId].meetingRoom.includes('customer')
//   ) {
//     io.in(roomId).emit('meeting', {
//       status: 'open',
//       isProvider: false,
//       actualStartTime: connectedUsers[roomId].actualStartTime,
//       customerJoinTime: connectedUsers[roomId].customerJoinTime,
//     });
//   }

//   if (interval) {
//     clearInterval(interval);
//   }

//   interval = setInterval(() => getApiAndEmit(socket), 1000);

//   socket.on('meeting-server', data => {
//     console.log('meeting-server', data);
//     if (data.status === 'close') {
//       connectedUsers[roomId].meetingRoom = connectedUsers[roomId].meetingRoom || [];
//       console.log(connectedUsers[roomId]);
//       const revIndex = connectedUsers[roomId].meetingRoom.findIndex(item => item === role);
//       console.log('revIndex', revIndex);
//       if (revIndex !== -1) {
//         let oldUsers = connectedUsers[roomId].meetingRoom;
//         oldUsers.splice(revIndex, 1);
//         connectedUsers[roomId].meetingRoom = oldUsers;
//         console.log(connectedUsers[roomId]);
//       }
//     } else if (data.status === 'open') {
//       console.log(258, connectedUsers[roomId.actualStartTime]);
//       if (!connectedUsers[roomId].actualStartTime && data.isProvider) {
//         console.log(260);
//         connectedUsers[roomId].actualStartTime = Math.min(
//           new Date().getTime(),
//           connectedUsers[roomId].maxStartTime
//         );
//       }
//       connectedUsers[roomId] = connectedUsers[roomId] || {};
//       connectedUsers[roomId].meetingRoom = [role, ...(connectedUsers[roomId].meetingRoom || [])];
//     }

//     data.actualStartTime = connectedUsers[roomId].actualStartTime;
//     console.log(data);
//     io.in(roomId).emit('meeting', data);
//   });

//   socket.on('meeting-message', data => {
//     io.in(roomId).emit('meeting-message', data);
//   });

//   socket.on('meeting-time-extend', time => {
//     connectedUsers[roomId].actualStartTime = moment(connectedUsers[roomId].actualStartTime).add(
//       5,
//       'm'
//     );
//     connectedUsers[roomId].isExtended = true;

//     io.in(roomId).emit('meeting-time-extend', time);
//   });
//   socket.on('disconnect', () => {
//     connectedUsers[roomId].waitingRoom = connectedUsers[roomId].waitingRoom || [];
//     console.log(connectedUsers[roomId]);
//     let revIndex = connectedUsers[roomId].waitingRoom.findIndex(item => item === role);
//     console.log('revIndex', revIndex);
//     if (revIndex !== -1) {
//       let oldUsers = connectedUsers[roomId].waitingRoom;
//       oldUsers.splice(revIndex, 1);
//       connectedUsers[roomId].waitingRoom = oldUsers;
//       console.log(connectedUsers[roomId]);
//     }
//     connectedUsers[roomId].meetingRoom = connectedUsers[roomId].meetingRoom || [];
//     console.log(connectedUsers[roomId]);
//     revIndex = connectedUsers[roomId].meetingRoom.findIndex(item => item === role);
//     console.log('revIndex', revIndex);
//     if (revIndex !== -1) {
//       let oldUsers = connectedUsers[roomId].meetingRoom;
//       oldUsers.splice(revIndex, 1);
//       connectedUsers[roomId].meetingRoom = oldUsers;
//       console.log(connectedUsers[roomId]);
//     }
//     if (role === 'customer') {
//       io.in(roomId).emit('customer-disconnected');
//     }
//     if (role === 'provider') {
//       io.in(roomId).emit('provider-disconnected');
//     }
//     console.log('Client disconnected');
//     clearInterval(interval);
//   });
// });

// const getApiAndEmit = socket => {
//   const response = new Date();
//   // Emitting a new message. Will be consumed by the client
//   socket.emit('FromAPI', response);
// };



const io = socketIo(3502, {
  cors: {
    origin: '*',
  },
});
const connectedUsers = [];
console.log("hello")
io.on('connection', socket => {
  const roomId = socket.handshake.query.roomId;
  
  connectedUsers[roomId] = connectedUsers[roomId] || {
    users: [],
  };
  socket.join(roomId);
  socket.on('onConnect', (roomId, id) => {
    if (connectedUsers[roomId]?.users.filter(f => f.id === id).length) {
      io.in(roomId).emit('status', 'alreadyPresent');
    } else {
      connectedUsers[roomId]?.users?.push({ id, socketId: socket.id });
      io.in(roomId).emit('status', 'connected');
    }
    console.log('connected : ' + connectedUsers[roomId].users.map(m => m.socketId));
  });
  socket.on('disconnect', () => {
    console.log(connectedUsers[roomId].users.findIndex(i => i.socketId === socket.id));
    const index = connectedUsers[roomId].users.findIndex(i => i.socketId === socket.id);
    if (index !== -1) {
      connectedUsers[roomId].users.splice(index, 1);
    }
    console.log('deletedUser ' + socket.id);
    console.log(connectedUsers[roomId].users.map(m => m.socketId));
  });
});



// NOTE: CORS is only needed in this dev API server because it's
// running in a different port than the main app.
app.use(
  cors({
    origin: process.env.REACT_APP_CANONICAL_ROOT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/.well-known', wellKnownRouter);
app.use('/api', apiRouter);

server.listen(PORT, () => {
  console.log(`API server listening on ${PORT}`);
});
