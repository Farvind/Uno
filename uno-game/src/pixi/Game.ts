import { Application } from "pixi.js";

import AssetLoader from "./AssetLoader";
import Board from "./Board";

import GameManager from "../game/managers/GameManager";

export default class Game {

    public app = new Application();

    async init(container: HTMLElement) {

        await this.app.init({

            resizeTo: window,

            background: "#b3badb"

        });

        container.appendChild(this.app.canvas);

        await AssetLoader.loadAssets();

        const game = new GameManager();

        game.startGame();

        const board = new Board(game,this.app.screen.width,this.app.screen.height);

        this.app.stage.addChild(board);

    }

}