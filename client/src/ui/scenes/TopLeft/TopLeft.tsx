import React, { useState } from "react";
import { Settings } from "tabler-icons-react";

import { Button } from "~/ui/components";
import { SettingsModal } from "./scenes/SettingsModal";
import { EffectsMuteBtn } from "./scenes/EffectsMuteBtn";
import { MusicMuteBtn } from "./scenes/MusicMuteBtn";
import { useGame } from "~/ui/hooks";

export const TopLeft = ({ GroupComponent }) => {
    const { gameManager } = useGame();
    const [openedSettings, setOpenedSettings] = useState(false);

    const openSettings = () => {
        gameManager.lockInput();
        setOpenedSettings(true);
    };
    const closeSettings = () => {
        gameManager.unlockInput();
        setOpenedSettings(false);
    };

    return (
        <>
            <GroupComponent>
                <Button isSquare onClick={openSettings}>
                    <Settings strokeWidth={2.5} />
                </Button>
                <EffectsMuteBtn />
                <MusicMuteBtn />
            </GroupComponent>
            <SettingsModal opened={openedSettings} onClose={closeSettings} />
        </>
    );
};
