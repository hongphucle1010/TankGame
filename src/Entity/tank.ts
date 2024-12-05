import { Bullet } from "./bullet";
import { Vector2D } from "./vector2d";

export class Tank {
  position: Vector2D;
  direction: number; // Angle in degrees
  speed: number;
  health: number;

  constructor(position: Vector2D, direction: number) {
    this.position = position;
    this.direction = direction;
    this.speed = 2;
    this.health = 100;
  }

  move(forward: boolean): void {
    const rad = (this.direction * Math.PI) / 180;
    const delta = forward ? this.speed : -this.speed;
    this.position.x += Math.cos(rad) * delta;
    this.position.y += Math.sin(rad) * delta;
  }

  rotate(angle: number): void {
    this.direction = (this.direction + angle) % 360;
  }

  shoot(): Bullet {
    const rad = (this.direction * Math.PI) / 180;
    const bulletPos = new Vector2D(
      this.position.x + Math.cos(rad) * 10,
      this.position.y + Math.sin(rad) * 10
    );
    return new Bullet(bulletPos, this.direction);
  }

  render(): void {
    // Draw the tank on the screen
  }

  update(): void {
    // Update logic for the tank
  }
}
