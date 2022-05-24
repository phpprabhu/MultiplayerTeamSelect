const teams = ["Backend", "BMA", "Branded Cloud", "CDN", "CloudStack", "Customer Portal", "DEVP", "Shared Hosting", "Website"];

const socket = io('http://127.0.0.1:8000');

socket.on('init', handleCurrentState);
socket.on('countdown', showCountDown);
socket.on('gameOver', gameOver);
socket.on('current_state', handleCurrentState);

var blasted_balls = []

const no_of_balls = 500;

var game_start = false;



      // gets the canvas element
      const canvas = document.querySelector('canvas');

      // gets the width and height of browser viewport
      const width = window.innerWidth;
      const height = window.innerHeight;

      //   set the width and height of canvas equal to browser viewport
      canvas.width = width;
      canvas.height = height;

      //   call the getContext method to draw 2d shape
      const ctx = canvas.getContext('2d');

      // create Ball class
      class Ball {
        constructor(team, x, y, velx, vely, size, color) {
          this.team = team;
          this.x = x; // horizontal position of the ball
          this.y = y; // vertical position of the ball
          this.velx = velx; // velocity x added to coordinate x when we animate our ball
          this.vely = vely; // velocity y added to coordinate y
          this.size = size; // size is a radius of the ball
          this.color = color; // fill ball shape with given color
        }

        // create draw func
        drawBall() {
          ctx.beginPath(); // start drawing
          ctx.fillStyle = this.color; // fill ball shape with given color

          // x and y is center of the ball
          // size is radius of the ball
          // 0 is a start point of degree around radius of the ball
          // 2 * Math.PI is an end point which is equivalent to 360 degree
          ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
          // ctx.textAlign = 'center';
          // ctx.fillText(this.team, x, y+3);
          ctx.fill(); // finish drawing
          //ball_list.push(circle)
          //console.log(ball_list);
        }

        writeText() {
          ctx.beginPath();
          ctx.font = "30px Arial";
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText(this.team, this.x, this.y+3);
        }

        // create update func
        updateBall() {
          // if x and y position is greater than or less than
          // browser viewport than balls turn another direction
          if (this.x + this.size >= width || this.x - this.size <= 0) {
            this.velx = -this.velx;
          }

          if (this.y + this.size >= height || this.y - this.size <= 0) {
            this.vely = -this.vely;
          }

          // x and y velocity added to x and y coordinate
          // everytime updateBall func is called
          this.x += this.velx;
          this.y += this.vely;
        }
      }

      //   create random number generator func
      function random(min, max) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        return num;
      }

      //   create some balls and store in an array
      const balls = [];

      team_index = 0;

      while (balls.length < no_of_balls) {
        let size = 100;

        if (teams[team_index] == undefined) {
          team_index = 0;
        }
        team_name = teams[team_index];
        team_index++;

        // create a new instance of Ball class
        // now replace static number with random number
        const ball = new Ball(
          team_name,
          random(size, width - size),
          random(size, height - size),
          random(-7, 7),
          random(-7, 7),
          size,
          `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`
        );

        balls.push(ball);
      }

      //   create loop func
      function loop() {
        // cover the previous frame's drawing before the next one is drawn
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(0, 0, width, height);

        // run necessary func
        for (let i = 0; i < balls.length; i++) {
         if (!blasted_balls.includes(i)) {
            balls[i].drawBall();
            balls[i].writeText();
            balls[i].updateBall();
          }
        }

        // lets calls loop func itself over and over again
        //  and make animation smooth
        requestAnimationFrame(loop);
      }

      // finaly call the loop func once ot start
      loop();

      // Listen for mouse click
      canvas.addEventListener('click', function(event) {
        for (let i = 0; i < balls.length; i++) {
          if (blasted_balls.length == balls.length-1) {
             document.getElementById("winnerDiv").style.display = "flex";
            break;
          }
          if (event.offsetX > (balls[i].x - 100) && event.offsetX < (balls[i].x + 100) && event.offsetY > (balls[i].y - 100) && event.offsetY < (balls[i].y + 100)) {
            if (!blasted_balls.includes(i)) {
              socket.emit("blast_state", i);
            }
          }
          //console.log(i + ': ' + balls[i].color + balls[i].x + ", " + balls[i].y)
        }
      });

function handleGameState(blasted_balls) {
  if (!gameActive) {
    return;
  }
  console.log(blasted_balls);
}


function handleCurrentState(blasted_balls_state) {
    if(blasted_balls_state.length==0 && document.getElementById("winnerDiv")) {
        document.getElementById("winnerDiv").style.display = "none";
    }
  blasted_balls = blasted_balls_state;
}

function startGame() {
     socket.emit("start_game", "start");
}

function clearGame() {
     socket.emit("clear_game", "clear");
}

function showCountDown() {
    document.getElementById("overlayDiv").style.display = "flex";
    setTimeout(function () {
        document.getElementById("overlayDiv").style.display = "none";
    }, 3500);
}

function gameOver() {
    document.getElementById("winnerDiv").style.display = "flex";
}
