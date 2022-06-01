import React, { useState } from "react";
import { Avatar, Drawer, Indicator, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";
import { useDroppable, useDraggable, DndContext } from "@dnd-kit/core";

import Button from "./components/button";
import DraggableItem from "./components/draggableItem";
import DroppableInventory from "./components/droppableInventory";

import "./outfittingDrawer.css";

const OutfittingDrawer = () => {
    const [openedOutfitting, handleOpenOutfitting] = useDisclosure(false);

    const draggableItem = (
        <DraggableItem id="draggable" children={undefined}>
            <Avatar
                size="lg"
                src="https://static.turbosquid.com/Preview/2019/05/16__16_34_43/Main.pngDB38749E-7F73-4125-A7A2-8BE667282521Large.jpg"
            />
        </DraggableItem>
    );

    const slots = {
        inventory: { size: 10 },
        engineSlots: { size: 3 },
        weaponSlots: { size: 3 },
        moduleSlots: { size: 1 },
    };
    const [parent, setParent] = useState("inventory-0");

    const handleDragEnd = (event) => {
        const { over } = event;

        if (over) {
            setParent(over.id);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="outfitting group">
                <Indicator inline label="New" color="cyan" size={16} withBorder>
                    <Button isSquare={true} onClick={() => handleOpenOutfitting.open()}>
                        <Tool />
                    </Button>
                </Indicator>
            </div>
            <Drawer
                opened={openedOutfitting}
                onClose={() => handleOpenOutfitting.close()}
                title={<Title order={4}>Outfitting</Title>}
                overlayOpacity={0}
                padding="xl"
                size="lg"
            >
                <div className="inventory">
                    {Object.entries(slots).map(([key, value]) => {
                        console.log(key, "value", value);
                        let slots: any = [];
                        for (let i = 0; i < value.size; i++) {
                            const id = `${key}-${i}`;
                            console.log("id", id);
                            const slot = (
                                <DroppableInventory key={id} id={id} children={undefined}>
                                    {parent === id ? draggableItem : `(${id})`}
                                </DroppableInventory>
                            );
                            slots.push(slot);
                        }

                        return <>{slots}</>;
                    })}
                </div>
            </Drawer>
        </DndContext>
    );
};

export default OutfittingDrawer;
