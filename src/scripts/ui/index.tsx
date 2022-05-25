import { createRoot } from "react-dom/client";
import React, { useState, useEffect, useLayoutEffect } from "react";

import { Button, Group, Dialog } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { ArrowsMinimize, Maximize, Music, MusicOff } from "tabler-icons-react";

import { createGame, getGame } from "../game";
import "./index.css";
const App = () => {
    const [init, setInit] = useState(false);
    const [isFullscreen, toggleIsFullscreen] = useToggle(false, [false, true]);
    const [musicMute, toggleMusicMute] = useToggle(false, [false, true]);
    useEffect(() => {
        createGame();
        setInit(true);
    }, []);

    const addEngine = (e) => {
        const scene = getGame().scene.keys.MainScene;
        scene.player.exhaust.createExhaust();
    };

    const toggleMusic = (e) => {
        const soundManager = getGame().scene.keys.MainScene.soundManager;
        soundManager.toggleMute("musicVolume");
        toggleMusicMute();
        console.log(musicMute);
    };

    const toggleFullscreen = (e) => {
        const isFullscreen = document.fullscreenElement !== null;
        if (isFullscreen) document.exitFullscreen();
        else document.body.requestFullscreen();
        toggleIsFullscreen();
    };
    return (
        init && (
            <div id="UI">
                <Button
                    className="muteMusic"
                    variant="outline"
                    color="gray"
                    size="lg"
                    onClick={toggleMusic}
                >
                    {musicMute ? <MusicOff /> : <Music />}
                </Button>
                <Button
                    className="fullscreen"
                    variant="outline"
                    color="gray"
                    size="lg"
                    onClick={toggleFullscreen}
                >
                    {isFullscreen ? <ArrowsMinimize /> : <Maximize />}
                </Button>
                <Button
                    className="addEngine"
                    variant="outline"
                    color="gray"
                    size="lg"
                    onClick={addEngine}
                >
                    Add engine
                </Button>
            </div>
        )
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
