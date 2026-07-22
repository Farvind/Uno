import { Assets, Sprite } from "pixi.js";
import type { Card } from "../../game/models/Card";

export default class CardView extends Sprite {

    public readonly card: Card;

    constructor(card: Card, faceUp = true) {

        super(
            faceUp
                ? Assets.get(card.texture)
                : Assets.get("/cards/Back.jpg")
        );

        this.card = card;

        this.anchor.set(0.5);

        this.width = 80;
        this.height = 120;

        this.eventMode = "static";
        this.cursor = "pointer";
    }

    public setFaceUp(faceUp: boolean): void {

        this.texture = faceUp
            ? Assets.get(this.card.texture)
            : Assets.get("/cards/Back.jpg");

    }

    public highlight(): void {

        this.scale.set(1.1);

    }

    public unhighlight(): void {

        this.scale.set(1);

    }

}