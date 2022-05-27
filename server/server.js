// npm install express,  socket.io
// npx nodemon server.js
// npx live-server
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);

var game_start = false;
var blasted_balls = []
var clients_connected = 0;
const no_of_balls = 500;

const io = require("socket.io")(server, {
  cors: {
    origin: "http://127.0.0.1:8080",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
 });

io.on('connection', (sock) => {
    clients_connected++;
    console.log("Someone connected" + clients_connected);
    io.emit('players_count', clients_connected);

    sock.on('disconnect', function(){
        clients_connected--;
        io.emit('players_count', clients_connected);
        console.log(sock.id + ' disconnected');
    })

    sock.emit('init', blasted_balls);

    sock.on('blast_state', (blasted_ball) => {
        if (game_start) {
            if (blasted_balls.length < no_of_balls - 1) {
                if (!blasted_balls.includes(blasted_ball)) {
                    blasted_balls.push(blasted_ball)
                }
            io.emit('current_state', blasted_balls)
            } else {
                io.emit('gameOver', 'winner selected');
            }
        }
    });

    sock.on('clear_game', (clear) => {
        blasted_balls = []
        game_start = false;
        io.emit('current_state', blasted_balls)
    });

    sock.on('start_game', (start) => {
        blasted_balls = []
        io.emit('countdown', 'show')
        io.emit('current_state', blasted_balls)
        setTimeout(function () {
            game_start = true;
        }, 3000);
    });
});

server.on('error', (err) => {
    console.log(err);
});

function emitGameState(blasted_balls) {
  // Send this event to everyone
    sock.emit('gameState', blasted_balls);
}


server.listen(8000, ()=>{
console.log('Started on 8000')});
