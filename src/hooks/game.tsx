
import { Dispatch, SetStateAction } from "react";
import { Player } from "../Entity/player";
import { Wall } from "../Entity/wall";

export const usePlayAgain = (
  setWinner: Dispatch<SetStateAction<Player | null>>,
  setWalls: Dispatch<SetStateAction<Wall[]>>
) => {
  return () => {
    setWinner(null);
    setWalls([]);
  };
};