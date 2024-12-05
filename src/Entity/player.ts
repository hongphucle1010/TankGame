import { Tank } from "./tank";

export class Player {
  tank: Tank;
  score: number;
  name: string;

  constructor(tank: Tank, name: string) {
    this.tank = tank;
    this.score = 0;
    this.name = name;
  }

  update(deltaTime: number): void {
    this.tank.update(deltaTime);
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.tank.isAlive) {
      this.tank.render(ctx, this.name);
    } else {
      // Optionally, render explosion effect or remove tank from render
    }
  }
}
