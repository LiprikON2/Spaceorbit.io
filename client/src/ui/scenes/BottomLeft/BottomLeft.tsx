import React from "react";
import { Indicator } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";

import { Button } from "~/ui/components";
import { OutfittingDrawer } from "./scenes/OutfittingDrawer";
import { useGame } from "~/ui/hooks";

export const BottomLeft = ({ GroupComponent }) => {
    const { gameManager } = useGame();

    const [openedOutfittingDrawer, { close: closeOutfittngDrawer, toggle: toggleOutfittngDrawer }] =
        useDisclosure(false);

    const toggleOutfitting = () => {
        if (openedOutfittingDrawer) {
            gameManager.unlockInput();
        } else {
            gameManager.lockInput();
        }
        toggleOutfittngDrawer();
    };

    const closeOutfitting = () => {
        gameManager.unlockInput();
        closeOutfittngDrawer();
    };

    return (
        <>
            <GroupComponent>
                <Indicator inline label="New" size={16} withBorder>
                    <Button isSquare onClick={toggleOutfitting}>
                        <Tool strokeWidth={2.5} />
                    </Button>
                </Indicator>
            </GroupComponent>
            <OutfittingDrawer shouldBeOpened={openedOutfittingDrawer} close={closeOutfitting} />
        </>
    );
};
