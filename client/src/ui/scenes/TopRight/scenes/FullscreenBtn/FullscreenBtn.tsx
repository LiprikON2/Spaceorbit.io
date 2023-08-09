import React from "react";
import { useToggle } from "@mantine/hooks";
import { ArrowsMinimize, Maximize } from "tabler-icons-react";

import { ToggleButton } from "~/ui/components";

export const FullscreenBtn = () => {
    const [on, toggle] = useToggle([false, true]);

    const handleClick = () => {
        const isFullscreen = document.fullscreenElement !== null;
        if (isFullscreen) document.exitFullscreen();
        else document.body.requestFullscreen();
        toggle();
    };

    return (
        <ToggleButton
            on={on}
            iconOn={<ArrowsMinimize strokeWidth={2.5} />}
            iconOff={<Maximize strokeWidth={2.5} />}
            onClick={handleClick}
        />
    );
};
