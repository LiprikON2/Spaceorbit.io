import { autorun, makeAutoObservable } from "mobx";

import { setLocalStorage, getLocalStorage } from "~/game/utils/localStorage";

type GraphicsSettings = "low" | "medium" | "high";

export interface Settings {
    masterVolume: number;
    effectsVolume: number;
    musicVolume: number;
    effectsMute: boolean;
    musicMute: boolean;
    graphicsSettings: GraphicsSettings;
    touchMode: boolean;
    showDeviceInfo: boolean;
    toFollowCursor: boolean;
}

// https://stackoverflow.com/a/65660235
interface SettingsManager extends Settings {}

class SettingsManager {
    readonly storageKey = "settings";
    readonly settingKeys: string[] = [];

    static defaultSettings: Settings = {
        musicMute: false,
        effectsMute: false,
        masterVolume: 1,
        effectsVolume: 0.1,
        musicVolume: 0.025,
        graphicsSettings: "high",
        touchMode: SettingsManager.isTouchDevice(),
        showDeviceInfo: false,
        toFollowCursor: false,
    };

    constructor(defaultOverride: Partial<Settings>) {
        const localStorageSettings = getLocalStorage(this.storageKey);

        const initSettings = {
            ...SettingsManager.defaultSettings,
            ...defaultOverride,
            ...localStorageSettings,
        };
        Object.assign(this, initSettings);
        this.settingKeys = Object.keys(initSettings);

        makeAutoObservable(this);
        autorun(() => setLocalStorage(this.storageKey, this.all));
    }

    get all() {
        return Object.fromEntries(
            this.settingKeys.map((settingKey) => [settingKey, this[settingKey]])
        );
    }

    setMasterVolume = (value: number) => {
        this.masterVolume = value;
    };
    setEffectsVolume = (value: number) => {
        this.effectsVolume = value;
    };
    setMusicVolume = (value: number) => {
        this.musicVolume = value;
    };
    setEffectsMute = (value: boolean) => {
        this.effectsMute = value;
    };
    setMusicMute = (value: boolean) => {
        this.musicMute = value;
    };
    setGraphicsSettings = (value: GraphicsSettings) => {
        this.graphicsSettings = value;
    };
    setShowDeviceInfo = (value: boolean) => {
        this.showDeviceInfo = value;
    };
    setTouchMode = (value: boolean) => {
        this.touchMode = value;
    };
    setToFollowCursor = (value: boolean) => {
        this.toFollowCursor = value;
    };

    static isTouchDevice() {
        return (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            navigator["msMaxTouchPoints"] > 0
        );
    }
}

export { SettingsManager };
