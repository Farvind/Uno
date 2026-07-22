export default class TurnManager {

    private currentPlayer = 0;

    private direction: 1 | -1 = 1;

    private totalPlayers: number;

    constructor(totalPlayers: number) {

        this.totalPlayers = totalPlayers;

    }

    public getCurrentPlayer(): number {

        return this.currentPlayer;

    }

    public setCurrentPlayer(player: number): void {

        this.currentPlayer = player;

    }

    public getDirection(): 1 | -1 {

        return this.direction;

    }

    public reverse(): void {

        this.direction *= -1;

    }

    public nextPlayer(): number {

        this.currentPlayer += this.direction;

        if (this.currentPlayer >= this.totalPlayers) {
            this.currentPlayer = 0;
        }

        if (this.currentPlayer < 0) {
            this.currentPlayer = this.totalPlayers - 1;
        }

        return this.currentPlayer;

    }

    public skipPlayer(): number {

        this.nextPlayer();

        return this.nextPlayer();

    }

}