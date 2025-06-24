const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameOverScreen = document.getElementById('gameover');
const scoreboard = document.getElementById('scoreboard');
const restartBtn = document.getElementById('reset-btn')

const width = canvas.width;
const height = canvas.height;

/*Road setting*/

const roadWidth = 200;
const roadLeft = ( width - roadWidth) / 2;
const laneCount = 3;
const laneWidth = roadWidth / laneCount;

const lineHeight = 40;
const lineGap = 40;

//Road lines array

let roadLines = [];

function initRoadLines() {
    roadLines = [];
    for(let y = -lineHeight; y < height;  y += lineHeight + lineGap) {
        roadLines.push({x:width / 2 - 2, y: y});
    }
}

function drawRoad() {
    //draw road background
    ctx.fillStyle = '#333';
    ctx.fillRect(roadLeft, 0, roadWidth, height);

    //draw road side borders

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(roadLeft, 0);
    ctx.lineTo(roadLeft, height);
    ctx.moveTo(roadLeft + roadWidth, 0);
    ctx.lineTo(roadLeft + roadWidth, height);
    ctx.stroke();

    // draw dashed lane lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    roadLines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, line.y + lineHeight);
        ctx.stroke();
    });
}

function updateRoadLine() {
    roadLines.forEach(line => {
        line.y += 6;
        if( line.y > height) {
            line.y = -lineHeight - lineGap;
        }
    });
}

//Bike settings

const bikeWidth = 40;
const bikeHeight = 80;
let bikeX = roadLeft + laneWidth * 1 + (laneWidth - bikeWidth) / 2;
const bikeY = height - bikeHeight -20;
let bikeSpeed = 8;

let keys = {};

function drawBike(x, y) {
    ctx.fillStyle = '#23cc71';
    ctx.beginPath();
    ctx.moveTo(x + bikeWidth / 2, y);
    ctx.lineTo(x, y + bikeHeight);
    ctx.lineTo(x + bikeWidth, y + bikeHeight); 
    ctx.closePath();
    ctx.fill();


    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(x + 12, y + bikeHeight, 10, 0, Math.PI * 2);
    ctx.arc(x + bikeWidth - 12, y + bikeHeight, 10, 0, Math.PI * 2);
    ctx.fill();
}

window.addEventListener('keydown', e => {
  keys[e.key] = true;
});

window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

function updatePlayer() {
  if (keys['ArrowLeft'] || keys['a']) {
    bikeX -= bikeSpeed;
    if (bikeX < roadLeft) bikeX = roadLeft;
  }
  if (keys['ArrowRight'] || keys['d']) {
    bikeX += bikeSpeed;
    if (bikeX > roadLeft + roadWidth - bikeWidth) {
      bikeX = roadLeft + roadWidth - bikeWidth;
    }
  }
}

//obstacle 

const obstacleWidth = 40;
const obstacleHeight = 70;
const obstacleSpeedStart = 6;
let obstacleSpeed = obstacleSpeedStart;

let obstacles = [];
let obstacleSpawnTimer = 0;
let obstacleSpawnInterval = 1500;

class Obstacle {
  constructor(lane) {
    this.width = obstacleWidth;
    this.height = obstacleHeight;
    this.lane = lane;
    this.x = roadLeft + laneWidth * lane + (laneWidth - this.width) / 2;
    this.y = -this.height;
  }

  update() {
    this.y += obstacleSpeed;
  }

  draw() {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Wheels (black)
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(this.x + 12, this.y + this.height, 10, 0, Math.PI * 2);
    ctx.arc(this.x + this.width - 12, this.y + this.height, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  isOffScreen() {
    return this.y > height;
  }

  collidesWithPlayer() {
    return !(
      this.x + this.width < bikeX ||
      this.x > bikeX + bikeWidth ||
      this.y + this.height < bikeY ||
      this.y > bikeY + bikeHeight
    );
  }
}

function updateObstacles(deltaTime) {
  obstacleSpawnTimer += deltaTime;
  if (obstacleSpawnTimer > obstacleSpawnInterval) {
    obstacleSpawnTimer = 0;
    let lane = Math.floor(Math.random() * laneCount);
    obstacles.push(new Obstacle(lane));
  }

  obstacles.forEach((obs, index) => {
    obs.update();

    // Collision
    if (obs.collidesWithPlayer()) {
    gameOver = true;
    gameOverScreen.style.display = 'flex';
}

    // Remove offscreen obstacles
    if (obs.isOffScreen()) {
      obstacles.splice(index, 1);
      distance += 10;
      increaseDifficulty();
    }
  });
}

restartBtn.addEventListener('click', () => {
  // Reset game state
  bikeX = roadLeft + laneWidth * 1 + (laneWidth - bikeWidth) / 2;
  obstacles = [];
  obstacleSpeed = obstacleSpeedStart;
  obstacleSpawnInterval = 1500;
  distance = 0;
  gameOver = false;
  gameOverScreen.style.display = 'none';
  lastTime = 0;
  requestAnimationFrame(gameLoop);
});


let distance = 0;

function increaseDifficulty() {
  if (distance % 100 === 0 && distance > 0) {
    obstacleSpeed += 0.5;
    if (obstacleSpawnInterval > 500) obstacleSpawnInterval -= 50;
  }
}

let gameOver = false;

let lastTime = 0;

function gameLoop(time = 0) {

    if (gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    updateRoadLine();
    updatePlayer();
    updateObstacles(deltaTime);

    drawRoad();
    drawBike(bikeX, bikeY);
    obstacles.forEach(obs => obs.draw());

    scoreboard.textContent = `Distance: ${distance} m`;

    requestAnimationFrame(gameLoop);
}



initRoadLines();
requestAnimationFrame(gameLoop);
