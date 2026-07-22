import type { Player } from "../models/Player";
import type { Card } from "../models/Card";

import DeckManager from "./DeckManager";

export default class PlayerManager {

    private players: Player[] = [];
    private deck: DeckManager;

    constructor(deck: DeckManager) {
         console.log("PlayerManager constructor called");


        this.deck = deck;

        this.createPlayers();

    }

    private createPlayers(): void {

        this.players = [

            {
                id: 0,
                name: "You",
                hand: [],
                isHuman: true
            },

            {
                id: 1,
                name: "Bot 1",
                hand: [],
                isHuman: false
            },

            {
                id: 2,
                name: "Bot 2",
                hand: [],
                isHuman: false
            },

            {
                id: 3,
                name: "Bot 3",
                hand: [],
                isHuman: false
            }

        ];

    }

    // Deal 7 cards to every player
    public dealCards(): void {

        for (let round = 0; round < 7; round++) {

            for (const player of this.players) {

                const card = this.deck.drawCard();

                if (card) {

                    player.hand.push(card);

                }

            }

        }

    }

    // Return all players
    public getPlayers(): Player[] {

        return this.players;

    }

    // Return one player
    public getPlayer(index: number): Player {

        return this.players[index];

    }

    // Remove a card from player's hand
    public playCard(
        playerIndex: number,
        cardIndex: number
    ): Card {

        return this.players[playerIndex].hand.splice(cardIndex, 1)[0];

    }

    // Give a player one card
    public drawCard(playerIndex: number): Card | undefined {

        const card = this.deck.drawCard();

        if (card) {

            this.players[playerIndex].hand.push(card);

        }

        return card;

    }

    // Number of cards a player has
    public getCardCount(playerIndex: number): number {

        return this.players[playerIndex].hand.length;

    }

    // Has player won?
    public hasWon(playerIndex: number): boolean {

        return this.players[playerIndex].hand.length === 0;

    }

    // Reset hands (for restart)
    public resetHands(): void {

        for (const player of this.players) {

            player.hand.length = 0;

        }

    }

}