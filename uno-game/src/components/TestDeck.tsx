import { useEffect } from "react";

import GameManager from "../game/managers/GameManager"

export default function TestDeck() {

    useEffect(() => {

        const game = new GameManager();

        game.startGame();

        console.log("Players", game.getPlayers());

        console.log("Top Card", game.getTopDiscard());

        console.log("Cards Left", game.getRemainingCards());

    }, []);

    return <h1>UNO Started</h1>;
}