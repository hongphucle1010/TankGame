import { Wall } from "./wall";
import { Vector2D } from "./vector2d";

export class Arena {
  walls: Wall[];
  private ctx: CanvasRenderingContext2D;
  private tankSize: number;

  constructor(ctx: CanvasRenderingContext2D, tankSize: number) {
    this.ctx = ctx;
    this.tankSize = tankSize;
    this.walls = this.generateArena();
  }

  private generateArena(): Wall[] {
    const walls: Wall[] = [];
    const roomRows = Math.floor(Math.random() * 2) + 3; // Rows between 3 and 4
    const roomCols = Math.floor(Math.random() * 2) + 3; // Columns between 3 and 4

    const roomWidth = this.ctx.canvas.width / roomCols;
    const roomHeight = this.ctx.canvas.height / roomRows;
    const doorSize = this.tankSize * 3; // Door size based on tank size

    // Add boundary walls
    walls.push(new Wall(new Vector2D(0, 0), this.ctx.canvas.width, 5)); // Top boundary
    walls.push(
      new Wall(
        new Vector2D(0, this.ctx.canvas.height - 5),
        this.ctx.canvas.width,
        5
      )
    ); // Bottom boundary
    walls.push(new Wall(new Vector2D(0, 0), 5, this.ctx.canvas.height)); // Left boundary
    walls.push(
      new Wall(
        new Vector2D(this.ctx.canvas.width - 5, 0),
        5,
        this.ctx.canvas.height
      )
    ); // Right boundary

    // Connectivity tracking using Union-Find
    const parent: number[] = Array(roomRows * roomCols)
      .fill(0)
      .map((_, i) => i);
    const find = (x: number): number =>
      parent[x] === x ? x : (parent[x] = find(parent[x]));
    const union = (a: number, b: number): void => {
      parent[find(a)] = find(b);
    };

    const grid: { x: number; y: number; doors: Set<string> }[][] = [];
    for (let row = 0; row < roomRows; row++) {
      grid[row] = [];
      for (let col = 0; col < roomCols; col++) {
        const x = col * roomWidth;
        const y = row * roomHeight;
        grid[row][col] = { x, y, doors: new Set<string>() };
      }
    }

    // Add edges to ensure all rooms are connected
    const edges: {
      from: [number, number];
      to: [number, number];
      direction: string;
    }[] = [];
    for (let row = 0; row < roomRows; row++) {
      for (let col = 0; col < roomCols; col++) {
        if (row > 0)
          edges.push({ from: [row, col], to: [row - 1, col], direction: "up" });
        if (col > 0)
          edges.push({
            from: [row, col],
            to: [row, col - 1],
            direction: "left",
          });
      }
    }

    edges.sort(() => Math.random() - 0.5); // Randomize connections

    // Ensure connectivity using Minimum Spanning Tree
    for (const edge of edges) {
      const { from, to, direction } = edge;
      const fromIndex = from[0] * roomCols + from[1];
      const toIndex = to[0] * roomCols + to[1];

      if (find(fromIndex) !== find(toIndex)) {
        union(fromIndex, toIndex);
        grid[from[0]][from[1]].doors.add(direction);
        const reverseDirection = direction === "up" ? "down" : "left";
        grid[to[0]][to[1]].doors.add(reverseDirection);
      }
    }

    // Ensure each room has at least one door
    for (let row = 0; row < roomRows; row++) {
      for (let col = 0; col < roomCols; col++) {
        const doors = grid[row][col].doors;
        if (doors.size === 0) {
          // Add a random door if no doors exist
          if (row > 0) doors.add("up");
          else if (col > 0) doors.add("left");
        }
      }
    }

    // Construct walls and doors
    for (let row = 0; row < roomRows; row++) {
      for (let col = 0; col < roomCols; col++) {
        const { x, y, doors } = grid[row][col];

        // Top wall (with door if "up" exists)
        if (!doors.has("up") && row > 0) {
          walls.push(new Wall(new Vector2D(x, y), roomWidth, 5));
        } else if (row > 0) {
          this.addDoor(walls, x, y, roomWidth, "horizontal", doorSize);
        }

        // Left wall (with door if "left" exists)
        if (!doors.has("left") && col > 0) {
          walls.push(new Wall(new Vector2D(x, y), 5, roomHeight));
        } else if (col > 0) {
          this.addDoor(walls, x, y, roomHeight, "vertical", doorSize);
        }

        // Bottom wall (only for last row, no door)
        if (row === roomRows - 1) {
          walls.push(
            new Wall(new Vector2D(x, y + roomHeight - 5), roomWidth, 5)
          );
        }

        // Right wall (only for last column, no door)
        if (col === roomCols - 1) {
          walls.push(
            new Wall(new Vector2D(x + roomWidth - 5, y), 5, roomHeight)
          );
        }
      }
    }

    return walls;
  }

  private addDoor(
    walls: Wall[],
    x: number,
    y: number,
    length: number,
    orientation: "horizontal" | "vertical",
    doorSize: number
  ): void {
    const offset = Math.random() * (length - doorSize); // Random position for the door

    if (orientation === "horizontal") {
      walls.push(new Wall(new Vector2D(x, y), offset, 5)); // Left part of the wall
      walls.push(
        new Wall(
          new Vector2D(x + offset + doorSize, y),
          length - offset - doorSize,
          5
        )
      ); // Right part of the wall
    } else {
      walls.push(new Wall(new Vector2D(x, y), 5, offset)); // Top part of the wall
      walls.push(
        new Wall(
          new Vector2D(x, y + offset + doorSize),
          5,
          length - offset - doorSize
        )
      ); // Bottom part of the wall
    }
  }

  getWalls(): Wall[] {
    return this.walls;
  }

  render(): void {
    this.walls.forEach((wall) => wall.render(this.ctx));
  }
}
