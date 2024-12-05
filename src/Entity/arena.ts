import { Wall } from "./wall";

export class Arena {
  walls: Wall[];

  constructor() {
    this.walls = this.generateWalls();
  }

  private generateWalls(): Wall[] {
    // Generate random walls or predefined layouts
    return [];
  }

  render(): void {
    this.walls.forEach((wall) => wall.render());
  }
}
