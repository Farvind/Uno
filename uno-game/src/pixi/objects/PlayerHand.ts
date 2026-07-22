import { Container } from "pixi.js";
import type { FederatedPointerEvent } from "pixi.js";
import type { Player } from "../../game/models/Player";
import CardView from "./CardView";

export type HandSide =
    | "bottom"
    | "top"
    | "left"
    | "right";

export default class PlayerHand extends Container {

    constructor(
        player: Player,
        side: HandSide
    ) {

        super();

        const faceUp = side === "bottom";

        // Dynamic spacing
        let spacing = 35;

        if (player.hand.length > 10)
            spacing = 28;

        if (player.hand.length > 15)
            spacing = 22;

        if (side === "left" || side === "right")
            spacing = 22;

        player.hand.forEach((card, index) => {

            const view = new CardView(card, faceUp);

            switch (side) {

                case "bottom":

                    view.position.set(index * spacing, 0);

                    break;

                case "top":

                    view.position.set(index * spacing, 0);

                    break;

                case "left":

                    view.rotation = Math.PI / 2;

                    view.position.set(0, index * spacing);

                    break;

                case "right":

                    view.rotation = -Math.PI / 2;

                    view.position.set(0, index * spacing);

                    break;

            }

            // Only human player is clickable
            if (faceUp) {

                view.eventMode = "static";
                view.cursor = "pointer";

                view.on("pointerover", () => {

                    view.y -= 15;

                });

                view.on("pointerout", () => {

                    view.y += 15;

                });

                view.on("pointertap", (_e: FederatedPointerEvent) => {

                    this.emit("cardSelected", index, view);

                });

            }

            this.addChild(view);

        });

    }

    /**
     * Returns the CardView rendered for a given hand index, if any. Children
     * are added in the same order as the player's hand array, so the index
     * lines up directly.
     */
    public getCardView(index: number): CardView | undefined {

        return this.children[index] as CardView | undefined;

    }

}