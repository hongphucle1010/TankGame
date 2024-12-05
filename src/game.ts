import { Arena } from "./Entity/arena";
import { Bullet } from "./Entity/bullet";
import { Player } from "./Entity/player";

export class Game {
  private arena: Arena;
  private players: Player[];
  private bullets: Bullet[];
  private isRunning: boolean;

  constructor() {
    this.arena = new Arena();
    this.players = [];
    this.bullets = [];
    this.isRunning = false;
  }

  startGame(): void {
    this.isRunning = true;
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    // Update tanks, bullets, and other game elements
    this.players.forEach((player) => player.update());
    this.bullets.forEach((bullet) => bullet.update());

    // Remove inactive bullets
    this.bullets = this.bullets.filter((bullet) => bullet.isActive);
  }

  private render(): void {
    // Render the game elements on screen
    this.arena.render();
    this.players.forEach((player) => player.render());
    this.bullets.forEach((bullet) => bullet.render(this.arena.ctx, this.bullets));
  }

  addPlayer(player: Player): void {
    if (this.players.length < 4) {
      this.players.push(player);
    } else {
      console.error("Maximum number of players reached.");
    }
  }

  addBullet(bullet: Bullet): void {
    this.bullets.push(bullet);
  }
}
