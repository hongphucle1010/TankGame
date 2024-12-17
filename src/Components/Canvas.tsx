import { useEffect, useRef, useState } from "react";
import { Player } from "../Entity/player";
import { Game } from "../game";

export default function Canvas({
  player1,
  player2,
  setWinner,
  setGame,
  game,
  player1Score,
  player2Score,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCtx(canvas.getContext("2d"));
  }, [canvasRef]);

  useEffect(() => {
    if (!ctx) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [ctx]);

  useEffect(() => {
    if (!ctx || !player1 || !player2 || game) return;
    console.log("Creating new game");
    const newGame = new Game(ctx, 50, (winner) => {
      console.log("Winner:", winner);
      setWinner(winner);
    });
    newGame.addPlayer(player1);
    newGame.addPlayer(player2);
    setGame(newGame);
  }, [ctx, game, player1, player2, setGame, setWinner]);

  return (
    <div id="app">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <p className="score green">{player1Score}</p>
        <h1>HCMUT Xe Tăng Cuồng Nộ</h1>
        <p className="score red">{player2Score}</p>
      </div>
      <canvas id="gameCanvas" width="800" height="600" ref={canvasRef}></canvas>
    </div>
  );
}

interface CanvasProps {
  player1: Player | null;
  player2: Player | null;
  setWinner: (winner: Player | null) => void;
  setGame: (game: Game | null) => void;
  game: Game | null;
  player1Score: number;
  player2Score: number;
}
