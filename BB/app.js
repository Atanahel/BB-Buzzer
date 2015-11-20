var app = require('http').createServer()
var io = require('socket.io')(app);
var b = require('octalbonescript');

var current_socket;

app.listen(8111, function(){
  console.log('listening on *:8111');
});

io.on('connection', function(socket){
  console.log('a user connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
});

var led = "USR3";
var led_state = 0;
b.pinModeSync(led, b.OUTPUT);
toggleLED = function() {
    led_state = led_state ? 0 : 1;
    b.digitalWrite(led, led_state, function(err) {
      if (err) {
        console.error(err); //output any error
        return;
      }
    });
};


sendEvent = function(event) {
  console.log(event);
  io.emit("event", event);
  toggleLED();
};

var config = [
  {"pin" : "P8_08", "event" : "btn1" },
  {"pin" : "P8_10", "event" : "btn2" },
  {"pin" : "P8_12", "event" : "btn3" },
  {"pin" : "P8_14", "event" : "btn4" },
  {"pin" : "P8_16", "event" : "btn5" },
  {"pin" : "P8_18", "event" : "btn6" }
];

initialisePin = function(item) {
  b.pinModeSync(item.pin, b.INPUT_PULLUP);
  b.attachInterrupt(item.pin, b.CHANGE, function(err, resp) {
    if(err){
      console.error(err.message);
      return;
    }
    sendEvent(item.event);
  }, function(err){
    if(err){
      console.error(err.message);
      return;
    }
  });
};

config.map( initialisePin );

