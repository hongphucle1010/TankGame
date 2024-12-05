import "./style.css";
import { Game } from "./game";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx) {
  // Set the initial background color to gray
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Initialize and start the game
  const game = new Game(ctx);
  game.startGame();
}
