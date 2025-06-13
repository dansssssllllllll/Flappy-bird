const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const flapSound = new Audio('sounds/flap.mp3');
const hitSound = new Audio('sounds/hit.mp3');

const birdImg = new Image();
birdImg.src = 'bird.png';

const pipeImg = new Image();
pipeImg.src = 'pipe.png';

let birdY = 150;
let birdVelocity = 0;
let gravity = 0.6;
let jump = -10;
let score = 0;
let pipes = [];
let gameInterval;
let gameOver = false;

document.addEventListener('keydown', () => {
  birdVelocity = jump;
  flapSound.play();
});

function drawBird() {
  ctx.drawImage(birdImg, 45, birdY - 20, 40, 40);
}

function drawPipes() {
  pipes.forEach(pipe => {
    // top pipe (flipped)
    ctx.save();
    ctx.translate(pipe.x + 25, pipe.top);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -25, 0, 50, pipe.top);
    ctx.restore();
    // bottom pipe
    ctx.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, 50, pipe.bottom);
  });
}

function updatePipes() {
  pipes.forEach(pipe => pipe.x -= 2);

  if (pipes.length === 0 || pipes[pipes.length - 1].x < 250) {
    let top = Math.random() * 200 + 50;
    let bottom = canvas.height - top - 150;
    pipes.push({ x: canvas.width, top: top, bottom: bottom });
  }

  if (pipes.length && pipes[0].x < -50) {
    pipes.shift();
    score++;
    document.getElementById('score').innerText = score;
  }
}

function checkCollision() {
  for (let pipe of pipes) {
    if (
      60 > pipe.x && 60 < pipe.x + 50 &&
      (birdY < pipe.top || birdY > canvas.height - pipe.bottom)
    ) {
      return true;
    }
  }
  if (birdY > canvas.height || birdY < 0) return true;
  return false;
}

function endGame() {
  clearInterval(gameInterval);
  gameOver = true;
  hitSound.play();
  let name = prompt("High Score! Enter your name:");
  if (name) {
    fetch('/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    }).then(updateLeaderboard);
  }
}

function updateLeaderboard() {
  fetch('/leaderboard')
    .then(res => res.json())
    .then(data => {
      const lb = document.getElementById('leaderboard');
      lb.innerHTML = '<h3>Leaderboard</h3>' +
        data.map(entry => `<p>${entry.name}: ${entry.score}</p>`).join('');
    });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBird();
  drawPipes();

  birdY += birdVelocity;
  birdVelocity += gravity;

  updatePipes();

  if (checkCollision()) endGame();
}

function startGame() {
  pipes = [];
  birdY = 150;
  birdVelocity = 0;
  score = 0;
  gameOver = false;
  document.getElementById('score').innerText = score;
  updateLeaderboard();
  gameInterval = setInterval(gameLoop, 1000 / 60);
}

startGame();
