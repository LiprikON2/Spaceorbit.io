import React from "react";
import { useToggle } from "@mantine/hooks";
import { Music, MusicOff, Settings, Volume, VolumeOff } from "tabler-icons-react";

import { game } from "~/game";
import { Button } from "~/ui/components";
import { SettingsModal } from "./scenes/SettingsModal";
import { useSettings } from "~/ui/hooks";

export const TopLeft = ({ GroupComponent }) => {
    const { settings, setSettings } = useSettings();

    const toggleMute = (key) => {
        const { soundManager } = game.getScene();
        const isValidKey = key === "musicMute" || key === "effectsMute";

        if (soundManager && isValidKey) {
            soundManager.toggleMute(key);
            setSettings((prevSettings) => ({ ...prevSettings, [key]: !settings[key] }));
            if (key === "musicMute") {
                toggleMusicIcon();
            } else if (key === "effectsMute") {
                toggleEffectsIcon();
            }
        }
    };

    const [musicIcon, toggleMusicIcon] = useToggle([settings.musicMute, !settings.musicMute]);
    const [effectsIcon, toggleEffectsIcon] = useToggle([
        settings.effectsMute,
        !settings.effectsMute,
    ]);
    const [openedSettings, toggleSettingsModal] = useToggle([false, true]);

    const toggleSettings = () => {
        const player = game.getPlayer();
        if (player) {
            toggleSettingsModal();
            // todo this will enable you to shoot and move in dying animation
            player.active = openedSettings;
        }
    };
    return (
        <>
            <GroupComponent>
                <Button isSquare onClick={toggleSettings}>
                    <Settings />
                </Button>
                <Button className="musicMute" isSquare onClick={() => toggleMute("musicMute")}>
                    {musicIcon ? <MusicOff /> : <Music />}
                </Button>
                <Button className="effectsMute" isSquare onClick={() => toggleMute("effectsMute")}>
                    {effectsIcon ? <VolumeOff /> : <Volume />}
                </Button>
            </GroupComponent>
            <SettingsModal
                settings={settings}
                setSettings={setSettings}
                opened={openedSettings}
                onClose={toggleSettings}
            />
        </>
    );
};
