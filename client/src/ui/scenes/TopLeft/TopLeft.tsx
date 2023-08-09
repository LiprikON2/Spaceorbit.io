import React from "react";
import { useToggle } from "@mantine/hooks";
import { Settings } from "tabler-icons-react";

import { Button } from "~/ui/components";
import { SettingsModal } from "./scenes/SettingsModal";
import { EffectsMuteBtn } from "./scenes/EffectsMuteBtn";
import { MusicMuteBtn } from "./scenes/MusicMuteBtn";
import { useGame } from "~/ui/hooks";

export const TopLeft = ({ GroupComponent }) => {
    const { gameManager } = useGame();
    const [openedSettings, toggleSettingsModal] = useToggle([false, true]);

    const toggleSettings = () => {
        if (openedSettings) {
            gameManager.unlockInput();
        } else {
            gameManager.lockInput();
        }

        toggleSettingsModal();
    };
    return (
        <>
            <GroupComponent>
                <Button isSquare onClick={toggleSettings}>
                    <Settings strokeWidth={2.5} />
                </Button>
                <EffectsMuteBtn />
                <MusicMuteBtn />
            </GroupComponent>
            <SettingsModal opened={openedSettings} onClose={toggleSettings} />
        </>
    );
};
