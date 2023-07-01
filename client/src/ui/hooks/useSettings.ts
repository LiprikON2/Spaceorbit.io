import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { produce } from "immer";

const isTouchDevice = () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator["msMaxTouchPoints"] > 0;

interface SettingsStore {
    settings: typeof defaultSettings;
    toggleEffectsSetting: () => void;
    toggleMusicSetting: () => void;
    setMasterVolumeSetting: (volume: number) => void;
    setEffectsVolumeSetting: (volume: number) => void;
    setMusicVolumeSetting: (volume: number) => void;
    setGraphicsSettingsSetting: (value: number) => void;
    toggleTouchControlsSetting: () => void;
}

const setSessionStorage = (key, value) => {
    sessionStorage.setItem(key, serializeJSON(value));
};

const getSessionStorage = (key) => {
    return deserializeJSON(sessionStorage.getItem(key) ?? "{}");
};

const serializeJSON = (value: any) => {
    try {
        return JSON.stringify(value);
    } catch (error) {
        throw new Error("Failed to serialize the value");
    }
};

const deserializeJSON = (value: string) => {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const defaultSettings = {
    musicMute: false,
    effectsMute: false,
    masterVolume: 1,
    effectsVolume: 0.1,
    musicVolume: 0.05,
    graphicsSettings: 1,
    enableTouchControls: isTouchDevice(),
    showDeviceInfo: false,
};

const key = "settings";

export const useSettings = create<SettingsStore>()(
    subscribeWithSelector((set) => ({
        settings: { ...defaultSettings, ...getSessionStorage(key) },
        toggleEffectsSetting: () =>
            set(
                produce((state) => {
                    state.settings.effectsMute = !state.settings.effectsMute;
                })
            ),
        toggleMusicSetting: () =>
            set(
                produce((state) => {
                    state.settings.musicMute = !state.settings.musicMute;
                })
            ),
        setMasterVolumeSetting: (volume) =>
            set(
                produce((state) => {
                    state.settings.masterVolume = volume;
                })
            ),
        setEffectsVolumeSetting: (volume) =>
            set(
                produce((state) => {
                    state.settings.effectsVolume = volume;
                })
            ),
        setMusicVolumeSetting: (volume) =>
            set(
                produce((state) => {
                    state.settings.musicVolume = volume;
                })
            ),
        setGraphicsSettingsSetting: (value) =>
            set(
                produce((state) => {
                    state.settings.graphicsSettings = value;
                })
            ),
        toggleTouchControlsSetting: () =>
            set(
                produce((state) => {
                    state.settings.enableTouchControls = !state.settings.enableTouchControls;
                })
            ),
    }))
);

export const syncSettingsToSession = () => {
    const unsub = useSettings.subscribe(
        (state) => state.settings,
        (state) => setSessionStorage(key, state)
    );

    return unsub;
};
