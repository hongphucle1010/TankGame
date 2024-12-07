import "./initializer";
import { Game } from "./game";
import { Tank } from "./Entity/tank";
import { Vector2D } from "./Entity/vector2d";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx) {
  // Set the initial background color to gray
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Remove redundant game initialization
  // Initialization is now handled via initializer.ts based on peer connection
}

