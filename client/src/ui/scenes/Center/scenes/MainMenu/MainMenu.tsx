import React from "react";
import { Paper, Stack } from "@mantine/core";

import { Button } from "~/ui/components";
import { useGame, useSettings } from "~/ui/hooks";
import { useNetlify } from "./hooks";

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

    const [servers, status] = useNetlify();

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
                    <div>
                        {status === "loading" && "Loading..."}
                        {status === "error" && "Error"}
                        {status === "success" && servers.map((server) => <p>{server}</p>)}
                    </div>
                </Stack>
            </Paper>
        </>
    );
};
