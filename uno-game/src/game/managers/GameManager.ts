import type { Card, CardColor } from "../models/Card";
import type { Player } from "../models/Player";

import DeckManager from "./DeckManager";
import PlayerManager from "./PlayerManager";
import RuleManager from "./RuleManager";
import TurnManager from "./TurnManager";

const PLAYABLE_COLORS: CardColor[] = ["Red", "Blue", "Green", "Yellow"];

export default class GameManager {

    private deck: DeckManager;
    private players: PlayerManager;

    private turnManager: TurnManager;
    private ruleManager: RuleManager;

    private discardPile: Card[] = [];

    // The color currently "in play". For everything except Wild/Wild4 this
    // just mirrors the top card's color, but once a wild is played this is
    // the only place that tracks what the next player actually has to match.
    private currentColor: CardColor = "Red";

    constructor() {

        this.deck = new DeckManager();

        this.players = new PlayerManager(this.deck);

        this.turnManager = new TurnManager(4);

        this.ruleManager = new RuleManager();

    }

    public startGame(): void {

        this.players.dealCards();

        let firstCard = this.deck.drawCard();

        // Classic house rule: don't open on a Wild Draw Four.
        while (firstCard && firstCard.type === "Wild4") {

            this.deck.reset();

            this.players.resetHands();
            this.players.dealCards();

            firstCard = this.deck.drawCard();

        }

        if (firstCard) {

            this.discardPile.push(firstCard);

            this.currentColor =
                firstCard.color === "Wild"
                    ? "Red"
                    : (firstCard.color as CardColor);

        }

    }

    public getPlayers(): Player[] {

        return this.players.getPlayers();

    }

    public getCurrentPlayer(): number {

        return this.turnManager.getCurrentPlayer();

    }

    public getTopDiscard(): Card | undefined {

        return this.discardPile[this.discardPile.length - 1];

    }

    public getRemainingCards(): number {

        return this.deck.getRemainingCards();

    }

    public getCurrentColor(): CardColor {

        return this.currentColor;

    }

    public isBotTurn(): boolean {

        const player = this.players.getPlayer(this.turnManager.getCurrentPlayer());

        return !!player && !player.isHuman;

    }

    public getWinner(): number {

        return this.players.getPlayers().findIndex((p) => p.hand.length === 0);

    }

    public isGameOver(): boolean {

        return this.getWinner() !== -1;

    }

    /**
     * Checks whether a card at the given index is a legal play for whoever's
     * turn it currently is, without mutating any state.
     */
    public canPlayCard(cardIndex: number): boolean {

        const player = this.players.getPlayer(this.turnManager.getCurrentPlayer());

        if (!player)
            return false;

        const card = player.hand[cardIndex];

        const top = this.getTopDiscard();

        if (!card || !top)
            return false;

        return this.ruleManager.canPlay(card, top, this.currentColor);

    }

    /**
     * Plays a card for whoever's turn it currently is. `chosenColor` is only
     * required (and only used) when the card being played is a Wild/Wild4 -
     * callers should prompt for it (human) or use chooseBotColor (bots)
     * before calling this.
     */
    public playCard(cardIndex: number, chosenColor?: CardColor): boolean {

        const playerIndex = this.turnManager.getCurrentPlayer();

        const player = this.players.getPlayer(playerIndex);

        if (!player)
            return false;

        const card = player.hand[cardIndex];

        if (!card)
            return false;

        const top = this.getTopDiscard();

        if (!top)
            return false;

        if (!this.ruleManager.canPlay(card, top, this.currentColor)) {

            return false;

        }

        this.players.playCard(playerIndex, cardIndex);

        this.discardPile.push(card);

        if (card.type === "Wild" || card.type === "Wild4") {

            this.currentColor = chosenColor ?? this.chooseBotColor(playerIndex);

        } else {

            this.currentColor = card.color as CardColor;

        }

        this.applyEffect(card);

        return true;

    }

    /**
     * Resolves what happens to the turn order / draw pile after a card is
     * played. Lives here (rather than RuleManager) because Draw2/Wild4 need
     * access to both the deck and the players.
     */
    private applyEffect(card: Card): void {

        switch (card.type) {

            case "Skip":

                this.turnManager.skipPlayer();

                break;

            case "Reverse":

                this.turnManager.reverse();

                this.turnManager.nextPlayer();

                break;

            case "Draw2": {

                const target = this.turnManager.nextPlayer();

                this.giveCards(target, 2);

                this.turnManager.nextPlayer();

                break;

            }

            case "Wild4": {

                const target = this.turnManager.nextPlayer();

                this.giveCards(target, 4);

                this.turnManager.nextPlayer();

                break;

            }

            default:

                this.turnManager.nextPlayer();

        }

    }

    private giveCards(playerIndex: number, count: number): void {

        const player = this.players.getPlayer(playerIndex);

        if (!player)
            return;

        player.hand.push(...this.deck.drawCards(count));

    }

    /**
     * Draws a card for whoever's turn it currently is (used when a player
     * has no legal move) and passes the turn.
     */
    public drawCard(): boolean {

        const playerIndex = this.turnManager.getCurrentPlayer();

        const card = this.deck.drawCard();

        if (!card)
            return false;

        this.players.getPlayer(playerIndex)?.hand.push(card);

        this.turnManager.nextPlayer();

        return true;

    }

    // ------------------------------------------------------------------
    // AI
    // ------------------------------------------------------------------

    /**
     * Chooses which card a bot should play. Strategy: prefer a card that
     * matches the active color (keeps the bot "in color" and burns cards
     * fastest), fall back to an action/number match, and only spend a
     * Wild/Wild4 as a last resort so they're saved for when the bot is
     * genuinely stuck.
     *
     * Returns -1 if the bot has no legal play and must draw.
     */
    public chooseBotMove(playerIndex: number): number {

        const player = this.players.getPlayer(playerIndex);

        const top = this.getTopDiscard();

        if (!player || !top)
            return -1;

        const validIndexes: number[] = [];

        player.hand.forEach((card, i) => {

            if (this.ruleManager.canPlay(card, top, this.currentColor)) {

                validIndexes.push(i);

            }

        });

        if (validIndexes.length === 0)
            return -1;

        const colorMatches = validIndexes.filter(
            (i) => player.hand[i].color === this.currentColor
        );

        if (colorMatches.length > 0) {

            return this.preferActionCard(player.hand, colorMatches);

        }

        const nonWildMatches = validIndexes.filter(
            (i) => player.hand[i].color !== "Wild"
        );

        if (nonWildMatches.length > 0) {

            return this.preferActionCard(player.hand, nonWildMatches);

        }

        // Only wilds are legal here - spend one since there's no other option.
        return validIndexes[0];

    }

    /**
     * Among a set of legal card indexes, prefer action cards (Skip / Reverse
     * / Draw2) over plain numbers - they're more disruptive to opponents and
     * numbers are generally safer to hold onto for matching later.
     */
    private preferActionCard(hand: Card[], indexes: number[]): number {

        const action = indexes.find((i) => hand[i].type !== "Number");

        return action !== undefined ? action : indexes[0];

    }

    /**
     * Picks a color for a bot's Wild/Wild4: whichever color the bot is
     * holding the most of, so it maximizes its own future playable cards.
     */
    public chooseBotColor(playerIndex: number): CardColor {

        const player = this.players.getPlayer(playerIndex);

        if (!player)
            return "Red";

        const counts: Record<string, number> = {
            Red: 0,
            Blue: 0,
            Green: 0,
            Yellow: 0
        };

        for (const card of player.hand) {

            if (card.color !== "Wild") {

                counts[card.color]++;

            }

        }

        let best: CardColor = "Red";
        let bestCount = -1;

        for (const color of PLAYABLE_COLORS) {

            if (counts[color] > bestCount) {

                bestCount = counts[color];
                best = color;

            }

        }

        return best;

    }

}