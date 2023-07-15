import { useState } from "react";
import { useDidUpdate } from "@mantine/hooks";

import { useGame } from "~/ui/hooks";

export const useMultiplayerDisconnect = () => {
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const {
        gameManager,
        loadMainMenu,
        mode,
        computed: { isLoaded, isExiting },
    } = useGame();

    useDidUpdate(() => {
        if (isLoaded && mode === "multiplayer") {
            const { channel } = gameManager.game;
            channel.onDisconnect(() => {
                // TODO isExiting here is ending up stale from mutations
                if (!isExiting) {
                    loadMainMenu();
                    setConnectionError("Connection to the server was lost");
                }
            });
        }
    }, [isExiting]);

    const clearConnectionError = () => {
        setConnectionError(null);
    };

    return { connectionError, clearConnectionError };
};
