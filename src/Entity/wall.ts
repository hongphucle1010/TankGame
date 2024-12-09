import { Vector2D } from "./vector2d";

export class Wall {
  position: Vector2D;
  width: number;
  height: number;

  constructor(position: Vector2D, width: number, height: number) {
    this.position = position;
    this.width = width;
    this.height = height;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw the wall
    ctx.fillStyle = "brown";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  static constructFromJSONArray(walls: WallData[]): Wall[] {
    return walls.map((wall) => {
      return new Wall(
        new Vector2D(wall.position.x, wall.position.y),
        wall.width,
        wall.height
      );
    });
  }
}

interface WallData {
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
}
