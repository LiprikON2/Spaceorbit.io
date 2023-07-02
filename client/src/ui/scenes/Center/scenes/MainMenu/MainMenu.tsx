import React from "react";

import { Button } from "~/ui/components";
import { useGame, useSettings } from "~/ui/hooks";

export const MainMenu = () => {
    const { mode, loadSingleplayer, loadMultiplayer } = useGame();
    const { settings } = useSettings();

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
        <>
            <Button fullWidth onClick={handleSingleplayer}>
                Singleplayer
            </Button>
            <Button fullWidth onClick={handleMultiplayer}>
                Multiplayer
            </Button>
        </>
    );
};
