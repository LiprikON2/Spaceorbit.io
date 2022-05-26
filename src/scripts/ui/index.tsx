import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";

import { Modal, MantineProvider, Slider, Text } from "@mantine/core";
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
import "./index.css";

const App = () => {
    // const [init, setInit] = useState(false);
    const [settings, setSettings] = useLocalStorage({
        key: "settings",
        defaultValue: { effectsMuted: false, musicMuted: false },
    });
    const [fullscreenIcon, toggleFullscreenIcon] = useToggle(false, [false, true]);
    const [musicIcon, toggleMusicIcon] = useToggle(settings.musicMuted, [false, true]);
    const [effectsIcon, toggleEffectsIcon] = useToggle(settings.effectsMuted, [false, true]);
    const [settingsModal, toggleSettingsModal] = useToggle(false, [false, true]);

    useEffect(() => {
        createGame(settings);
        // setInit(true);
    }, []);

    const addEngine = (e) => {
        const scene = getGame().scene.keys.MainScene;
        if (scene) {
            scene.player.exhaust.createExhaust();
        }
    };

    const toggleMusic = (e) => {
        const soundManager = getGame().scene.keys.MainScene.soundManager;

        if (soundManager) {
            soundManager.toggleMute("musicMuted");
            setSettings({ ...settings, musicMuted: !settings.musicMuted });
            toggleMusicIcon();
        }
    };
    const toggleEffects = (e) => {
        const soundManager = getGame().scene.keys.MainScene.soundManager;
        if (soundManager) {
            soundManager.toggleMute("effectsMuted");
            setSettings({ ...settings, effectsMuted: !settings.effectsMuted });
            toggleEffectsIcon();
        }
    };

    const toggleFullscreen = (e) => {
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
    const [endValue, setEndValue] = useState(50);

    return (
        // init && (
        // @ts-ignore
        <MantineProvider theme={{ colorScheme: "dark" }}>
            <div id="UI">
                <Modal
                    className="modal"
                    opened={settingsModal}
                    onClose={toggleSettings}
                    title="Introduce yourself!"
                >
                    <Slider className="slider" onChangeEnd={setEndValue} />
                    <Text mt={5} size="sm">
                        onChangeEnd value: <b>{endValue}</b>
                    </Text>
                </Modal>

                <div className="volumeControls group">
                    <Button isSquare={true} onClick={toggleSettings}>
                        <Settings />
                    </Button>
                    <Button className="muteMusic" isSquare={true} onClick={toggleMusic}>
                        {musicIcon ? <MusicOff /> : <Music />}
                    </Button>
                    <Button className="effectsMute" isSquare={true} onClick={toggleEffects}>
                        {effectsIcon ? <VolumeOff /> : <Volume />}
                    </Button>
                </div>
                <Button className="fullscreen" isSquare={true} onClick={toggleFullscreen}>
                    {fullscreenIcon ? <ArrowsMinimize /> : <Maximize />}
                </Button>
                <Button className="addEngine" onClick={addEngine}>
                    Add engine
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
