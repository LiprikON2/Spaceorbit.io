import React, { useEffect } from "react";
import { useToggle } from "@mantine/hooks";
import { Volume, VolumeOff } from "tabler-icons-react";

import { ToggleButton } from "../../components";
import { useSettings } from "~/ui/hooks";
import { game } from "~/game";

const settingName = "effectsMute";

export const EffectsMuteBtn = () => {
    const { settings, toggleEffectsSetting } = useSettings();
    const [on, toggle] = useToggle([!settings[settingName], settings[settingName]]);

    const handleClick = () => {
        const { soundManager } = game.getScene();

        if (soundManager) {
            soundManager.toggleMute(settingName);
            toggleEffectsSetting();
            toggle();
        }
    };

    useEffect(() => {
        console.log("settings are actylly change", settings);
    }, [settings]);

    return (
        <ToggleButton on={on} iconOn={<Volume />} iconOff={<VolumeOff />} onClick={handleClick} />
    );
};
