var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var display_nsp = io.of('/display');
var admin_nsp = io.of('/admin');
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
//Administration page
app.get('/admin', function(req, res){
  res.sendFile(__dirname + '/admin.html');
});

//Create HTTP server
http.listen(8000, function(){
  console.log('listening on *:8000');
});

//Accept all the display connections
display_nsp.on('connection', function(socket) {
  console.log('New display connected');
  socket.on('disconnect', function () {
    console.log('Display disconnected');
  });
});

//Accept only one admin connection
admin_nsp.on('connection', function(socket){
  console.log('a user connected');
  if(!admin_socket) {
    admin_socket = socket;
    socket.on('disconnect', function () {
      admin_socket = null;
      console.log('Admin disconnected');
    });
  } else {
    console.log('Refusing new admin');
    socket.close();
  }
});

// transfers button pressed events to the display sockets
BB_socket.on('event', function (data) {
  display_nsp.emit('event',data);
});