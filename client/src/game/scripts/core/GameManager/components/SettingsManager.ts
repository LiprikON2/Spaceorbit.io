import { makeAutoObservable } from "mobx";

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
    constructor(settings: Partial<Settings>) {
        const initSettings = { ...SettingsManager.defaultSettings, ...settings };
        Object.assign(this, initSettings);

        makeAutoObservable(this);
        console.dir(this);
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

    static isTouchDevice() {
        return (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            navigator["msMaxTouchPoints"] > 0
        );
    }
}

export { SettingsManager };
