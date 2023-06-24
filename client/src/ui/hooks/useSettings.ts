import { useLocalStorage } from "@mantine/hooks";

const isTouchDevice = () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator["msMaxTouchPoints"] > 0;

export const useSettings = () => {
    const [settings, setSettings] = useLocalStorage({
        key: "settings",
        defaultValue: {
            masterVolume: 1,
            effectsVolume: 0.1,
            musicVolume: 0.05,
            musicMute: false,
            effectsMute: false,
            graphicsSettings: 1,
            enableTouchControls: isTouchDevice(),
        },
    });

    return {
        settings,
        setSettings,
    };
};
