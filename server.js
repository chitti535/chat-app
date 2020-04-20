let express = require('express');
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.port || 3000;

io.on('connection', (socket)=> {
    console.log('user connected');
});

 // Redirect all the other resquests
 this.app.get('*', (req, res) => {
  if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(`dist/${req.url}`));
  } else {
    res.sendFile(path.resolve('dist/index.html'));
  }
});

server.listen(port, ()=>{
    console.log(`started on port: ${port}`);
});
