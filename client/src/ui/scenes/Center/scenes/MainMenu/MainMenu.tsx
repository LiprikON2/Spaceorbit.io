import React from "react";
import { Paper, Stack } from "@mantine/core";

import { Button } from "~/ui/components";
import { useGame } from "~/ui/hooks";
import { AccordionButton } from "./components";
import { ServerList } from "./scenes/ServerList";

export const MainMenu = () => {
    const { mode, selectedServer, loadSingleplayer, loadMultiplayer } = useGame();
    const {
        computed: { settings },
    } = useGame();

    const handleSingleplayer = () => {
        if (mode === "mainMenu") {
            loadSingleplayer(settings);
        }
    };
    const handleMultiplayer = () => {
        if (mode === "mainMenu" && selectedServer) {
            loadMultiplayer(settings, selectedServer);
        }
    };
    return (
        <Paper>
            <Stack>
                <Button variant="light" color="cyan" fullWidth onClick={handleSingleplayer}>
                    Singleplayer
                </Button>
                <AccordionButton
                    disabled={!selectedServer}
                    label="Multiplayer"
                    color="cyan"
                    onClick={handleMultiplayer}
                >
                    {(collapsed) => <ServerList collapsed={collapsed} />}
                </AccordionButton>
            </Stack>
        </Paper>
    );
};
