import React from "react";

import { Button } from "~/ui/components";
import { useGame, useSettings } from "~/ui/hooks";

export const Center = ({ GroupComponent }) => {
    const { settings } = useSettings();
    const { mode, loadSingleplayer, loadMultiplayer } = useGame();

    const handleSingleplayer = () => {
        if (mode === "mainMenu") {
            loadSingleplayer(settings);
        }
    };
    const handleMultiplayer = () => {
        if (mode === "mainMenu") {
            loadMultiplayer(settings);
        }
    };

    return (
        <GroupComponent>
            <Button fullWidth onClick={handleSingleplayer}>
                Singleplayer
            </Button>
            <Button fullWidth onClick={handleMultiplayer}>
                Multiplayer
            </Button>
        </GroupComponent>
    );
};
