const path = require('path');
let express = require('express');
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.port || 3000;
app.use(express.static(__dirname + '/dist/chart-app'));

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
    messages.forEach(message => {
      client.emit('message', message.name + ' : ' + message.data);
    });

    client.broadcast.emit('add chatter', name);
    chatters.forEach(chatter => {
      client.emit('add chatter', chatter);
    });
    chatters.push(name);

    // redisClient.lrange("messages", 0, -1, (err, messages) => {
    //   messages = messages.reverse();
    //   messages.forEach(message => {
    //     client.emit('message', message.name + ' : ' + message.data);
    //   });
    // });
  });

  client.on('messages', (data) => {
    var nickName = client.nickName;
    client.broadcast.emit('message', nickName + ' : ' + data);
    client.emit('message', nickName + ' (me) : ' + data);
    storeMessages(nickName, data);
  });

  client.on('disconnect', (data) => {
    var nickName = client.nickName;
    client.broadcast.emit('remove chatter', nickName);
  });
});

var storeMessages = function (name, data) {
  // var message = JSON.stringify({ name: name, data: data });
  // redisClient.lpush("messages", message, (err, response) => {
  //   redisClient.ltrim("messages", 0, 9);
  // });

  messages.push({ name: name, data: data });
  if (messages.length > 10) {
    messages.shift();
  }
}


