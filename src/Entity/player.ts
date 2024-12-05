import { Tank } from "./tank";

export class Player {
  tank: Tank;
  score: number;

  constructor(tank: Tank) {
    this.tank = tank;
    this.score = 0;
  }

  update(deltaTime: number): void {
    this.tank.update(deltaTime);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.tank.render(ctx);
  }
}
