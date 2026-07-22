import type { Card, CardColor } from "../models/Card";
import { getCardTexture } from "../utils/CardTexture";

export default class DeckManager {
    private deck: Card[] = [];
    private nextId = 0;

    constructor() {
        this.generateDeck();
        this.shuffle();
    }

    /**
     * Creates a standard 108-card UNO deck.
     */
    private generateDeck(): void {
        this.deck = [];
        this.nextId = 0;

        const colors: CardColor[] = ["Red", "Blue", "Green", "Yellow"];

        for (const color of colors) {
            // One 0 card
            this.addNumberCard(color, 0);

            // Two of each 1-9
            for (let value = 1; value <= 9; value++) {
                this.addNumberCard(color, value);
                this.addNumberCard(color, value);
            }

            // Two Skip
            this.addActionCard(color, "Skip");
            this.addActionCard(color, "Skip");

            // Two Reverse
            this.addActionCard(color, "Reverse");
            this.addActionCard(color, "Reverse");

            // Two Draw Two
            this.addActionCard(color, "Draw2");
            this.addActionCard(color, "Draw2");
        }

        // Four Wild
        for (let i = 0; i < 4; i++) {
            this.deck.push({
                id: this.nextId++,
                color: "Wild",
                type: "Wild",
                texture: getCardTexture("Wild", "Wild")
            });
        }

        // Four Wild Draw Four
        for (let i = 0; i < 4; i++) {
            this.deck.push({
                id: this.nextId++,
                color: "Wild",
                type: "Wild4",
                texture: getCardTexture("Wild", "Draw_4")
            });
        }
    }

    /**
     * Adds a numbered card.
     */
    private addNumberCard(color: CardColor, value: number): void {
        this.deck.push({
            id: this.nextId++,
            color,
            type: "Number",
            value,
            texture: getCardTexture(color, value)
        });
    }

    /**
     * Adds an action card.
     */
    private addActionCard(
        color: CardColor,
        action: "Skip" | "Reverse" | "Draw2"
    ): void {

        let textureName = "";

        switch (action) {
            case "Skip":
                textureName = "Skip";
                break;

            case "Reverse":
                textureName = "Reverse";
                break;

            case "Draw2":
                textureName = "Draw_2";
                break;
        }

        this.deck.push({
            id: this.nextId++,
            color,
            type: action,
            texture: getCardTexture(color, textureName)
        });
    }

    /**
     * Fisher-Yates shuffle.
     */
    public shuffle(): void {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    /**
     * Draw the top card.
     */
    public drawCard(): Card | undefined {
        return this.deck.pop();
    }

    /**
     * Draw multiple cards.
     */
    public drawCards(count: number): Card[] {
        const cards: Card[] = [];

        for (let i = 0; i < count; i++) {
            const card = this.drawCard();

            if (card) {
                cards.push(card);
            }
        }

        return cards;
    }

    /**
     * Cards remaining.
     */
    public getRemainingCards(): number {
        return this.deck.length;
    }

    /**
     * Read-only deck.
     */
    public getDeck(): readonly Card[] {
        return this.deck;
    }

    /**
     * Reset the deck.
     */
    public reset(): void {
        this.generateDeck();
        this.shuffle();
    }
}