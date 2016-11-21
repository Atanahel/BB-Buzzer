# BB-Buzzer
Homemade buzzer system with BeagleBone Black and NodeJS

## Installation
Run `npm install` in each subdirectory to get the dependencies.

## Running
Run `node app` in `BB-simulator` to have a node server simulating the presses of buttons on port 8111.

Run `node app` in `display-server` to have the main game system on port 8000.

## Architecture
The node server on the BB is just waiting for one socket.io connection on its 8111 port and send the events it detects.

The main node server connects to the BB as a client to receive the events, then have a socket.io server to communicate with the `display.html` page and the `admin.html` page.


Connection :

[ | ] btn1
[ | ] btn5
[ | ] btn2
[ | ] btn6
[ | ] btn3
[X|X] UNUSED
[ | ] btn4