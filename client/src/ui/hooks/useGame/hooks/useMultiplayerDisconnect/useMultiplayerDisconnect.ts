import { useState } from "react";
import { useDidUpdate } from "@mantine/hooks";

import { useGame } from "../..";

export const useMultiplayerDisconnect = () => {
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const {
        gameManager,
        loadMainMenu,
        computed: { isLoaded },
    } = useGame();

    useDidUpdate(() => {
        if (isLoaded) {
            const { channel } = gameManager.game;
            channel.onDisconnect(() => {
                loadMainMenu();
                setConnectionError("Connection to server lost");
            });
        }
    }, [isLoaded]);

    const clearConnectionError = () => {
        setConnectionError(null);
    };

    return { connectionError, clearConnectionError };
};
