import { Wall } from "./wall";

export class Arena {
  walls: Wall[];
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.walls = this.generateWalls();
  }

  private generateWalls(): Wall[] {
    // Generate random walls or predefined layouts
    return [];
  }

  render(): void {
    this.walls.forEach((wall) => wall.render(this.ctx));
  }
}
