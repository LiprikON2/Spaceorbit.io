import { useEffect } from "react";

import { useSettings, settingsStorageKey } from "../";
import { setSessionStorage } from "../services/localStorage";

const syncSettingsToSession = () => {
    const unsub = useSettings.subscribe(
        (state) => state.settings,
        (state) => setSessionStorage(settingsStorageKey, state)
    );

    return unsub;
};

export const useSyncSettingsToSession = () => {
    return useEffect(() => {
        const unsub = syncSettingsToSession();
        return unsub;
    }, []);
};
