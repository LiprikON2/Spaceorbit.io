import React from "react";
import { Paper, Stack } from "@mantine/core";

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
            <Paper>
                <Stack>
                    <Button variant="light" color="cyan" fullWidth onClick={handleSingleplayer}>
                        Singleplayer
                    </Button>
                    <Button variant="light" color="cyan" fullWidth onClick={handleMultiplayer}>
                        Multiplayer
                    </Button>
                </Stack>
            </Paper>
        </>
    );
};

// display: flex;
//     flex-direction: column;
//     & > {
//         flex-grow: 1;
//     }
