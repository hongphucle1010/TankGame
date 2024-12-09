import { useState } from "react";
import { Player } from "../Entity/player";
import { Status } from "../App";
import { PlayerState } from "../hooks/player";
import { Vector2D } from "../Entity/vector2d";
import webrtc from "../webrtc";

interface EnterPlayerNameModalProps {
  setPlayer: (playerState: PlayerState) => void;
  setRoomId: (roomId: string) => void;
  setStatus: (status: Status) => void;
}

export function EnterPlayerNameModal({
  setPlayer,
  setRoomId,
  setStatus,
}: EnterPlayerNameModalProps) {
  const [playerName, setPlayerName] = useState<string | null>(null);

  const handleCreateGame = async () => {
    if (!playerName) return;
    setPlayer({
      name: playerName,
      position: new Vector2D(0, 0),
      direction: 0,
    });
    const roomId = prompt("Enter Room ID");
    if (roomId) {
      webrtc
        .createRoom(roomId)
        .then(() => {
          setRoomId(roomId);
          setStatus("host");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleJoinGame = () => {
    if (!playerName) return;
    setPlayer({
      name: playerName,
      position: new Vector2D(0, 0),
      direction: 180,
    });
    const roomId = prompt("Enter Room ID");
    if (roomId) {
      webrtc
        .joinRoom(roomId)
        .then(() => {
          setRoomId(roomId);
          setStatus("join");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div id="gameModal" className="modal">
      <div className="modal-content">
        <h2>Enter Your Name</h2>
        <input
          type="text"
          id="playerNameInput"
          placeholder="Your Name"
          onChange={(e) => setPlayerName(e.currentTarget.value)}
        />
        <div id="gameOptions">
          <button id="createGameBtn" onClick={handleCreateGame}>
            Create Game
          </button>
          <button id="joinGameBtn" onClick={handleJoinGame}>
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}

interface WinnerModalProps {
  winner: Player | null;
  handlePlayAgain: () => void;
}

export function WinnerModal({ winner, handlePlayAgain }: WinnerModalProps) {
  return (
    winner?.name && (
      <div
        id="gameOverModal"
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "1000",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            minWidth: "300px",
          }}
        >
          <h2>{winner?.name ? `${winner?.name} Wins!` : `It's a Draw!`}</h2>
          <button
            onClick={handlePlayAgain}
            style={{
              padding: "10px 20px",
              fontSize: "20px",
              marginTop: "20px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Play Again
          </button>
        </div>
      </div>
    )
  );
}
