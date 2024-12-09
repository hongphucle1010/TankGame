import { Tank } from "./tank";
import { Vector2D } from "./vector2d";

export class Player {
  tank: Tank;
  score: number;
  name: string;

  constructor(tank: Tank, name: string) {
    this.tank = tank;
    this.score = 0;
    this.name = name;
  }

  static createPlayer(
    name: string,
    position: Vector2D,
    direction: number
  ): Player {
    const tank = new Tank(position, direction);
    return new Player(tank, name);
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
