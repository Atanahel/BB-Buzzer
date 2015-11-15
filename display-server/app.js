var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var display_socket;
var admin_socket;

var BB_hostname = "localhost"; //default server
if(process.argv.length>=3){
  BB_hostname = process.argv[2];
}
//Connect to the BB server
console.log('Trying to connect to BB : http://'+BB_hostname+':8111');
var BB_socket = require('socket.io-client')('http://'+BB_hostname+':8111');
BB_socket.on('connect', function() { console.log('Connected to BB');})
    .on('disconnect', function() { console.log('Disconnected to BB');});

//Main display page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/display.html');
});

//Create HTTP server
http.listen(8000, function(){
  console.log('listening on *:8000');
});

//Wait for the connections TODO separate display_socket to admin_socket
io.on('connection', function(socket){
  console.log('a user connected');
  if(!display_socket) {
    display_socket = socket;
    socket.on('disconnect', function () {
      display_socket = null;
      console.log('user disconnected');
    });
  } else {
    socket.close();
  }
});


// transfers button pressed events to the display_socket
BB_socket.on('event', function (data) {
  if (display_socket) {
    display_socket.emit("event", data);
    console.log(data + " transferred to display!");
  }else{
    console.log(data + " not transferred");
  }
});