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

    render(): void {
        // Draw the wall
    }
}
