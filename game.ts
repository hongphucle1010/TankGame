import "./style.css";
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error("Failed to get 2D context");
}

const ws = new WebSocket('ws://localhost:8080');

// Define interfaces for players and bullets
interface Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Tank {
  x: number;
  y: number;
  angle: number;
  speed: number;
  bullets: Bullet[];
}

// Player and other tanks
const player: Tank = { x: 400, y: 300, angle: 0, speed: 5, bullets: [] };
let otherPlayers: Tank[] = [];

// Draw the player tank
function drawTank(tank: Tank): void {
  if (!ctx) return;
  ctx.save();
  ctx.translate(tank.x, tank.y);
  ctx.rotate(tank.angle);
  ctx.fillStyle = 'green';
  ctx.fillRect(-15, -15, 30, 30);
  ctx.fillStyle = 'black';
  ctx.fillRect(-5, -20, 10, 20); // gun
  ctx.restore();
}


// Draw bullets
function drawBullets(bullets: Bullet[]): void {
  bullets.forEach((bullet) => {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  });
}

// Game Loop
function gameLoop(): void {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player and other players
  drawTank(player);
  otherPlayers.forEach((tank) => drawTank(tank));

  // Draw bullets
  drawBullets(player.bullets);

  requestAnimationFrame(gameLoop);
}

// Move player
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      player.y -= player.speed;
      break;
    case 'ArrowDown':
      player.y += player.speed;
      break;
    case 'ArrowLeft':
      player.angle -= 0.1;
      break;
    case 'ArrowRight':
      player.angle += 0.1;
      break;
    case ' ': // Shoot bullet
      const bullet: Bullet = {
        x: player.x + Math.cos(player.angle) * 20,
        y: player.y + Math.sin(player.angle) * 20,
        dx: Math.cos(player.angle) * 10,
        dy: Math.sin(player.angle) * 10,
      };
      player.bullets.push(bullet);
      ws.send(JSON.stringify({ type: 'shoot', bullet }));
      break;
  }
  ws.send(JSON.stringify({ type: 'move', player }));
});

// Update bullets
setInterval(() => {
  player.bullets.forEach((bullet) => {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
  });
  player.bullets = player.bullets.filter(
    (bullet) =>
      bullet.x > 0 &&
      bullet.x < canvas.width &&
      bullet.y > 0 &&
      bullet.y < canvas.height
  );
}, 1000 / 60);

// WebSocket handlers
ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.type === 'move') {
      otherPlayers = data.players as Tank[];
    }
  } catch (error) {
    console.error("Failed to parse WebSocket message:", error);
  }
};

gameLoop();

