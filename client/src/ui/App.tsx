import React, { useEffect, useState } from "react";
import { Device } from "@capacitor/device";
import { Indicator, Stack, Text } from "@mantine/core";
import { useDisclosure, useLocalStorage, useToggle } from "@mantine/hooks";
import {
    ArrowsMinimize,
    Maximize,
    Music,
    MusicOff,
    Settings,
    Tool,
    User,
    Volume,
    VolumeOff,
} from "tabler-icons-react";

import { game } from "~/game";
import { Button } from "~/ui/components";
import { OutfittingDrawer } from "./scenes/OutfittingDrawer";
import { ProfileModal } from "./scenes/ProfileModal";
import { SettingsModal } from "./scenes/SettingsModal";
import "./App.css";

const isTouchDevice = () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator["msMaxTouchPoints"] > 0;

export const App = ({ queryClient }) => {
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
    const [outfittingDrawer, { close: closeOutfittngDrawer, toggle: toggleOutfittngDrawer }] =
        useDisclosure(false);

    const [deviceInfo, setDeviceInfo] = useState("");
    const logDeviceInfo = async () => {
        const info = await Device.getInfo();
        setDeviceInfo(info);
    };

    useEffect(() => {
        game.init(settings);
        logDeviceInfo();
    }, []);

    const toggleMute = (key) => {
        const { soundManager } = game.getScene();
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
        const player = game.getPlayer();
        if (player) {
            toggleSettingsModal();
            // todo this will enable you to shoot and move in dying animation
            player.active = settingsModal;
        }
    };
    const toggleProfile = () => {
        const player = game.getPlayer();
        if (player) {
            toggleProfileModal();
            // todo this will enable you to shoot and move in dying animation
            player.active = profileModal;
        }
    };

    return (
        <div id="ui">
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
            <SettingsModal
                settings={settings}
                setSettings={setSettings}
                opened={settingsModal}
                onClose={toggleSettings}
            />

            <div className="fullscreen group">
                <Button isSquare={true} onClick={toggleFullscreen}>
                    {fullscreenIcon ? <ArrowsMinimize /> : <Maximize />}
                </Button>
            </div>

            <div className="profile group">
                <Button isSquare={true} onClick={toggleProfile}>
                    <User />
                </Button>
            </div>
            <ProfileModal queryClient={queryClient} opened={profileModal} onClose={toggleProfile} />

            <Stack className="info group">
                {Object.entries(deviceInfo).map(([key, value]) => (
                    <Text key={key} color="white" size="xs">
                        {`${key}: ${value}`}
                    </Text>
                ))}
            </Stack>

            <div className="outfitting group">
                <Indicator inline label="New" color="cyan" size={16} withBorder>
                    <Button isSquare={true} onClick={toggleOutfittngDrawer}>
                        <Tool />
                    </Button>
                </Indicator>
            </div>

            <OutfittingDrawer shouldBeOpened={outfittingDrawer} close={closeOutfittngDrawer} />
        </div>
    );
};
