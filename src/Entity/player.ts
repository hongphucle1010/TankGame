import { Tank } from "./tank";

export class Player {
    tank: Tank;
    score: number;

    constructor(tank: Tank) {
        this.tank = tank;
        this.score = 0;
    }

    update(): void {
        // Update player's tank and logic
        this.tank.update();
    }

    render(): void {
        this.tank.render();
    }
}
