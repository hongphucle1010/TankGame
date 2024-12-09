import { useEffect, useState } from "react";
import { Player } from "../Entity/player";
import { Vector2D } from "../Entity/vector2d";

export const usePlayer = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    name: "",
    position: null,
    direction: 0,
  });

  useEffect(() => {}, [player]);

  useEffect(() => {
    if (playerState.name && playerState.position) {
      setPlayer(
        Player.createPlayer(
          playerState.name,
          playerState.position,
          playerState.direction
        )
      );
    }
  }, [playerState]);
  return [player, setPlayerState] as const;
};

export interface PlayerState {
  name: string;
  position: Vector2D | null;
  direction: number;
}
