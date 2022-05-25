import { createRoot } from "react-dom/client";
import React, { useEffect, useLayoutEffect } from "react";
import { Button } from "@mantine/core";
import { createGame, getGame } from "../game";

const App = () => {
    useEffect(() => {
        createGame();
    }, []);

    const addEngine = (e) => {
        const scene = getGame().scene.keys.MainScene;
        scene.player.exhaust.createExhaust();
    };
    const toggleFullscreen = (e) => {
        const isFullscreen = document.fullscreenElement !== null;
        if (isFullscreen) document.exitFullscreen();
        else document.body.requestFullscreen();
    };

    return (
        <div id="UI" style={{ display: "flex", flexDirection: "column" }}>
            <Button variant="outline" color="gray" size="lg" onClick={addEngine}>
                Add engine
            </Button>
            <Button variant="outline" color="gray" size="lg" onClick={toggleFullscreen}>
                []
            </Button>
        </div>
    );
};

const container = document.getElementById("phaser-game");
const root = createRoot(container!);
root.render(<App />);

// Stops clicking-through of the UI
// https://github.com/photonstorm/phaser/issues/4447
const events = ["mouseup", "mousedown", "touchstart", "touchmove", "touchend", "touchcancel"];
events.forEach((event) => {
    container!.addEventListener(event, (e) => e.stopPropagation());
});
