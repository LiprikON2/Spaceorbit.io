import { useEffect, useState } from "react";

import { gameManager, ConnectionErrorEvent } from "~/game";

export const useGameLoading = () => {
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
