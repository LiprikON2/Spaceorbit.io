import React from "react";
import { Music, MusicOff } from "tabler-icons-react";
import { observer } from "mobx-react-lite";

import { ToggleButton } from "~/ui/components";
import { useGame } from "~/ui/hooks";

export const MusicMuteBtn = observer(() => {
    const {
        computed: { settings },
    } = useGame();
    return (
        <ToggleButton
            on={!settings.musicMute}
            iconOn={<Music strokeWidth={2.5} />}
            iconOff={<MusicOff strokeWidth={2.5} />}
            onClick={() => settings.setMusicMute(!settings.musicMute)}
        />
    );
});
