import { Assets, Container, Sprite } from "pixi.js";

export default class DrawPile extends Container {

    constructor() {

        super();

        for (let i = 3; i >= 0; i--) {

            const card = new Sprite(Assets.get("/cards/Back.jpg"));

            card.anchor.set(0.5);

            card.width = 80;
            card.height = 120;

            card.x = i * 2;
            card.y = -i * 2;

            this.addChild(card);

        }

    }

}