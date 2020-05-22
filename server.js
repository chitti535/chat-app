
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

    client.emit('joined', {id: id, name: name}); //current user

    messages.forEach(message => {
      client.emit('message', message);
    });
     console.log('join...'+ id +", "+ name);

    client.broadcast.emit('add chatter', {id: id, name: name});
    chatters.forEach(chatter => {
      client.emit('add chatter', chatter);
    });
    chatters.push({id: id, name: name});
    client.broadcast.emit("allusers", chatters);
    client.emit("allusers", chatters);
    console.log(chatters.length);
  });

  client.on('message', (data) => {
    console.log("sending msg.." + data);
    var id = client.id;
    var name = client.nickName;
    client.broadcast.emit('message', {id: id, name: name, data: data});
    client.emit('message', {id: id, name: name, data: data});
    storeMessages(id, name, data);
    console.log('messages length: ' + messages.length);
  });

  client.on('disconnect', (data) => {
    var id = client.id;
    var name = client.nickName;
    client.broadcast.emit('remove chatter', {id: id, name: name});
    console.log('disconnected...'+ id +", "+ name);
    removeChatter(id);
    client.broadcast.emit("allusers", chatters);
    client.emit("allusers", chatters);
  });


  // ///Stream related
  // client.on('stream', function (image) {
  //   client.broadcast.emit('stream', image);
  // });
  // ///Stream related end
});

var storeMessages = function (id, name, data) {
  messages.push({ id: id, name: name, data: data });
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



