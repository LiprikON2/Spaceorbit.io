import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { produce } from "immer";

import { getSessionStorage } from "./services/localStorage";

const isTouchDevice = () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator["msMaxTouchPoints"] > 0;

interface SettingsStore {
    settings: typeof defaultSettings;
    toggleEffectsSetting: () => void;
    toggleMusicSetting: () => void;
    setMasterVolumeSetting: (volume: number) => void;
    setEffectsVolumeSetting: (volume: number) => void;
    setMusicVolumeSetting: (volume: number) => void;
    setGraphicsSettingsSetting: (value: string) => void;
    toggleTouchControlsSetting: () => void;
    setToFollowCursorSetting: (value: boolean) => void;
}

const defaultSettings = {
    musicMute: false,
    effectsMute: false,
    masterVolume: 1,
    effectsVolume: 0.1,
    musicVolume: 0.05,
    graphicsSettings: "1",
    isTouchMode: isTouchDevice(),
    showDeviceInfo: false,
    toFollowCursor: false,
};

export const settingsStorageKey = "settings";

export const useSettings = create<SettingsStore>()(
    subscribeWithSelector((set) => ({
        settings: { ...defaultSettings, ...getSessionStorage(settingsStorageKey) },
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
                    state.settings.isTouchMode = !state.settings.isTouchMode;
                })
            ),
        setToFollowCursorSetting: (value) =>
            set(
                produce((state) => {
                    state.settings.toFollowCursor = value;
                })
            ),
    }))
);
