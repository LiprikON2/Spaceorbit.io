import React from "react";
import { useToggle } from "@mantine/hooks";
import { ArrowsMinimize, Maximize } from "tabler-icons-react";

import { Button } from "~/ui/components";

export const TopRight = ({ GroupComponent }) => {
    const [fullscreenIcon, toggleFullscreenIcon] = useToggle([false, true]);

    const toggleFullscreen = () => {
        const isFullscreen = document.fullscreenElement !== null;

        if (isFullscreen) document.exitFullscreen();
        else document.body.requestFullscreen();
        toggleFullscreenIcon();
    };
    return (
        <>
            <GroupComponent>
                <Button isSquare onClick={toggleFullscreen}>
                    {fullscreenIcon ? <ArrowsMinimize /> : <Maximize />}
                </Button>
            </GroupComponent>
        </>
    );
};
