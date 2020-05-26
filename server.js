
const path = require('path');
let express = require('express');
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO().listen(server);

const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/dist/chat-app'));

server.listen(port, () => {
  console.log(`started on port: ${port}`);
});

// socket io
var messages = [];
var chatters = [];

io.on('connection', (client) => {
  console.log('client connected...');

  client.on('join', (name) => {
    client.nickName = name;
    var id = client.id;
    client.join(id);
    client.emit('joined', { id: id, name: name }); //current user

    messages.forEach(message => {
      // client.emit('message', message);
      io.to(message.to).emit('messgae', message);
    });
    console.log('join...' + id + ", " + name);

    client.broadcast.emit('add chatter', { id: id, name: name });
    chatters.forEach(chatter => {
      client.emit('add chatter', chatter);
    });
    chatters.push({ id: id, name: name });
    client.broadcast.emit("allusers", chatters);
    client.emit("allusers", chatters);
    console.log(chatters.length);
  });

  client.on('room_join_request', payload => {
    const roomName = payload.roomName;
    client.join(roomName, err => {
      console.log('roome user join...'+ roomName);
      if (!err) {
        io.to(roomName).clients((err, clients) => {
          if (!err) {
            console.log('roome users emit.' + JSON.stringify(clients));
            io.to(roomName).emit('room_users', clients)
          }
        });
      }
    });
  });

  client.on('room_users_request', (payload) => {
    const roomName = payload.roomName;
    io.to(roomName).clients((err, clients) => {
      if (!err) {
        console.log('roome ' + roomName +' users emit.' + JSON.stringify(clients));
        client.emit('room_users', clients);
      }
    });
  });


  client.on('send_message', (data) => {
    console.log("sending msg.." + JSON.stringify(data));
    var id = client.id;
    var name = client.nickName;
    var msgObj = { id: id, name: name, data: data.data, date: data.date, from: data.from, to: data.to };
    // client.broadcast.emit('message', msgObj);
    io.to(data.to).emit('message', msgObj);
    client.emit('message', msgObj);
    storeMessages(id, name, msgObj.data, msgObj.date, msgObj.from, msgObj.to);
    console.log('messages length: ' + messages.length);
  });

  client.on('disconnect', (data) => {
    var id = client.id;
    var name = client.nickName;
    client.broadcast.emit('remove chatter', { id: id, name: name });
    console.log('disconnected...' + id + ", " + name);
    removeChatter(id);
    client.broadcast.emit("allusers", chatters);
    client.emit("allusers", chatters);
  });


  ///Stream related
  client.on('offer_signal', payload => {
    console.log('get offer from :'+ payload.callerId + ' to: '+ payload.calleeId);
    console.log('emit to :'+ payload.callerId);
    io.to(payload.calleeId).emit('offer', { signalData: payload.signalData, callerId: payload.callerId, calleeId: payload.calleeId });
  });

  client.on('answer_signal', payload => {
    console.log('answer signal back to :'+ payload.callerId + ' from: '+ client.id);
    console.log('emit to :'+ payload.callerId);
    io.to(payload.callerId).emit('answer', { signalData: payload.signalData, calleeId: client.id });
  });

  client.on('disconnect', () => {
    console.log('room left: '+ client.id);
    io.emit('room_left', { type: 'disconnected', socketId: client.id })
  })

  // client.on('stream', function (image) {
  //   console.log('stream broad casting');
  //   client.broadcast.emit('stream', image);
  // });
  ///Stream related end
});

var storeMessages = function (id, name, data, date, from, to) {
  messages.push({ id: id, name: name, data: data, date, from, to });
  if (messages.length > 10) {
    messages.shift();
  }
}

var removeChatter = function (id) {
  chatter = chatters.find(x => x.id == id);
  if (chatter) {
    const index = chatters.indexOf(chatter);
    if (index > -1) {
      chatters.splice(index, 1);
    }
  }
  console.log(chatters.length);
}



