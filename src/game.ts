import { Arena } from "./Entity/arena";
import { Bullet } from "./Entity/bullet";
import { Player } from "./Entity/player";
import { Tank } from "./Entity/tank";
import { Vector2D } from "./Entity/vector2d";
import { Wall } from "./Entity/wall";

export class Game {
  private arena: Arena;
  private players: Player[];
  private bullets: Bullet[];
  private isRunning: boolean;
  private ctx: CanvasRenderingContext2D;
  private keyState: { [key: string]: boolean } = {};
  private lastUpdateTime: number = performance.now();

  constructor(ctx: CanvasRenderingContext2D, tankSize: number) {
    this.ctx = ctx;
    this.arena = new Arena(ctx, tankSize);
    this.players = [];
    this.bullets = [];
    this.isRunning = false;

    // Set up key event listeners
    window.addEventListener("keydown", (event) => {
      this.keyState[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.keyState[event.key] = false;
    });
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

    // Update tanks, bullets, and other game elements
    this.players.forEach((player) => player.update(deltaTime));
    this.bullets.forEach((bullet) =>
      bullet.update(deltaTime, this.getAliveTanks())
    );

    // Remove inactive bullets
    this.bullets = this.bullets.filter((bullet) => bullet.isActive);

    // Remove dead players
    this.players = this.players.filter((player) => player.tank.isAlive);
  }

  private getAliveTanks(): Tank[] {
    return this.players
      .filter((player) => player.tank.isAlive)
      .map((player) => player.tank);
  }

  private handleInput(): void {
    this.players.forEach((player, index) => {
      if (!player.tank.isAlive) return;

      // Define control keys for each player
      let controls;
      if (index === 0) {
        controls = {
          forward: "w",
          backward: "s",
          rotateLeft: "a",
          rotateRight: "d",
          shoot: "j",
        };
      } else if (index === 1) {
        controls = {
          forward: "ArrowUp",
          backward: "ArrowDown",
          rotateLeft: "ArrowLeft",
          rotateRight: "ArrowRight",
          shoot: "m",
        };
      }

      // Apply controls
      if (controls) {
        // Determine movement direction
        if (this.keyState[controls.forward] || this.keyState[controls.backward]) {
          const forward = this.keyState[controls.forward];
          const rad = (player.tank.direction * Math.PI) / 180;
          const delta = (forward ? player.tank.speed : -player.tank.speed);
          const newPosition = new Vector2D(
            player.tank.position.x + Math.cos(rad) * delta,
            player.tank.position.y + Math.sin(rad) * delta
          );

          // Check for collision with walls and other tanks
          if (
            !player.tank.checkCollision(newPosition, this.getWalls()) &&
            !this.isPositionOccupied(newPosition, player.tank.getSize(), player.tank)
          ) {
            player.tank.position = newPosition;
          }
        }

        if (this.keyState[controls.rotateLeft]) {
          player.tank.rotate(-2);
        }
        if (this.keyState[controls.rotateRight]) {
          player.tank.rotate(2);
        }
        if (this.keyState[controls.shoot]) {
          const bullet = player.tank.shoot();
          if (bullet) {
            this.addBullet(bullet);
          }
          // Prevent continuous shooting by resetting the key state
          this.keyState[controls.shoot] = false;
        }
      }
    });
  }

  private isPositionOccupied(position: Vector2D, size: number, movingTank: Tank): boolean {
    return this.players.some((player) => {
      if (player.tank === movingTank || !player.tank.isAlive) return false;
      const dx = position.x - player.tank.position.x;
      const dy = position.y - player.tank.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (size / 2 + player.tank.getSize() / 2);
    });
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.arena.render();
    this.players.forEach((player) => player.render(this.ctx));
    this.bullets.forEach((bullet) => bullet.render(this.ctx));
  }

  addPlayer(player: Player): void {
    if (this.players.length < 4) {
      this.players.push(player);
    } else {
      console.error("Maximum number of players reached.");
    }
  }

  addBullet(bullet: Bullet): void {
    bullet.setWalls(this.arena.getWalls());
    this.bullets.push(bullet);
  }

  getWalls(): Wall[] {
    return this.arena.getWalls();
  }
}
