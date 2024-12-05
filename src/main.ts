import { Game } from "./game";
import { Tank } from "./Entity/tank";
import { Vector2D } from "./Entity/vector2d";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx) {
  // Set the initial background color to gray
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create a tank to determine the tank size
  const playerTank = new Tank(
    new Vector2D(50, 50),
    Math.floor(Math.random() * 360)
  );
  const tankSize = playerTank.getSize();

  // Initialize the game
  const game = new Game(ctx, tankSize);

  // Add players with random positions BEFORE starting the game
  game.addPlayer("Phúc");
  game.addPlayer("Tuấn");

  // Start the game AFTER adding players
  game.startGame();

  // Optionally, add more players as needed
  // game.addPlayer("Player Three");
  // game.addPlayer("Player Four");
}
