import { useEffect, useState } from "react";

import { ConnectionErrorEvent } from "~/game";
import { useGame } from "~/ui/hooks";

export const useGameLoading = () => {
    const { gameManager } = useGame();
    const [status, setStatus] = useState({ name: "Initializing", progress: 0 });
    const [error, setError] = useState<ConnectionErrorEvent>(null);

    useEffect(() => {
        const unbind = gameManager.on("loading", (loadingStatus) => {
            setStatus(loadingStatus);
        });
        const unbind2 = gameManager.on("connectionError", (errorDetails) => {
            setError(errorDetails);
        });

        return () => {
            unbind();
            unbind2();
        };
    }, []);

    return { status, error };
};
