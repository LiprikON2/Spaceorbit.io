import React from "react";
import { useToggle } from "@mantine/hooks";
import { Music, MusicOff } from "tabler-icons-react";

import { ToggleButton } from "~/ui/components";
import { useGame, useSettings } from "~/ui/hooks";

const settingName = "musicMute";

export const MusicMuteBtn = () => {
    const {
        computed: {
            scene: { soundManager },
        },
    } = useGame();
    const { settings, toggleMusicSetting } = useSettings();
    const [on, toggle] = useToggle([!settings[settingName], settings[settingName]]);

    const handleClick = () => {
        soundManager.toggleMute(settingName);
        toggleMusicSetting();
        toggle();
    };

    return <ToggleButton on={on} iconOn={<Music />} iconOff={<MusicOff />} onClick={handleClick} />;
};
