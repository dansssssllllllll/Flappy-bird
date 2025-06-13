const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const birdImg = new Image();
birdImg.src = "bird.png";
const pipeImg = new Image();
pipeImg.src = "pipe.png";
const flapSound = new Audio("sounds/flap.mp3");
const hitSound = new Audio("sounds/hit.mp3");

let bird = { x: 50, y: 150, width: 40, height: 40, velocity: 0 };
let pipes = [], score = 0, gameOver = false, started = false;
let gap = 150;

function startGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  started = true;
  document.getElementById('namePopup').style.display = 'none';
  animate();
}

function flap() {
  if (!gameOver && started) {
    bird.velocity = -8;
    flapSound.play();
  }
}

canvas.addEventListener("mousedown", flap);
canvas.addEventListener("touchstart", flap);
document.addEventListener("keydown", e => { if (e.code === "Space") flap(); });

function animate() {
  if (!started) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.velocity += 0.5;
  bird.y += bird.velocity;
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (pipes.length === 0 || pipes[pipes.length - 1].x < 280) {
    const topHeight = Math.floor(Math.random() * 250);
    pipes.push({ x: canvas.width, top: topHeight });
  }

  pipes.forEach(pipe => {
    pipe.x -= 3;
    ctx.drawImage(pipeImg, pipe.x, 0, 50, pipe.top);
    ctx.drawImage(pipeImg, pipe.x, pipe.top + gap, 50, canvas.height);

    if (pipe.x + 50 === bird.x) score++;

    if (
      bird.x < pipe.x + 50 &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.top + gap)
    ) {
      gameOver = true;
      hitSound.play();
      setTimeout(handleGameOver, 500);
    }
  });

  if (bird.y + bird.height > canvas.height) {
    gameOver = true;
    hitSound.play();
    setTimeout(handleGameOver, 500);
  }

  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  if (!gameOver) requestAnimationFrame(animate);
}

function handleGameOver() {
  fetch('/leaderboard')
    .then(res => res.json())
    .then(data => {
      const lowest = data.length < 5 || score > data[data.length - 1].score;
      if (lowest && score > 0) {
        document.getElementById("namePopup").style.display = "block";
      }
    });
}

function submitName() {
  const name = document.getElementById("playerName").value;
  fetch('/leaderboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  }).then(() => {
    document.getElementById("namePopup").style.display = "none";
    loadLeaderboard();
  });
}

function loadLeaderboard() {
  fetch('/leaderboard')
    .then(res => res.json())
    .then(data => {
      const lb = document.getElementById("leaderboard");
      lb.innerHTML = "<h3>🏆 Leaderboard</h3>" +
        data.map(p => `<div>${p.name}: ${p.score}</div>`).join('');
    });
}

loadLeaderboard();
                        
