import { Tank } from "./tank";
import { Vector2D } from "./vector2d";
import { Wall } from "./wall";

export class Bullet {
  position: Vector2D;
  direction: number; // Angle in degrees
  speed: number;
  isActive: boolean;
  private walls: Wall[] = [];
  private lifetime: number;

  constructor(position: Vector2D, direction: number) {
    this.position = position;
    this.direction = direction;
    this.speed = 7;
    this.isActive = true;
    this.lifetime = 10000; // 10 seconds in milliseconds
  }

  setWalls(walls: Wall[]): void {
    this.walls = walls;
  }

  update(deltaTime: number, tanks: Tank[]): void {
    const rad = (this.direction * Math.PI) / 180;
    const distance = (this.speed * deltaTime) / 16.67; // Adjust speed based on deltaTime
    this.position.x += Math.cos(rad) * distance;
    this.position.y += Math.sin(rad) * distance;

    // Check for collisions with walls
    if (this.checkCollision()) {
      this.bounce();
    }

    // Check for collisions with tanks
    for (const tank of tanks) {
      if (tank.isAlive && this.checkTankCollision(tank)) {
        // Tank is hit
        tank.isAlive = false;
        this.isActive = false;
        break;
      }
    }

    // Handle bullet lifetime
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.isActive = false;
    }
  }

  adjustForDelay(delay: number): void {
    const rad = (this.direction * Math.PI) / 180;
    const distance = (this.speed * delay) / 16.67; // Adjust distance based on delay
    this.position.x += Math.cos(rad) * distance;
    this.position.y += Math.sin(rad) * distance;

    // Reduce the bullet's lifetime by the delay to keep it consistent
    this.lifetime -= delay;
    if (this.lifetime <= 0) {
      this.isActive = false;
    }
  }

  private checkCollision(): boolean {
    return this.walls.some((wall) => {
      const bulletLeft = this.position.x - 5;
      const bulletRight = this.position.x + 5;
      const bulletTop = this.position.y - 5;
      const bulletBottom = this.position.y + 5;

      const wallLeft = wall.position.x;
      const wallRight = wall.position.x + wall.width;
      const wallTop = wall.position.y;
      const wallBottom = wall.position.y + wall.height;

      return (
        bulletRight > wallLeft &&
        bulletLeft < wallRight &&
        bulletBottom > wallTop &&
        bulletTop < wallBottom
      );
    });
  }

  private bounce(): void {
    const currentRad = (this.direction * Math.PI) / 180;
    const velocity = new Vector2D(
      Math.cos(currentRad) * this.speed,
      Math.sin(currentRad) * this.speed
    );

    for (const wall of this.walls) {
      if (this.checkWallCollision(wall)) {
        // Calculate the overlap in both x and y directions
        const bulletRadius = 5;
        const bulletLeft = this.position.x - bulletRadius;
        const bulletRight = this.position.x + bulletRadius;
        const bulletTop = this.position.y - bulletRadius;
        const bulletBottom = this.position.y + bulletRadius;

        const wallLeft = wall.position.x;
        const wallRight = wall.position.x + wall.width;
        const wallTop = wall.position.y;
        const wallBottom = wall.position.y + wall.height;

        const overlapX = Math.min(
          bulletRight - wallLeft,
          wallRight - bulletLeft
        );
        const overlapY = Math.min(
          bulletBottom - wallTop,
          wallBottom - bulletTop
        );

        // Determine the side of collision
        const normal = new Vector2D(0, 0);
        if (overlapX < overlapY) {
          // Collision on left or right side
          normal.x =
            this.position.x > wall.position.x + wall.width / 2 ? 1 : -1;
        } else {
          // Collision on top or bottom side
          normal.y =
            this.position.y > wall.position.y + wall.height / 2 ? 1 : -1;
        }

        // Reflect the velocity vector over the normal
        const dotProduct = velocity.x * normal.x + velocity.y * normal.y;
        velocity.x = velocity.x - 2 * dotProduct * normal.x;
        velocity.y = velocity.y - 2 * dotProduct * normal.y;

        // Update the direction based on the new velocity
        this.direction = (Math.atan2(velocity.y, velocity.x) * 180) / Math.PI;
        if (this.direction < 0) {
          this.direction += 360;
        }

        // Adjust position to prevent sticking to the wall
        this.position.x += normal.x * (overlapX + 0.1);
        this.position.y += normal.y * (overlapY + 0.1);

        break; // Only reflect once per update
      }
    }
  }

  private checkWallCollision(wall: Wall): boolean {
    const bulletRadius = 5;
    return (
      this.position.x + bulletRadius > wall.position.x &&
      this.position.x - bulletRadius < wall.position.x + wall.width &&
      this.position.y + bulletRadius > wall.position.y &&
      this.position.y - bulletRadius < wall.position.y + wall.height
    );
  }

  private checkTankCollision(tank: Tank): boolean {
    const dx = this.position.x - tank.position.x;
    const dy = this.position.y - tank.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const collisionDistance = 5 + tank.getSize() / 2; // Bullet radius + tank radius
    return distance < collisionDistance;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw the bullet
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }
}
