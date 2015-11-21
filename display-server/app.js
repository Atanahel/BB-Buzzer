var express = require('express');
var app = express();
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

//Access to static files
app.use(express.static('static'));

//Create HTTP server
var port=8765;
http.listen(port, function(){
	console.log('listening on *:'+port);
});

// transfers button pressed events to the display sockets TODO output the button id directly from the BB
BB_socket.on('event', function (data) {
	switch (data){
		case 'btn1':
			game_master.button_pressed(0);
			break;
		case 'btn2':
			game_master.button_pressed(1);
			break;
		case 'btn3':
			game_master.button_pressed(2);
			break;
		case 'btn4':
			game_master.button_pressed(3);
			break;
		case 'btn5':
			game_master.button_pressed(4);
			break;
		case 'btn6':
			game_master.button_pressed(5);
			break;
		case 'btn7':
			game_master.button_pressed(6);
			break;
		default:
			console.log("Weird BB event : "+data);
			break;
	}
});

//Internal state of the data
team = function(name, x, y, color) {
	this.name = name;
	this.color = color;
	this.x = x;
	this.y = y;
	this.score = 0;
};

//List of the teams and their data
var teams = [	new team("noir",    0 +65 +(150 + 160),     160, "red"),
				new team("gris",    0 +65 +(      160),   768/2, "blue"),
				new team("mauve",    0 +65 +(150 + 160), 768-160, "orange"),
				new team("beige", 1024 -65 -(150 + 160),     160, "green"),
				new team("turquoise", 1024 -65 -(      160),   768/2, "yellow"),
				new team("orange", 1024 -65 -(150 + 160), 768-160, "pink")];

//Handling the events
var game_master = {
	current_answering_team_id : -1,
	set_current_answering_team : function(team_id) {
		this.current_answering_team_id = team_id;
		send_event_to_display({type : 'answering', team_id : this.current_answering_team_id});
	},
	reset_current_answering_team : function() {
		if (this.current_answering_team_id >= 0) {
			send_event_to_display({type: 'reset', team_id: this.current_answering_team_id});
			this.current_answering_team_id = -1;
		}
	},
	button_pressed : function(team_id) {
		if(team_id>=0 && team_id<teams.length) {
			if (this.current_answering_team_id == -1)
				this.set_current_answering_team(team_id);
			else
				send_event_to_display({type : 'press', team_id : team_id});
		}
	}
};

function send_event_to_display(event) {
	display_nsp.emit('event',event);
}

//Accept all the display connections
display_nsp.on('connection', function(socket) {
	console.log('New display connected');
	//send the actual state to the new display
	socket.emit("reset_display",teams);
	socket.on('disconnect', function () {
		console.log('Display disconnected');
	});
	socket.on('reset', function () {
		game_master.reset_current_answering_team();
	});
});

//Accept only one admin connection
admin_nsp.on('connection', function(socket){
	console.log('Admin connected');
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