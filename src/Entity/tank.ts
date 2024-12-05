import { Bullet } from "./bullet";
import { Vector2D } from "./vector2d";
import { Wall } from "./wall";

export class Tank {
  position: Vector2D;
  direction: number; // Angle in degrees
  speed: number;
  health: number;
  private size: number;

  constructor(position: Vector2D, direction: number) {
    this.position = position;
    this.direction = direction;
    this.speed = 1;
    this.health = 100;
    this.size = 30; // Define the tank size
  }

  move(forward: boolean, walls: Wall[]): void {
    const rad = (this.direction * Math.PI) / 180;
    const delta = forward ? this.speed : -this.speed;
    const newPosition = new Vector2D(
      this.position.x + Math.cos(rad) * delta,
      this.position.y + Math.sin(rad) * delta
    );

    if (!this.checkCollision(newPosition, walls)) {
      this.position = newPosition;
    }
  }

  private checkCollision(position: Vector2D, walls: Wall[]): boolean {
    // Define the tank's axis-aligned bounding box (AABB)
    const tankLeft = position.x - this.size / 2;
    const tankRight = position.x + this.size / 2;
    const tankTop = position.y - this.size / 2;
    const tankBottom = position.y + this.size / 2;

    // Check each wall for overlap with the tank's AABB
    return walls.some((wall) => {
      const wallLeft = wall.position.x;
      const wallRight = wall.position.x + wall.width;
      const wallTop = wall.position.y;
      const wallBottom = wall.position.y + wall.height;

      // Check if any part of the tank's bounding box overlaps with the wall's bounding box
      return (
        tankRight > wallLeft && // Tank's right edge overlaps wall's left edge
        tankLeft < wallRight && // Tank's left edge overlaps wall's right edge
        tankBottom > wallTop && // Tank's bottom edge overlaps wall's top edge
        tankTop < wallBottom // Tank's top edge overlaps wall's bottom edge
      );
    });
  }

  rotate(angle: number): void {
    this.direction = (this.direction + angle) % 360;
    if (this.direction < 0) {
      this.direction += 360;
    }
  }

  shoot(): Bullet {
    const rad = (this.direction * Math.PI) / 180; // Convert direction to radians
    const bulletPos = new Vector2D(
      this.position.x + Math.cos(rad) * (this.size / 2 + 5),
      this.position.y + Math.sin(rad) * (this.size / 2 + 5)
    );
    return new Bullet(bulletPos, this.direction); // Bullet gets the correct direction
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!ctx) return;
    ctx.save();
    // Move canvas origin to the tank's position
    ctx.translate(this.position.x, this.position.y);
    // Rotate canvas to match tank's direction
    ctx.rotate((this.direction * Math.PI) / 180);
    // Draw tank body
    ctx.fillStyle = "green";
    ctx.fillRect(-15, -15, 30, 30); // Tank body centered at (0, 0)
    // Draw gun rotated 90° counterclockwise
    ctx.fillStyle = "black";
    ctx.fillRect(0, -3, 20, 6); // Gun extends to the right
    ctx.restore(); // Restore context for other drawings
  }

  update(): void {}

  getSize(): number {
    return this.size;
  }
}
