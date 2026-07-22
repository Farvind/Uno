import { useEffect, useRef } from "react";
import Game from "../pixi/Game";

export default function GameView() {

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (!divRef.current)
            return;

        const game = new Game();

        game.init(divRef.current);

    }, []);
    
    return (
        <div
            ref={divRef}
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden"
            }}
        />
    );
   
}