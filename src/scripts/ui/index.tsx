import { createRoot } from "react-dom/client";
import React, { useEffect, useLayoutEffect } from "react";
import { Button } from "@mantine/core";
import { createGame, getGame } from "../game";

const App = () => {
    useEffect(() => {
        createGame();
    }, []);

    const addEngine = () => {
        console.log(getGame().scene.scenes[1]);
    };

    return (
        <div id="UI" style={{ display: "flex", flexDirection: "column" }}>
            <Button variant="outline" color="gray" size="lg" onClick={addEngine}>
                Settings
            </Button>
        </div>
    );
};

const root = createRoot(document.getElementById("phaser-game")!); // createRoot(container!) if you use TypeScript
root.render(<App />);
