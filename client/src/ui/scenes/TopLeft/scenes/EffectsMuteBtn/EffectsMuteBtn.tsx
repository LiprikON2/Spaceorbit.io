import React from "react";
import { observer } from "mobx-react-lite";
import { Volume, VolumeOff } from "tabler-icons-react";

import { ToggleButton } from "~/ui/components";
import { useGame } from "~/ui/hooks";

export const EffectsMuteBtn = observer(() => {
    const {
        computed: { settings },
    } = useGame();

    return (
        <ToggleButton
            on={!settings.effectsMute}
            iconOn={<Volume strokeWidth={2.5} />}
            iconOff={<VolumeOff strokeWidth={2.5} />}
            onClick={() => settings.setEffectsMute(!settings.effectsMute)}
        />
    );
});
