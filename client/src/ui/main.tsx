import "core-js/actual";
import React, { useEffect, useState } from "react";
import { Device } from "@capacitor/device";
import { MantineProvider, Stack, Text } from "@mantine/core";
import { useLocalStorage, useToggle } from "@mantine/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import {
    ArrowsMinimize,
    Maximize,
    Music,
    MusicOff,
    Settings,
    User,
    Volume,
    VolumeOff,
} from "tabler-icons-react";

import { game, createGame } from "~/game";
import Button from "~/components/button";
import { OutfittingDrawer, ProfileModal, SettingsModal } from "~/components/modals";
import "./main.css";

const isTouchDevice = () => {
    return (
        // @ts-ignore
        "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    );
};

const queryClient = new QueryClient();

const App = () => {
    const [settings, setSettings] = useLocalStorage({
        key: "settings",
        defaultValue: {
            masterVolume: 1,
            effectsVolume: 0.1,
            musicVolume: 0.05,
            musicMute: false,
            effectsMute: false,
            graphicsSettings: 1,
            enableTouchControls: isTouchDevice(),
        },
    });
    const [fullscreenIcon, toggleFullscreenIcon] = useToggle([false, true]);
    const [musicIcon, toggleMusicIcon] = useToggle([settings.musicMute, !settings.musicMute]);
    const [effectsIcon, toggleEffectsIcon] = useToggle([
        settings.effectsMute,
        !settings.effectsMute,
    ]);
    const [settingsModal, toggleSettingsModal] = useToggle([false, true]);
    const [profileModal, toggleProfileModal] = useToggle([false, true]);

    const [deviceInfo, setDeviceInfo] = useState("");
    const logDeviceInfo = async () => {
        const info = await Device.getInfo();
        setDeviceInfo(info);
    };

    useEffect(() => {
        createGame(settings);

        logDeviceInfo();
    }, []);

    const toggleMute = (key) => {
        const soundManager = game.scene.keys.MainScene.soundManager;
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
        const player = game.scene.keys.MainScene.player;
        if (player) {
            toggleSettingsModal();
            // todo this will enable you to shoot and move in dying animation
            player.active = settingsModal;
        }
    };
    const toggleProfile = () => {
        const player = game.scene.keys.MainScene.player;
        if (player) {
            toggleProfileModal();
            // todo this will enable you to shoot and move in dying animation
            player.active = profileModal;
        }
    };

    return (
        <MantineProvider theme={{ colorScheme: "dark" }} children>
            <QueryClientProvider client={queryClient}>
                <div id="ui">
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
                    </div>

                    <div className="fullscreen group">
                        <Button isSquare={true} onClick={toggleFullscreen}>
                            {fullscreenIcon ? <ArrowsMinimize /> : <Maximize />}
                        </Button>
                    </div>

                    <ProfileModal
                        queryClient={queryClient}
                        opened={profileModal}
                        onClose={toggleProfile}
                    />

                    <div className="profile group">
                        <Button isSquare={true} onClick={toggleProfile}>
                            <User />
                        </Button>
                    </div>

                    <Stack className="info group">
                        {Object.entries(deviceInfo).map(([key, value]) => (
                            <Text key={key} color="white" size="xs">
                                {`${key}: ${value}`}
                            </Text>
                        ))}
                    </Stack>
                    <OutfittingDrawer />
                </div>
            </QueryClientProvider>
        </MantineProvider>
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
