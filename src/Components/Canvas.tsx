import { useEffect, useRef, useState } from "react";
import { Player } from "../Entity/player";
import { Game } from "../game";

export default function Canvas({
  player1,
  player2,
  setWinner,
  setGame,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isSetGame, setIsSetGame] = useState(false);

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
    if (!ctx || !player1 || !player2 || isSetGame) return;
    const game = new Game(ctx, 50, (winner) => {
      console.log("Winner:", winner);
      setWinner(winner);
    });
    game.addPlayer(player1);
    game.addPlayer(player2);
    setGame(game);
    setIsSetGame(true);
  }, [ctx, isSetGame, player1, player2, setGame, setWinner]);

  return (
    <div id="app">
      <h1>HCMUT Xe Tăng Cuồng Nộ</h1>
      <canvas id="gameCanvas" width="800" height="600" ref={canvasRef}></canvas>
    </div>
  );
}

interface CanvasProps {
  player1: Player | null;
  player2: Player | null;
  setWinner: (winner: Player | null) => void;
  setGame: (game: Game | null) => void;
}
