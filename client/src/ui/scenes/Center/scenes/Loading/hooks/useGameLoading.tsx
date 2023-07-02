import { useEffect, useState } from "react";

import { gameManager } from "~/game";

export const useGameLoading = () => {
    const [status, setStatus] = useState({ name: "Initializing", progress: 0 });

    useEffect(() => {
        const unbind = gameManager.on("loading", (loadingStatus) => {
            setStatus(loadingStatus);
        });

        return unbind;
    }, []);

    return { status };
};
