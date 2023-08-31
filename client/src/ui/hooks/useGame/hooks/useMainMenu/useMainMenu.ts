import { useEffect } from "react";

import { useGame } from "~/ui/hooks";

export const useMainMenu = () => {
    const {
        gameManager,
        loadMainMenu,
        exit,
        mode,
        computed: { isLoaded },
    } = useGame();

    useEffect(() => {
        if (isLoaded && mode === "multiplayer") {
            const { channel } = gameManager.game;
            channel.onDisconnect(() => exit());
        }
    }, [isLoaded]);

    useEffect(() => {
        if (mode === "exiting") {
            loadMainMenu();
        }
    }, [mode]);
};
