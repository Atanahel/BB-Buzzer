var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var current_socket;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/send_event', function(req, res) {
  if (current_socket) {
    current_socket.emit("event", req.query.event);
    console.log(req.query.event + " sent!");
  }else{
    console.log(req.query.event + " not sent");
  }
  res.send();
});

http.listen(8111, function(){
  console.log('listening on *:8111');
});

io.on('connection', function(socket){
  console.log('a user connected');
  if(!current_socket) {
    current_socket = socket;
    socket.on('disconnect', function () {
      current_socket = null;
      console.log('user disconnected');
    });
  } else {
    socket.close();
  }
});