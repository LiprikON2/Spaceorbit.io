import React from "react";
import { useToggle } from "@mantine/hooks";
import { Volume, VolumeOff } from "tabler-icons-react";

import { ToggleButton } from "~/ui/components";
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

    return (
        <ToggleButton on={on} iconOn={<Volume />} iconOff={<VolumeOff />} onClick={handleClick} />
    );
};
