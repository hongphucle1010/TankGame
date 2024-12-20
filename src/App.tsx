/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import HuongDan from "./Components/HuongDan";
import { EnterPlayerNameModal, WinnerModal } from "./Components/Modal";
import { Player } from "./Entity/player";
import { Wall } from "./Entity/wall";
import Canvas from "./Components/Canvas";
import webrtc, { WebRTCData } from "./webrtc";
import { Game } from "./game";
import { useReceivingWebRTC } from "./hooks/webrtc";
import { PlayerState, usePlayer } from "./hooks/player";
import { Vector2D } from "./Entity/vector2d";
import { Bullet } from "./Entity/bullet";

function App() {
  const [player1, setPlayer1State] = usePlayer();
  const [player2, setPlayer2State] = usePlayer();
  const [status, setStatus] = useState<Status>("none");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");
  const [game, setGame] = useState<Game | null>(null);
  const receivedData = useReceivingWebRTC();
  const [winner, setWinner] = useState<Player | null>(null);
  const [hostReadyToStart, setHostReadyToStart] = useState<boolean>(false);
  const [guestReadyToStart, setGuestReadyToStart] = useState<boolean>(false);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);

  const dataQueue = useRef<WebRTCData[]>([]);
  const isProcessing = useRef<boolean>(false);

  const resetPlayer = () => {
    if (!winner || !player1 || !player2) return;
    if (winner == player1) {
      setPlayer1Score((prev) => prev + 1);
    } else {
      setPlayer2Score((prev) => prev + 1);
    }
    setPlayer1State((prev) => {
      return {
        name: prev.name,
        position: null,
        direction: 0,
      };
    });
    setPlayer2State((prev) => {
      return {
        name: prev.name,
        position: null,
        direction: 0,
      };
    });
  };

  const processQueue = async () => {
    if (isProcessing.current || dataQueue.current.length === 0) return;
    isProcessing.current = true;

    const data = dataQueue.current.shift();
    if (data) {
      if (data.type === "ask") {
        if (data.topic === "name") {
          const sendData: WebRTCData = {
            type: "answer",
            topic: "name",
            data: player1?.name,
          };
          webrtc.sendData(sendData);
        }
      } else if (data.type === "answer") {
        if (data.topic === "name") {
          if (!data.data) return;
          setPlayer2State({
            name: data.data as string,
            position: new Vector2D(0, 0),
            direction: 0,
          });
        } else if (data.topic === "player") {
          if (!data.data) return;
          setWinner(null);
          const parsedData = JSON.parse(data.data as string) as PlayerData;
          setPlayer1State(parsedData.guest);
          setPlayer2State(parsedData.host);
        } else if (data.topic === "wall") {
          if (!data.data) return;
          const walls = JSON.parse(data.data as string);
          const wallsObj: Wall[] = Wall.constructFromJSONArray(walls);
          if (game) {
            game.setArenaWalls(wallsObj);
            if (status === "join") {
              setGuestReadyToStart(true);
            }
          }
        } else if (data.topic === "ready") {
          if (status === "host") {
            setGuestReadyToStart(true);
          } else if (status === "join") {
            console.log({
              player1,
              player2,
              game,
              winner,
              hostReadyToStart,
              guestReadyToStart,
            });
            setHostReadyToStart(true);
          }
        } else if (data.topic === "position") {
          if (!data.data) return;
          const positionData = JSON.parse(data.data);
          if (game && player2) {
            player2.tank.position = new Vector2D(
              positionData.position.x,
              positionData.position.y
            );
            player2.tank.direction = positionData.direction;
          }
        } else if (data.topic === "shoot") {
          if (game && player2) {
            if (!data.data) return;
            const bulletData = JSON.parse(data.data);
            const delay = Date.now() - bulletData.timestamp;

            // Create bullet at the given position and direction
            const bullet = new Bullet(
              new Vector2D(bulletData.position.x, bulletData.position.y),
              bulletData.direction
            );

            // Adjust bullet position based on delay
            bullet.adjustForDelay(delay);
            bullet.setWalls(game.getWalls());
            game.addBullet(bullet);
          }
        }
      }
    }

    isProcessing.current = false;
    if (dataQueue.current.length > 0) {
      processQueue();
    }
  };

  useEffect(() => {
    if (receivedData) {
      dataQueue.current.push(receivedData);
      processQueue();
    }
  }, [receivedData]);

  // Effect to start game
  useEffect(() => {
    if (!game || !hostReadyToStart || !guestReadyToStart) return;
    game.startGame();
  }, [game, hostReadyToStart, guestReadyToStart]);

  useEffect(() => {
    if (status !== "join" || !game || !guestReadyToStart) return;
    if (!player1 || !player2) return;
    const sendData: WebRTCData = {
      type: "answer",
      topic: "ready",
    };
    webrtc.sendData(sendData);
  }, [game, guestReadyToStart, status]);

  // Effect to send guest all information of the game
  useEffect(() => {
    console.log({
      status,
      game,
      hostReadyToStart,
    });
    if (status !== "host" || !game || !hostReadyToStart) return;
    if (!player1 || !player2) return;

    player1.tank.position = game.generateRandomPosition();
    player2.tank.position = game.generateRandomPosition();

    const sendData: WebRTCData = {
      type: "answer",
      topic: "ready",
    };
    webrtc.sendData(sendData);

    const playerData: PlayerData = {
      host: {
        name: player1.name,
        position: player1.tank.position,
        direction: player1.tank.direction,
      },
      guest: {
        name: player2.name,
        position: player2.tank.position,
        direction: player2.tank.direction,
      },
    };
    const hostData: WebRTCData = {
      type: "answer",
      topic: "player",
      data: JSON.stringify(playerData),
    };
    console.log("Sending host data:", hostData);
    webrtc.sendData(hostData);

    // Send player 2 wall information
    const walls = game.getWalls();
    const wallData: WebRTCData = {
      type: "answer",
      topic: "wall",
      data: JSON.stringify(walls),
    };

    webrtc.sendData(wallData);
  }, [game, hostReadyToStart, status]);

  // Effect to set host ready when the game is created
  useEffect(() => {
    if (game && status === "host") {
      console.log("Host ready to start");
      setHostReadyToStart(true);
    }
  }, [game, status]);

  // Effect to get guest information after guest join
  useEffect(() => {
    if (!isConnected || status === "none") return;

    if (status === "host") {
      const sendData: WebRTCData = {
        type: "ask",
        topic: "name",
      };
      webrtc.sendData(sendData);
    }
  }, [status, isConnected]);

  // Initialize effects
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
    };
    webrtc.dataChannelOpen.then(handleConnected);
  }, []);

  // Reset states when game ends
  useEffect(() => {
    if (winner) {
      resetPlayer();
      if (player1 || player2) return;
      console.log(player1, player2);
      setHostReadyToStart(false);
      setGuestReadyToStart(false);
      setGame(null);
    }
  }, [winner, player1, player2]);

  const handlePlayAgain = () => {
    console.log("Play again");
    setWinner(null);
    setPlayer1State((prev) => ({ ...prev, position: new Vector2D(0, 0) }));
    setPlayer2State((prev) => ({ ...prev, position: new Vector2D(0, 0) }));
  };

  return (
    <>
      <Canvas
        player1={player1}
        player2={player2}
        setWinner={setWinner}
        setGame={setGame}
        game={game}
        player1Score={player1Score}
        player2Score={player2Score}
      />
      <div
        style={{
          marginRight: "5px",
        }}
      >
        <HuongDan />
        <p id="room">Room: {roomId}</p>
      </div>
      {!(player1 || winner) && (
        <EnterPlayerNameModal
          setPlayer={setPlayer1State}
          setRoomId={setRoomId}
          setStatus={setStatus}
        />
      )}
      <WinnerModal
        winner={winner}
        handlePlayAgain={handlePlayAgain}
        isHost={status == "host"}
      />
    </>
  );
}

export default App;

export type Status = "host" | "join" | "none";

interface PlayerData {
  host: PlayerState;
  guest: PlayerState;
}
