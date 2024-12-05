import { Arena } from "./Entity/arena";
import { Bullet } from "./Entity/bullet";
import { Player } from "./Entity/player";
import { Tank } from "./Entity/tank";
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
    if (this.players.length > 0) {
      const playerTank = this.players[0].tank;

      if (!playerTank.isAlive) return;

      if (this.keyState["w"]) {
        playerTank.move(true, this.getWalls());
      }
      if (this.keyState["s"]) {
        playerTank.move(false, this.getWalls());
      }
      if (this.keyState["a"]) {
        playerTank.rotate(-2);
      }
      if (this.keyState["d"]) {
        playerTank.rotate(2);
      }
      if (this.keyState["j"]) {
        const bullet = playerTank.shoot();
        if (bullet) {
          this.addBullet(bullet);
        }
        // Prevent continuous shooting by resetting the key state
        this.keyState["j"] = false;
      }
    }
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
