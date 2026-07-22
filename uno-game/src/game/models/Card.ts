export type CardColor =
    | "Red"
    | "Blue"
    | "Green"
    | "Yellow"
    | "Wild";

export type CardType =
    | "Number"
    | "Skip"
    | "Reverse"
    | "Draw2"
    | "Wild"
    | "Wild4";

export interface Card {
    id: number;
    color: CardColor;
    type: CardType;
    value?: number;
    texture: string;
}