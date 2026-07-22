import { Assets, Sprite } from "pixi.js";
import type { Card } from "../../game/models/Card";

export default class DiscardPile extends Sprite {

    constructor(card?: Card) {

        super(
            card
                ? Assets.get(card.texture)
                : Assets.get("/cards/Back.jpg")
        );

        this.anchor.set(0.5);

        this.width = 80;
        this.height = 120;

    }

}