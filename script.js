console.log("Script loaded!"); // ✅ Confirm script is running

const plane = document.getElementById("plane");
const scoreDisplay = document.getElementById("score");
const gameOverText = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

let planeY = 200;
let velocity = 0;
let gravity = 0.4;
let lift = -8;
let score = 0;
let gameRunning = true;
let obstacleSpeed = 5;
let startTime = Date.now();
let obstacles = [];
let highScore = localStorage.getItem("highScore") || 0;

// 🛫 Create new obstacles
function spawnObstacle() {
  if (!gameRunning) return;

  const xPos = window.innerWidth + Math.random() * 300;
  const createBoth = Math.random() < 0.4; // 40% chance of both bird + mountain
  let gap = 150; // Minimum vertical gap between bird and mountain

  if (createBoth) {
    // 🐦 Bird high
    const birdY = Math.floor(Math.random() * (window.innerHeight * 0.4)); // upper part
    const bird = createObstacle("assets/obstacles/bird.png", "custom", xPos, 80, birdY);
    obstacles.push({ el: bird, x: xPos });

    // 🌄 Mountain low
    const mountain = createObstacle("assets/obstacles/mountain.png", "bottom", xPos, 450);
    obstacles.push({ el: mountain, x: xPos });
  } else {
    const type = Math.random();

    if (type < 0.5) {
      // 🌄 Mountain (medium or double)
      if (Math.random() < 0.5) {
        const m = createObstacle("assets/obstacles/mountain.png", "bottom", xPos, 450);
        obstacles.push({ el: m, x: xPos });
      } else {
        const gap = 120;
        const m1 = createObstacle("assets/obstacles/mountain.png", "bottom", xPos, 450);
        const m2 = createObstacle("assets/obstacles/mountain.png", "bottom", xPos + 400 + gap, 250);
        obstacles.push({ el: m1, x: xPos });
        obstacles.push({ el: m2, x: xPos + 150 + gap });
      }
    } else {
      // 🐦 Bird only
      const birdY = Math.floor(Math.random() * (window.innerHeight * 0.6));
      const b = createObstacle("assets/obstacles/bird.png", "custom", xPos, 80, birdY);
      obstacles.push({ el: b, x: xPos });
    }
  }

  const delay = 1800 + Math.random() * 1500;
  setTimeout(spawnObstacle, delay);
}


// 🎮 Controls
function jump() {
  if (!gameRunning) {
    restartBtn.click();
  } else {
    velocity = lift;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});
document.addEventListener("touchstart", () => jump());

// 🎮 Game Loop
function update() {
  if (!gameRunning) return;

  const elapsedTime = (Date.now() - startTime) / 1000;
  obstacleSpeed = 5 + elapsedTime * 0.05;

  velocity += gravity;
  planeY += velocity;

  // Boundaries
  if (planeY < 0) {
    planeY = 0;
    velocity = 0;
  }
  if (planeY > window.innerHeight * 0.8 - 60) {
    planeY = window.innerHeight * 0.8 - 60;
    velocity = 0;
  }

  plane.style.top = `${planeY}px`;

  obstacles.forEach((obs, index) => {
    obs.x -= obstacleSpeed;
    obs.el.style.left = `${obs.x}px`;

    if (obs.x < -60) {
      obs.el.remove();
      obstacles.splice(index, 1);
      score++;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }

      scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
    }

    const obsRect = obs.el.getBoundingClientRect();
    const planeRect = plane.getBoundingClientRect();
    const buffer = 10;

    if (
      planeRect.right - buffer > obsRect.left + buffer &&
      planeRect.left + buffer < obsRect.right - buffer &&
      planeRect.bottom - buffer > obsRect.top + buffer &&
      planeRect.top + buffer < obsRect.bottom - buffer
    ) {
      console.log("Collision with:", obs.el.src);
      gameOver();
    }
  });

  requestAnimationFrame(update);
}

// 🧱 Obstacle creator
function createObstacle(src, position, xPos, size = 60, customY = 0) {
  const obs = document.createElement("img");
  obs.src = src;
  obs.classList.add("obstacle");
  obs.style.width = `${size}px`;
  obs.style.left = `${xPos}px`;
  obs.style.position = "absolute";

  if (position === "bottom") {
    obs.style.bottom = "0";
  } else if (position === "custom") {
    obs.style.top = `${customY}px`;
  } else {
    obs.style.top = "0";
  }

  document.getElementById("game").appendChild(obs);
  return obs;
}

// 💥 Game Over
function gameOver() {
  gameRunning = false;
  gameOverText.style.display = "block";
  restartBtn.style.display = "inline-block";
}

// 🔁 Restart
restartBtn.addEventListener("click", () => {
  document.querySelectorAll(".obstacle").forEach(o => o.remove());
  obstacles = [];
  score = 0;
  planeY = 200;
  velocity = 0;
  gameRunning = true;
  obstacleSpeed = 5;
  startTime = Date.now();

  scoreDisplay.textContent = `Score: 0 | High Score: ${highScore}`;
  gameOverText.style.display = "none";
  restartBtn.style.display = "none";

  plane.style.top = `${planeY}px`;

  spawnObstacle();
  update();
});

// 🚀 Start
scoreDisplay.textContent = `Score: 0 | High Score: ${highScore}`;
spawnObstacle();
update();













