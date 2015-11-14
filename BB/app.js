var app = require('http').createServer()
var io = require('socket.io')(app);
var b = require('bonescript');

app.listen(8111, function(){
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
    //TEST!!!
    setTimeOut(function(){sendEvent("btn1");},1000);
    setTimeOut(function(){sendEvent("btn2");},2000);
    setTimeOut(function(){sendEvent("btn3");},3000);
    setTimeOut(function(){sendEvent("btn4");},4000);

  } else {
    socket.close();
  }
});

var led = "USR3";
var state = 0;
b.pinMode(led, 'out');
toggleLED = function() {
    state = state ? 0 : 1;
    b.digitalWrite(led, state);
};

sendEvent = function(event) {
  if(current_socket) {
    current_socket.emit("event",event);
    console.log("Sent event : "+event);
    toggleLED();
  } else {
    console.log("Could not send event : "+event);
  }
}
