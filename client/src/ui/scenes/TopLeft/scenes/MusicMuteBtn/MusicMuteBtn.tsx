import React from "react";
import { useToggle } from "@mantine/hooks";
import { Music, MusicOff } from "tabler-icons-react";

import { ToggleButton } from "~/ui/components";
import { useSettings } from "~/ui/hooks";
import { game } from "~/game";

const settingName = "musicMute";

export const MusicMuteBtn = () => {
    const { settings, toggleMusicSetting } = useSettings();
    const [on, toggle] = useToggle([!settings[settingName], settings[settingName]]);

    const handleClick = () => {
        const { soundManager } = game.getScene();

        if (soundManager) {
            soundManager.toggleMute(settingName);
            toggleMusicSetting();
            toggle();
        }
    };

    return <ToggleButton on={on} iconOn={<Music />} iconOff={<MusicOff />} onClick={handleClick} />;
};
