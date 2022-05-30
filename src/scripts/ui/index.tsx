import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";

import { MantineProvider, NumberInput } from "@mantine/core";
import { useToggle, useLocalStorage } from "@mantine/hooks";
import {
    ArrowsMinimize,
    Maximize,
    Music,
    MusicOff,
    Volume,
    VolumeOff,
    Settings,
} from "tabler-icons-react";

import { createGame, getGame } from "../game";
import Button from "./components/button";
import SettingsModal from "./settingsModal";
import "./index.css";

const App = () => {
    // const [init, setInit] = useState(false);
    const [settings, setSettings] = useLocalStorage({
        key: "settings",
        defaultValue: {
            masterVolume: 1,
            effectsVolume: 0.1,
            musicVolume: 0.05,
            musicMute: false,
            effectsMute: false,
            graphicsSettings: 1,
        },
    });
    const [fullscreenIcon, toggleFullscreenIcon] = useToggle(false, [false, true]);
    const [musicIcon, toggleMusicIcon] = useToggle(settings.musicMute, [false, true]);
    const [effectsIcon, toggleEffectsIcon] = useToggle(settings.effectsMute, [false, true]);
    const [settingsModal, toggleSettingsModal] = useToggle(false, [false, true]);

    useEffect(() => {
        createGame(settings);
        // setInit(true);
    }, []);

    const toggleMute = (key) => {
        const soundManager = getGame().scene.keys.MainScene.soundManager;
        const isValidKey = key === "musicMute" || key === "effectsMute";

        if (soundManager && isValidKey) {
            soundManager.toggleMute(key);
            setSettings((pervSettings) => ({ ...pervSettings, [key]: !settings[key] }));
            if (key === "musicMute") {
                toggleMusicIcon();
            } else if (key === "effectsMute") {
                toggleEffectsIcon();
            }
        }
    };

    const toggleFullscreen = () => {
        const isFullscreen = document.fullscreenElement !== null;

        if (isFullscreen) document.exitFullscreen();
        else document.body.requestFullscreen();
        toggleFullscreenIcon();
    };

    const toggleSettings = () => {
        const player = getGame().scene.keys.MainScene.player;
        if (player) {
            toggleSettingsModal();
            player.active = !player.active;
        }
    };

    // TEMP

    // const sendMobs = (e) => {
    //     e.preventDefault();
    //     const mobs = getGame().scene?.keys?.MainScene?.mobManager?.mobs;
    //     if (mobs?.length - 1 >= index) {
    //         mobs[index].moveTo(x, y);
    //         mobs[index].lookAtPoint(x, y);
    //     }
    // };
    const sendMobs = (e) => {
        e.preventDefault();
        const scene = getGame().scene.keys.MainScene;
        const mobManager = scene?.mobManager;
        const player = scene?.player;
        const mobs = mobManager?.mobs;
        mobManager.spawnMobs(mobsCount, [player]);

        mobs.forEach((mob) => {
            mob.moveTo(x, y);
            mob.lookAtPoint(x, y);
        });
    };

    const [x, setx] = useState(120);
    const [y, sety] = useState(120);
    const [mobsCount, setMobsCount] = useState(0);

    return (
        // init && (
        <MantineProvider theme={{ colorScheme: "dark" }} children>
            <div id="UI">
                <SettingsModal
                    settings={settings}
                    setSettings={setSettings}
                    opened={settingsModal}
                    onClose={toggleSettings}
                />

                <div className="volumeControls group">
                    <Button isSquare={true} onClick={toggleSettings}>
                        <Settings />
                    </Button>
                    <Button
                        className="musicMute"
                        isSquare={true}
                        onClick={() => toggleMute("musicMute")}
                    >
                        {musicIcon ? <MusicOff /> : <Music />}
                    </Button>
                    <Button
                        className="effectsMute"
                        isSquare={true}
                        onClick={() => toggleMute("effectsMute")}
                    >
                        {effectsIcon ? <VolumeOff /> : <Volume />}
                    </Button>
                    {/* TEMP */}
                    <form onSubmit={sendMobs}>
                        <NumberInput
                            onChange={(value) => setMobsCount(value)}
                            defaultValue={mobsCount}
                            placeholder="You better not put 1000..."
                            label="Mobs Count"
                        />
                        <NumberInput
                            onChange={(value) => setx(value)}
                            defaultValue={x}
                            placeholder="x"
                            label="x"
                        />
                        <NumberInput
                            onChange={(value) => sety(value)}
                            defaultValue={y}
                            placeholder="y"
                            label="y"
                        />
                        <br />
                        <Button type="submit">Send mobs at x, y</Button>
                    </form>
                </div>
                <Button className="fullscreen" isSquare={true} onClick={toggleFullscreen}>
                    {fullscreenIcon ? <ArrowsMinimize /> : <Maximize />}
                </Button>
            </div>
        </MantineProvider>
        // )
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
