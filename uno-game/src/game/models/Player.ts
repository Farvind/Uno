import type { Card } from "./Card";

export interface Player {

    id: number;

    name: string;

    isHuman: boolean;

    
    hand: Card[];

}