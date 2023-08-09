import React from "react";
import { useToggle } from "@mantine/hooks";
import { Volume, VolumeOff } from "tabler-icons-react";

import { ToggleButton } from "~/ui/components";
import { useGame, useSettings } from "~/ui/hooks";

const settingName = "effectsMute";

export const EffectsMuteBtn = () => {
    const {
        computed: {
            scene: { soundManager },
        },
    } = useGame();
    const { settings, toggleEffectsSetting } = useSettings();
    const [on, toggle] = useToggle([!settings[settingName], settings[settingName]]);

    const handleClick = () => {
        soundManager.toggleMute(settingName);
        toggleEffectsSetting();
        toggle();
    };

    return (
        <ToggleButton
            on={on}
            iconOn={<Volume strokeWidth={2.5} />}
            iconOff={<VolumeOff strokeWidth={2.5} />}
            onClick={handleClick}
        />
    );
};
