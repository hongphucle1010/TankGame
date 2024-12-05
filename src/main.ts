import { Game } from "./game";
import { Player } from "./Entity/player";
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

  // Initialize and start the game
  const game = new Game(ctx, tankSize);
  game.startGame();

  // Add a new player to test
  const player = new Player(playerTank);
  game.addPlayer(player);

  // Add a second player to test
  const playerTank2 = new Tank(
    new Vector2D(100, 100), // Different starting position
    Math.floor(Math.random() * 360)
  );
  const player2 = new Player(playerTank2);
  game.addPlayer(player2);
}
