import React from "react";
import { Indicator } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";

import { Button } from "~/ui/components";
import { OutfittingDrawer } from "./scenes/OutfittingDrawer";

export const BottomLeft = ({ GroupComponent }) => {
    const [openedOutfittingDrawer, { close: closeOutfittngDrawer, toggle: toggleOutfittngDrawer }] =
        useDisclosure(false);
    return (
        <>
            <GroupComponent>
                <Indicator inline label="New" color="cyan" size={16} withBorder>
                    <Button isSquare onClick={toggleOutfittngDrawer}>
                        <Tool />
                    </Button>
                </Indicator>
            </GroupComponent>
            <OutfittingDrawer
                shouldBeOpened={openedOutfittingDrawer}
                close={closeOutfittngDrawer}
            />
        </>
    );
};
