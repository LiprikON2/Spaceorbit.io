import React from "react";
import { Music, MusicOff } from "tabler-icons-react";
import { observer } from "mobx-react-lite";

import { ToggleButton } from "~/ui/components";
import { useSettings } from "~/ui/hooks";

export const MusicMuteBtn = observer(() => {
    const { settings } = useSettings();

    return (
        <ToggleButton
            on={!settings.musicMute}
            iconOn={<Music strokeWidth={2.5} />}
            iconOff={<MusicOff strokeWidth={2.5} />}
            onClick={() => settings.setMusicMute(!settings.musicMute)}
        />
    );
});
