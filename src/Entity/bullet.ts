import { Vector2D } from "./vector2d";

export class Bullet {
    position: Vector2D;
    direction: number; // Angle in degrees
    speed: number;
    isActive: boolean;

    constructor(position: Vector2D, direction: number) {
        this.position = position;
        this.direction = direction;
        this.speed = 5;
        this.isActive = true;
    }

    update(): void {
        const rad = (this.direction * Math.PI) / 180;
        this.position.x += Math.cos(rad) * this.speed;
        this.position.y += Math.sin(rad) * this.speed;

        // Handle collisions or deactivation
    }

    render(): void {
        // Draw the bullet
    }
}
