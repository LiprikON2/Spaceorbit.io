import { useDidUpdate } from "@mantine/hooks";

import { useGame } from "../";
import { useState } from "react";

export const useMultiplayerDisconnect = () => {
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const {
        gameManager,
        loadMainMenu,
        computed: { isLoaded },
    } = useGame();

    useDidUpdate(() => {
        if (isLoaded) {
            console.log("LOADED CHANGED");
            const { channel } = gameManager.game;
            channel.onDisconnect(() => {
                loadMainMenu();
                console.log("SET ERROR");
                setConnectionError("Connection to server lost");
            });
        }
    }, [isLoaded]);

    const clearConnectionError = () => {
        setConnectionError(null);
    };

    return { connectionError, clearConnectionError };
};
