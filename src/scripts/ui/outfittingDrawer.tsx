import React from "react";
import { Drawer, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";
import { useDroppable, useDraggable, DndContext } from "@dnd-kit/core";

import Button from "./components/button";
import DraggableItem from "./components/draggableItem";
import DroppableInventory from "./components/droppableInventory";

const OutfittingDrawer = () => {
    const [openedOutfitting, handleOpenOutfitting] = useDisclosure(false);

    // const { isOver, setNodeRef: droppableRef } = useDroppable({
    //     id: "droppable",
    // });

    // const {
    //     attributes,
    //     listeners,
    //     setNodeRef: draggableRef,
    //     transform,
    // } = useDraggable({
    //     id: "draggable",
    // });

    // const item = <div ref={draggableRef}>ELEM</div>;
    const [isDropped, handleDrop] = useDisclosure(false);

    const handleDragEnd = (event) => {
        if (event.over && event.over.id === "droppable") {
            handleDrop.toggle();
        }
    };

    const item = <DraggableItem children={undefined}>hello</DraggableItem>;

    return (
        <DndContext onDragEnd={handleDragEnd}>
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
                {!isDropped ? item : null}
                <DroppableInventory children={undefined}>
                    {isDropped ? item : "Drop here"}
                </DroppableInventory>
            </Drawer>
        </DndContext>
    );
};

export default OutfittingDrawer;
