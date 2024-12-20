import { Arena } from "./Entity/arena";
import { Bullet } from "./Entity/bullet";
import { Player } from "./Entity/player";
import { Tank } from "./Entity/tank";
import { Vector2D } from "./Entity/vector2d";
import { Wall } from "./Entity/wall";
import webrtc from "./webrtc";

export class Game {
  private arena: Arena;
  private players: Player[];
  private bullets: Bullet[];
  private isRunning: boolean;
  private ctx: CanvasRenderingContext2D;
  private keyState: { [key: string]: boolean } = {};
  private lastUpdateTime: number = performance.now();
  private showWinnerModal: (winner: Player | null) => void;

  constructor(
    ctx: CanvasRenderingContext2D,
    tankSize: number,
    showWinnerModal: (winnerName: Player | null) => void
  ) {
    this.ctx = ctx;
    this.arena = new Arena(ctx, tankSize);
    this.players = [];
    this.bullets = [];
    this.isRunning = false;
    this.showWinnerModal = showWinnerModal;

    // Set up key event listeners for player 1
    window.addEventListener("keydown", (event) => {
      const keysPlayer1 = ["w", "a", "s", "d", "j"];
      if (keysPlayer1.includes(event.key)) {
        this.keyState[event.key] = true;
      }
      // No need to send keyState here
    });

    window.addEventListener("keyup", (event) => {
      const keysPlayer1 = ["w", "a", "s", "d", "j"];
      if (keysPlayer1.includes(event.key)) {
        this.keyState[event.key] = false;
      }
      // No need to send keyState here
    });

    // Remove event listeners for keyState2
  }

  startGame(): void {
    this.isRunning = true;
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    this.handleInput();

    // Send player1's position and direction after handling input
    const player1 = this.players[0];
    webrtc.sendData({
      type: "answer",
      topic: "position",
      data: JSON.stringify({
        position: player1.tank.position,
        direction: player1.tank.direction,
      }),
    });

    // Update tanks, bullets, and other game elements
    this.players.forEach((player) => player.update(deltaTime));
    this.bullets.forEach((bullet) =>
      bullet.update(deltaTime, this.getAliveTanks())
    );

    // Remove inactive bullets
    this.bullets = this.bullets.filter((bullet) => bullet.isActive);

    // Remove dead players
    this.players = this.players.filter((player) => player.tank.isAlive);

    // Check for game over condition
    if (this.players.length === 1) {
      this.isRunning = false;
      this.showWinnerModal(this.players[0]);
    } else if (this.players.length === 0) {
      this.isRunning = false;
      this.showWinnerModal(null); // No winner (draw)
    }
  }

  private getAliveTanks(): Tank[] {
    return this.players
      .filter((player) => player.tank.isAlive)
      .map((player) => player.tank);
  }

  private handleInput(): void {
    this.players.forEach((player, index) => {
      if (!player.tank.isAlive) return;

      const controls = {
        forward: "w",
        backward: "s",
        rotateLeft: "a",
        rotateRight: "d",
        shoot: "j",
      };
      let keyState;

      if (index === 0) {
        // Handle input only for player 1
        keyState = this.keyState;
      } else {
        return;
      }

      // Determine movement direction
      if (keyState[controls.forward] || keyState[controls.backward]) {
        const forward = keyState[controls.forward];
        const rad = (player.tank.direction * Math.PI) / 180;
        const delta = forward ? player.tank.speed : -player.tank.speed;
        const newPosition = new Vector2D(
          player.tank.position.x + Math.cos(rad) * delta,
          player.tank.position.y + Math.sin(rad) * delta
        );

        // Check for collision with walls and other tanks
        if (
          !player.tank.checkCollision(newPosition, this.getWalls()) &&
          !this.isPositionOccupied(
            newPosition,
            player.tank.getSize(),
            player.tank
          )
        ) {
          player.tank.position = newPosition;
        }
      }

      if (keyState[controls.rotateLeft]) {
        player.tank.rotate(-2);
      }
      if (keyState[controls.rotateRight]) {
        player.tank.rotate(2);
      }

      if (keyState[controls.shoot]) {
        const bullet = player.tank.shoot();
        if (bullet) {
          this.addBullet(bullet);

          // Send a shoot signal over WebRTC with bullet data
          webrtc.sendData({
            type: "answer",
            topic: "shoot",
            data: JSON.stringify({
              position: bullet.position,
              direction: bullet.direction,
              timestamp: Date.now(), // Current timestamp
            }),
          });
        }
        // Prevent continuous shooting by resetting the key state
        keyState[controls.shoot] = false;
      }
    });
  }

  private isPositionOccupied(
    position: Vector2D,
    size: number,
    movingTank: Tank
  ): boolean {
    return this.players.some((player) => {
      if (player.tank === movingTank || !player.tank.isAlive) return false;
      const dx = position.x - player.tank.position.x;
      const dy = position.y - player.tank.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < size / 2 + player.tank.getSize() / 2;
    });
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.arena.render();
    this.players.forEach((player) => {
      player.tank.render(this.ctx, player.name);
    });
    this.bullets.forEach((bullet) => bullet.render(this.ctx));
  }

  generateRandomPosition(): Vector2D {
    const tankSize = 30; // Assuming tank size is 30
    const padding = tankSize / 2 + 10; // Padding from walls and edges
    const maxAttempts = 100;
    let position: Vector2D;

    for (let i = 0; i < maxAttempts; i++) {
      const x = Math.random() * (this.ctx.canvas.width - 2 * padding) + padding;
      const y =
        Math.random() * (this.ctx.canvas.height - 2 * padding) + padding;
      position = new Vector2D(x, y);

      // Check for overlap with existing tanks
      const overlapWithTanks = this.players.some((player) => {
        const dx = position.x - player.tank.position.x;
        const dy = position.y - player.tank.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (tankSize + player.tank.getSize()) / 2 + 10; // 10 is extra buffer
      });

      // Check for overlap with walls
      const overlapWithWalls = this.getWalls().some((wall) => {
        const tankLeft = position.x - tankSize / 2;
        const tankRight = position.x + tankSize / 2;
        const tankTop = position.y - tankSize / 2;
        const tankBottom = position.y + tankSize / 2;

        const wallLeft = wall.position.x;
        const wallRight = wall.position.x + wall.width;
        const wallTop = wall.position.y;
        const wallBottom = wall.position.y + wall.height;

        return (
          tankRight > wallLeft &&
          tankLeft < wallRight &&
          tankBottom > wallTop &&
          tankTop < wallBottom
        );
      });

      if (!overlapWithTanks && !overlapWithWalls) {
        return position;
      }
    }

    throw new Error("Failed to generate non-overlapping position for tank.");
  }

  addPlayerWithName(name: string, initialPosition?: Vector2D): void {
    if (this.players.length >= 4) {
      console.error("Maximum number of players reached.");
      return;
    }

    try {
      const position = initialPosition || this.generateRandomPosition();
      const direction = Math.floor(Math.random() * 360);
      const tank = new Tank(position, direction);
      const player = new Player(tank, name);
      this.players.push(player);
    } catch (error) {
      console.error("Error adding player:", error);
    }
  }

  addPlayer(player: Player): void {
    if (this.players.length >= 4) {
      console.error("Maximum number of players reached.");
      return;
    }
    // player.tank.position = this.generateRandomPosition(); // Randomize position
    this.players.push(player);
  }

  addBullet(bullet: Bullet): void {
    bullet.setWalls(this.arena.getWalls());
    this.bullets.push(bullet);
  }

  getWalls(): Wall[] {
    return this.arena.getWalls();
  }

  getArena(): Arena {
    return this.arena;
  }

  /**
   * Sets the arena walls with the provided walls.
   * @param walls Array of Wall instances to set as the arena walls.
   */
  setArenaWalls(walls: Wall[]): void {
    this.arena.walls = walls;
    this.render(); // Re-render the arena to display the new walls
  }

  initializeGame(): void {
    if (this.players.length >= 2) {
      this.startGame();
    }
  }
}
