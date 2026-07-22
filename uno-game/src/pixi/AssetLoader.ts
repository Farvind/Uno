import { Assets } from "pixi.js";

export default class AssetLoader {

    public static async loadAssets() {

        const colors = ["Red", "Blue", "Green", "Yellow"];

        const assets: string[] = [];

        for (const color of colors) {

            for (let i = 0; i <= 9; i++) {
                assets.push(`/cards/${color}_${i}.jpg`);
            }

            assets.push(`/cards/${color}_Skip.jpg`);
            assets.push(`/cards/${color}_Reverse.jpg`);
            assets.push(`/cards/${color}_Draw_2.jpg`);
        }

        assets.push("/cards/Wild.jpg");
        assets.push("/cards/Wild_Draw_4.jpg");
        assets.push("/cards/Back.jpg");

        await Assets.load(assets);
    }

}