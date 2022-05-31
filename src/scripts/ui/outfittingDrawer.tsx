import React from "react";
import { Drawer, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";
import { useDroppable, useDraggable } from "@dnd-kit/core";

import Button from "./components/button";

const OutfittingDrawer = () => {
    const [openedOutfitting, handleOpenOutfitting] = useDisclosure(false);

    const { isOver, setNodeRef } = useDroppable({
        id: "droppable",
    });

    return (
        <>
            <div className="outfitting group">
                <Button isSquare={true} onClick={() => handleOpenOutfitting.open()}>
                    <Tool />
                </Button>
            </div>
            <Drawer
                opened={openedOutfitting}
                onClose={() => handleOpenOutfitting.close()}
                title={<Title order={4}>Game Settings</Title>}
                overlayOpacity={0}
                padding="xl"
                size="lg"
            >
                <Button ref={setNodeRef}>ELEM</Button>
            </Drawer>
        </>
    );
};

export default OutfittingDrawer;
