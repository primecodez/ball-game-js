const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// ball
let ball = {
  x: 100,
  y: 300,
  radius: 20,
  velocityY: 0,
  onGround: true
};

// game
let obstacles = [];
let score = 0;
let speed = 6;
let spawnTimer = 0;
let gameOver = false;

// controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (gameOver) {
      resetGame(); // 🔁 restart
    } else if (ball.onGround) {
      ball.velocityY = -12;
      ball.onGround = false;
    }
  }
});

function createObstacle() {
  let type = Math.random() < 0.5 ? "thorn" : "block";

  if (type === "thorn") {
    return { x: 800 + Math.random()*200, y: 300, w: 20, h: 60, type };
  } else {
    return { x: 800 + Math.random()*200, y: 280, w: 30, h: 80, type };
  }
}

function update() {
  if (gameOver) return; // 🛑 stop game

  // physics
  ball.velocityY += 0.6;
  ball.y += ball.velocityY;

  if (ball.y >= 300) {
    ball.y = 300;
    ball.velocityY = 0;
    ball.onGround = true;
  }

  // speed scaling
  speed = 6 + Math.floor(score / 300) * 0.5;
  speed = Math.min(speed, 15);

  // spawn
  spawnTimer++;
  let spawnDelay = Math.max(30, 60 - Math.floor(score / 200));

  if (spawnTimer > spawnDelay) {
    obstacles.push(createObstacle());
    spawnTimer = 0;
  }

  // move obstacles
  obstacles.forEach(o => o.x -= speed);

  // remove off-screen
  obstacles = obstacles.filter(o => o.x > -50);

  // collision
  let ballRect = {
    x: ball.x - ball.radius,
    y: ball.y - ball.radius,
    w: ball.radius * 2,
    h: ball.radius * 2
  };

  for (let o of obstacles) {
    if (
      ballRect.x < o.x + o.w &&
      ballRect.x + ballRect.w > o.x &&
      ballRect.y < o.y + o.h &&
      ballRect.y + ballRect.h > o.y
    ) {
      gameOver = true;
    }
  }

  score++;
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ball
  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // obstacles
  obstacles.forEach(o => {
    ctx.fillStyle = o.type === "thorn" ? "red" : "blue";
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });

  // score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  // game over screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 280, 180);

    ctx.font = "20px Arial";
    ctx.fillText("Press SPACE to Restart", 270, 220);
  }
}

function resetGame() {
  ball.y = 300;
  ball.velocityY = 0;
  ball.onGround = true;

  obstacles = [];
  score = 0;
  speed = 6;
  spawnTimer = 0;

  gameOver = false;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
