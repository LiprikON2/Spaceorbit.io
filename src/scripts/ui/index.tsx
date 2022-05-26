import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";

import { Modal, MantineProvider, Slider, Text, Title, Divider } from "@mantine/core";
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
        defaultValue: {
            masterVolume: 1,
            effectsVolume: 0.1,
            musicVolume: 0.1,
            musicMute: false,
            effectsMute: false,
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

    const addEngine = (e) => {
        const scene = getGame().scene.keys.MainScene;
        if (scene) {
            scene.player.exhaust.createExhaust();
        }
    };

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

    const setVolume = (key, newValue) => {
        const soundManager = getGame().scene.keys.MainScene.soundManager;
        const isValidKey =
            key === "masterVolume" || key === "musicVolume" || key === "effectsVolume";

        if (soundManager && isValidKey) {
            soundManager.setVolume(key, newValue);
            setSettings((pervSettings) => ({ ...pervSettings, [key]: newValue }));
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

    return (
        // init && (
        // @ts-ignore
        <MantineProvider theme={{ colorScheme: "dark" }}>
            <div id="UI">
                <Modal
                    className="modal"
                    opened={settingsModal}
                    onClose={toggleSettings}
                    title={
                        <>
                            <Title order={4}>Game Settings</Title>
                        </>
                    }
                >
                    <Divider my="sm" />
                    <div className="group group-vertical">
                        <Title order={5}>Volume</Title>
                        <div className="group group-vertical">
                            <Title order={6}>Master Volume</Title>
                            <Slider
                                className="slider"
                                color="cyan"
                                label={(value) => `${(value * 100).toFixed(0)}%`}
                                marks={[
                                    { value: 0, label: "0%" },
                                    { value: 0.25, label: "25%" },
                                    { value: 0.5, label: "50%" },
                                    { value: 0.75, label: "75%" },
                                    { value: 1, label: "100%" },
                                ]}
                                min={0}
                                max={1}
                                step={0.01}
                                onChangeEnd={(value) => {
                                    setVolume("masterVolume", value);
                                }}
                                defaultValue={settings.masterVolume}
                            />
                            <Title order={6}>Music Volume</Title>
                            <Slider
                                className="slider"
                                color="cyan"
                                label={(value) => `${(value * 1000).toFixed(0)}%`}
                                marks={[
                                    { value: 0, label: "0%" },
                                    { value: 0.025, label: "25%" },
                                    { value: 0.05, label: "50%" },
                                    { value: 0.075, label: "75%" },
                                    { value: 0.1, label: "100%" },
                                ]}
                                min={0}
                                max={0.1}
                                step={0.001}
                                onChangeEnd={(value) => {
                                    setVolume("musicVolume", value);
                                }}
                                defaultValue={settings.musicVolume}
                            />
                            <Title order={6}>Effects Volume</Title>
                            <Slider
                                className="slider"
                                color="cyan"
                                label={(value) => `${(value * 1000).toFixed(0)}%`}
                                marks={[
                                    { value: 0, label: "0%" },
                                    { value: 0.025, label: "25%" },
                                    { value: 0.05, label: "50%" },
                                    { value: 0.075, label: "75%" },
                                    { value: 0.1, label: "100%" },
                                ]}
                                min={0}
                                max={0.1}
                                step={0.001}
                                onChangeEnd={(value) => {
                                    setVolume("effectsVolume", value);
                                }}
                                defaultValue={settings.effectsVolume}
                            />
                        </div>
                        <Title order={5}>Ship</Title>
                        <div className="group group-vertical">
                            <Button className="addEngine" onClick={addEngine}>
                                Add engine
                            </Button>
                        </div>
                    </div>
                </Modal>

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
