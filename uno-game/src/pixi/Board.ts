import { Container, Graphics, Text, TextStyle, Ticker } from "pixi.js";

import type { Card, CardColor } from "../game/models/Card";
import GameManager from "../game/managers/GameManager";

import PlayerHand from "./objects/PlayerHand";
import DrawPile from "./objects/DrawPile";
import DiscardPile from "./objects/DiscardPile";
import CardView from "./objects/CardView";

// Delay between one bot's move and the next, so plays are readable instead
// of instant.
const BOT_MOVE_DELAY_MS = 3000;

export default class Board extends Container {

    private game: GameManager;
    private screenWidth: number;
    private screenHeight: number;

    // Indexed the same way as GameManager's players (0 = human/bottom,
    // 1 = left, 2 = top, 3 = right). Rebuilt every refresh().
    private handViews: (PlayerHand | undefined)[] = [];

    private discardPos = { x: 0, y: 0 };

    // Prevents overlapping input/animation while a card is mid-flight or a
    // bot turn is being processed.
    private busy = false;

    constructor(
        game: GameManager,
        screenWidth: number,
        screenHeight: number
    ) {
        super();

        this.game = game;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.refresh();

        this.continueGame();
    }

    private refresh(): void {

        this.removeChildren();

        this.drawTable();

        this.createPlayers();

        this.createCenter();
    }

    private drawTable(): void {

        const table = new Graphics();

        table.roundRect(
            this.screenWidth * 0.15,
            this.screenHeight * 0.10,
            this.screenWidth * 0.70,
            this.screenHeight * 0.80,
            60
        );

        table.fill(0x0B5D1E);

        table.stroke({
            color: 0xffffff,
            width: 5
        });

        this.addChild(table);
    }

    private createPlayers(): void {

        const players = this.game.getPlayers();

        this.handViews = [];

        //--------------------------
        // Bottom (Human)
        //--------------------------

        const bottom = new PlayerHand(
            players[0],
            "bottom"
        );

        bottom.x =
            this.screenWidth / 2 - bottom.width / 2;

        bottom.y =
            this.screenHeight - 150;

        bottom.on("cardSelected", (index: number) => {

            this.onHumanCardSelected(index);

        });

        this.addChild(bottom);
        this.handViews[0] = bottom;

        //--------------------------
        // Left Bot
        //--------------------------

        const left = new PlayerHand(
            players[1],
            "left"
        );

        left.x = 60;

        left.y =
            this.screenHeight / 2 - left.height / 2;

        this.addChild(left);
        this.handViews[1] = left;

        //--------------------------
        // Top Bot
        //--------------------------

        const top = new PlayerHand(
            players[2],
            "top"
        );

        top.x =
            this.screenWidth / 2 - top.width / 2;

        top.y = 40;

        this.addChild(top);
        this.handViews[2] = top;

        //--------------------------
        // Right Bot
        //--------------------------

        const right = new PlayerHand(
            players[3],
            "right"
        );

        right.x =
            this.screenWidth - 60;

        right.y =
            this.screenHeight / 2 - right.height / 2;

        this.addChild(right);
        this.handViews[3] = right;

        //--------------------------
        // Labels
        //--------------------------

        const current = this.game.getCurrentPlayer();

        this.addLabel(
            current === 0 ? "YOU (your turn)" : "YOU",
            this.screenWidth / 2,
            this.screenHeight - 25
        );

        this.addLabel(
            current === 1 ? "BOT 1 (thinking...)" : "BOT 1",
            80,
            this.screenHeight / 2 - 120
        );

        this.addLabel(
            current === 2 ? "BOT 2 (thinking...)" : "BOT 2",
            this.screenWidth / 2,
            20
        );

        this.addLabel(
            current === 3 ? "BOT 3 (thinking...)" : "BOT 3",
            this.screenWidth - 80,
            this.screenHeight / 2 - 120
        );

    }

    private createCenter(): void {

        const centerX = this.screenWidth / 2;
        const centerY = this.screenHeight / 2;

        const drawPile = new DrawPile();

        drawPile.position.set(
            centerX - 80,
            centerY - 40
        );

        drawPile.eventMode = "static";
        drawPile.cursor = "pointer";

        drawPile.on("pointertap", () => {

            this.onDrawPileClicked();

        });

        this.addChild(drawPile);

        const discardPile = new DiscardPile(
            this.game.getTopDiscard()
        );

        discardPile.position.set(
            centerX + 80,
            centerY - 40
        );

        this.addChild(discardPile);

        this.discardPos = {
            x: centerX + 80,
            y: centerY - 40
        };

        this.addLabel(
            "DRAW",
            centerX - 80,
            centerY + 60
        );

        this.addLabel(
            `DISCARD (${this.game.getCurrentColor()})`,
            centerX + 80,
            centerY + 60
        );

    }

    private addLabel(
        text: string,
        x: number,
        y: number
    ): void {

        const label = new Text({
            text,
            style: new TextStyle({
                fill: 0xffffff,
                fontSize: 18,
                fontWeight: "bold"
            })
        });

        label.anchor.set(0.5);

        label.position.set(x, y);

        this.addChild(label);
    }

    // ------------------------------------------------------------------
    // Input handling
    // ------------------------------------------------------------------

    private onHumanCardSelected(index: number): void {

        if (this.busy)
            return;

        if (this.game.getCurrentPlayer() !== 0)
            return;

        if (!this.game.canPlayCard(index)) {

            console.log("Invalid move");

            return;

        }

        const player = this.game.getPlayers()[0];
        const card = player.hand[index];

        if (card.type === "Wild" || card.type === "Wild4") {

            this.busy = true;

            this.showColorPicker((color) => {

                this.executePlay(0, index, color);

            });

        } else {

            this.executePlay(0, index);

        }

    }

    private onDrawPileClicked(): void {

        if (this.busy)
            return;

        if (this.game.getCurrentPlayer() !== 0)
            return;

        this.busy = true;

        this.game.drawCard();

        this.refresh();

        this.busy = false;

        this.continueGame();

    }

    // ------------------------------------------------------------------
    // Bot turn loop
    // ------------------------------------------------------------------

    private continueGame(): void {

        if (this.game.isGameOver()) {

            this.showWinner();

            return;

        }

        if (this.game.isBotTurn() && !this.busy) {

            setTimeout(() => this.processBotTurn(), BOT_MOVE_DELAY_MS);

        }

    }

    private processBotTurn(): void {

        if (this.busy || this.game.isGameOver())
            return;

        const playerIndex = this.game.getCurrentPlayer();

        const cardIndex = this.game.chooseBotMove(playerIndex);

        if (cardIndex === -1) {

            this.busy = true;

            this.game.drawCard();

            this.refresh();

            this.busy = false;

            this.continueGame();

            return;

        }

        const player = this.game.getPlayers()[playerIndex];
        const card = player.hand[cardIndex];

        const chosenColor =
            card.type === "Wild" || card.type === "Wild4"
                ? this.game.chooseBotColor(playerIndex)
                : undefined;

        this.executePlay(playerIndex, cardIndex, chosenColor);

    }

    // ------------------------------------------------------------------
    // Playing a card + the fly-to-discard animation
    // ------------------------------------------------------------------

    private executePlay(
        playerIndex: number,
        cardIndex: number,
        chosenColor?: CardColor
    ): void {

        this.busy = true;

        const hand = this.handViews[playerIndex];
        const view = hand?.getCardView(cardIndex);
        const card = this.game.getPlayers()[playerIndex]?.hand[cardIndex];

        if (!hand || !view || !card) {

            // Shouldn't normally happen, but never leave the game stuck.
            this.game.playCard(cardIndex, chosenColor);

            this.busy = false;

            this.refresh();

            this.continueGame();

            return;

        }

        const fromX = hand.x + view.x;
        const fromY = hand.y + view.y;

        this.flyToDiscard(card, fromX, fromY, () => {

            this.game.playCard(cardIndex, chosenColor);

            this.busy = false;

            this.refresh();

            this.continueGame();

        });

    }

    private flyToDiscard(
        card: Card,
        fromX: number,
        fromY: number,
        onComplete: () => void
    ): void {

        const flying = new CardView(card, true);

        flying.position.set(fromX, fromY);

        this.addChild(flying);

        const toX = this.discardPos.x;
        const toY = this.discardPos.y;

        const duration = 350;

        let elapsed = 0;

        const tick = (ticker: Ticker) => {

            elapsed += ticker.deltaMS;

            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);

            flying.x = fromX + (toX - fromX) * eased;
            flying.y = fromY + (toY - fromY) * eased;
            flying.rotation = eased * 0.6;

            if (t >= 1) {

                Ticker.shared.remove(tick);

                this.removeChild(flying);
                flying.destroy();

                onComplete();

            }

        };

        Ticker.shared.add(tick);

    }

    // ------------------------------------------------------------------
    // Wild color picker
    // ------------------------------------------------------------------

    private showColorPicker(onChoose: (color: CardColor) => void): void {

        const overlay = new Container();

        const bg = new Graphics();

        bg.rect(0, 0, this.screenWidth, this.screenHeight);
        bg.fill({ color: 0x000000, alpha: 0.55 });

        overlay.addChild(bg);

        const colors: { name: CardColor; hex: number }[] = [
            { name: "Red", hex: 0xd63031 },
            { name: "Blue", hex: 0x0984e3 },
            { name: "Green", hex: 0x00b894 },
            { name: "Yellow", hex: 0xfdcb6e }
        ];

        const size = 90;
        const gap = 20;
        const totalWidth = colors.length * size + (colors.length - 1) * gap;
        const startX = this.screenWidth / 2 - totalWidth / 2;
        const y = this.screenHeight / 2 - size / 2;

        colors.forEach((c, i) => {

            const swatch = new Graphics();

            swatch.roundRect(0, 0, size, size, 14);
            swatch.fill(c.hex);
            swatch.stroke({ color: 0xffffff, width: 4 });

            swatch.x = startX + i * (size + gap);
            swatch.y = y;

            swatch.eventMode = "static";
            swatch.cursor = "pointer";

            swatch.on("pointertap", () => {

                this.removeChild(overlay);

                onChoose(c.name);

            });

            overlay.addChild(swatch);

        });

        const label = new Text({
            text: "Choose a color",
            style: new TextStyle({
                fill: 0xffffff,
                fontSize: 26,
                fontWeight: "bold"
            })
        });

        label.anchor.set(0.5);
        label.position.set(this.screenWidth / 2, y - 40);

        overlay.addChild(label);

        this.addChild(overlay);

    }

    // ------------------------------------------------------------------
    // Game over
    // ------------------------------------------------------------------

    private showWinner(): void {

        const winnerIndex = this.game.getWinner();
        const winner = this.game.getPlayers()[winnerIndex];

        const label = new Text({
            text: `${winner?.name ?? "Someone"} wins!`,
            style: new TextStyle({
                fill: 0xffffff,
                fontSize: 48,
                fontWeight: "bold"
            })
        });

        label.anchor.set(0.5);
        label.position.set(this.screenWidth / 2, this.screenHeight / 2);

        this.addChild(label);

    }

}