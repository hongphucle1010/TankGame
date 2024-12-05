import { Wall } from "./wall";
import { Vector2D } from "./vector2d";

export class Arena {
  walls: Wall[];
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.walls = this.generateWalls();
  }

  private generateWalls(): Wall[] {
    const walls: Wall[] = [];
    const roomCount = Math.floor(Math.random() * 5) + 3; // Random number of rooms between 3 and 7

    // Add boundary walls
    walls.push(new Wall(new Vector2D(0, 0), this.ctx.canvas.width, 5)); // Top wall
    walls.push(new Wall(new Vector2D(0, this.ctx.canvas.height - 5), this.ctx.canvas.width, 5)); // Bottom wall
    walls.push(new Wall(new Vector2D(0, 0), 5, this.ctx.canvas.height)); // Left wall
    walls.push(new Wall(new Vector2D(this.ctx.canvas.width - 5, 0), 5, this.ctx.canvas.height)); // Right wall

    for (let i = 0; i < roomCount; i++) {
      const x = Math.random() * (this.ctx.canvas.width - 40) + 20;
      const y = Math.random() * (this.ctx.canvas.height - 40) + 20;
      const width = Math.random() * 100 + 50; // Random width between 50 and 150
      const height = Math.random() * 100 + 50; // Random height between 50 and 150

      // Create walls for the room
      walls.push(new Wall(new Vector2D(x, y), width, 10)); // Top wall
      walls.push(new Wall(new Vector2D(x, y + height - 10), width, 10)); // Bottom wall
      walls.push(new Wall(new Vector2D(x, y), 10, height)); // Left wall
      walls.push(new Wall(new Vector2D(x + width - 10, y), 10, height)); // Right wall
    }

    return walls;
  }

  render(): void {
    this.walls.forEach((wall) => wall.render(this.ctx));
  }
}
