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
    this.speed = 3; 
    this.isActive = true;
    this.lifetime = 10000; // 10 seconds in milliseconds
  }

  setWalls(walls: Wall[]): void {
    this.walls = walls;
  }

  update(): void {
    const rad = (this.direction * Math.PI) / 180;
    this.position.x += Math.cos(rad) * this.speed;
    this.position.y += Math.sin(rad) * this.speed;

    // Handle collisions or deactivation
    if (this.checkCollision()) {
      this.bounce();
    }
    if (this.lifetime <= 0) {
      this.isActive = false;
    }
    this.lifetime -= 16.67; // Approximate time per frame at 60fps
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
    let velocity = new Vector2D(
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
        let normal = new Vector2D(0, 0);
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

  render(ctx: CanvasRenderingContext2D): void {
    // Draw the bullet
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  }
}
