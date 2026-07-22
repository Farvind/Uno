import type { Card } from "./Card";

export type GameColor =
    | "Red"
    | "Blue"
    | "Green"
    | "Yellow";

export default class GameState {

    public currentPlayer = 0;

    public direction: 1 | -1 = 1;

    public currentColor: GameColor = "Red";

    public topCard: Card | null = null;

    public winner = -1;

}