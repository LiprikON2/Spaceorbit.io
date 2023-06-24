import React from "react";
import { useToggle } from "@mantine/hooks";
import { Settings } from "tabler-icons-react";

import { game } from "~/game";
import { Button } from "~/ui/components";
import { SettingsModal } from "./scenes/SettingsModal";
import { EffectsMuteBtn } from "./scenes/EffectsMuteBtn";
import { MusicMuteBtn } from "./scenes/MusicMuteBtn";

export const TopLeft = ({ GroupComponent }) => {
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
                <EffectsMuteBtn />
                <MusicMuteBtn />
            </GroupComponent>
            <SettingsModal opened={openedSettings} onClose={toggleSettings} />
        </>
    );
};
