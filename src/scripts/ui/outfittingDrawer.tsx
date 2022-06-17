import React, { useState } from "react";
import { Avatar, Divider, Drawer, Indicator, ScrollArea, Title } from "@mantine/core";
import { useDidUpdate, useDisclosure, useSetState } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import Button from "./components/button";
import DraggableItem from "./components/draggableItem";
import DroppableInventory from "./components/droppableInventory";

import "./outfittingDrawer.css";
import { getGame } from "../game";
const InventorySlot = ({ inventoryType, slotIndex, isEmpty, children = undefined }) => {
    const getLabel = () => {
        if (inventoryType === "weapons") return "Wpn";
        else if (inventoryType === "engines") return "Eng";
        else if (inventoryType === "inventory") return " ";
    };

    const getColor = () => {
        if (inventoryType === "weapons") return "red";
        else if (inventoryType === "engines") return "yellow";
        else if (inventoryType === "inventory") return undefined;
    };

    const getId = () => {
        const id = [inventoryType, slotIndex].join("-");
        return id;
    };
    return (
        <DroppableInventory data={{ inventoryType, slotIndex, isEmpty }} id={getId()}>
            {children ?? (
                <Avatar src={null} className="item-avatar" size="lg" color={getColor()}>
                    {getLabel()}
                </Avatar>
            )}
        </DroppableInventory>
    );
};

const InventoryItem = ({ inventoryType, slotIndex, itemName, itemType, label, color }) => {
    return (
        <DraggableItem
            data={{ inventoryType, slotIndex, itemName, itemType, label, color }}
            id={[inventoryType, slotIndex, itemName, itemType].join("-")}
        >
            <Indicator
                className="item-indicator"
                position="bottom-start"
                label={label}
                color={color}
                size={16}
                withBorder
                inline
            >
                <Avatar
                    className="item-avatar"
                    size="lg"
                    src={`assets/inventory/${itemName}.jpg`}
                />
            </Indicator>
        </DraggableItem>
    );
};

const OutfittingDrawer = () => {
    const [openedOutfitting, handleOpenOutfitting] = useDisclosure(false);

    const handleDragStart = (event) => {
        const { active } = event;
        if (active) {
            const { inventoryType, slotIndex } = active.data.current;
            setDraggedItem({ inventoryType, index: slotIndex });
        }
    };
    const handleDragEnd = (event) => {
        const { over, active } = event;
        const isEmpty = over?.data?.current?.isEmpty;

        // If item dropped in an empty slot
        if (over && isEmpty) {
            // Dropped to slot
            const { inventoryType, slotIndex, isEmpty } = over.data.current;
            // The dropeé item
            const {
                inventoryType: prevInventoryType,
                slotIndex: prevSlotIndex,
                itemName,
                itemType,
                label,
                color,
            } = active.data.current;

            const sameSlot = inventoryType === prevInventoryType && slotIndex === prevSlotIndex;

            // If item can be placed there
            if ((itemType === inventoryType || inventoryType === "inventory") && !sameSlot) {
                const updatedInventory = [...outfit[inventoryType]];
                // Target slot
                updatedInventory[slotIndex] = { itemName, itemType, label, color };

                // If moved to the same inventory
                if (prevInventoryType === inventoryType && isEmpty) {
                    // Clear prev slot
                    updatedInventory[prevSlotIndex] = null;
                    // Update target slot
                    setOutfit({ [inventoryType]: updatedInventory });
                } else {
                    const updatedPrevInventory = [...outfit[prevInventoryType]];
                    // Clear prev slot
                    updatedPrevInventory[prevSlotIndex] = null;
                    // Update target slot
                    setOutfit({
                        [prevInventoryType]: updatedPrevInventory,
                        [inventoryType]: updatedInventory,
                    });
                }
                setDraggedItem({ inventoryType: null, index: null });
            }
        }
    };

    const reoutfit = () => {
        const scene = getGame().scene.keys.MainScene;
        const player = scene?.player;
        const activeOutfit = player?.getOutfit();
        if (activeOutfit) {
            player.outfit = outfit; // todo make it verify before accepting changes
            player.reoutfit();
        }
    };
    const [outfit, setOutfit] = useSetState({});

    useDidUpdate(() => {
        reoutfit();
    }, [outfit]);

    const openOutfitting = () => {
        const scene = getGame().scene.keys.MainScene;
        const activeOutfit = scene?.player?.getOutfit();
        if (activeOutfit) {
            handleOpenOutfitting.open();

            setOutfit(activeOutfit);
        }
    };

    const mapInventory = (inventoryType) =>
        outfit?.[inventoryType]?.map((_, index) => mapSlot(inventoryType, index));

    const [draggedItem, setDraggedItem] = useState({ inventoryType: null, index: 0 });

    const mapSlot = (inventoryType, index) => {
        const item = outfit[inventoryType][index];
        // @ts-ignore
        const { itemName, itemType, label, color } = item ?? {
            itemName: null,
            itemType: null,
            label: null,
            color: null,
        };

        const isEmpty = itemName === null;
        return (
            <InventorySlot
                inventoryType={inventoryType}
                slotIndex={index}
                isEmpty={isEmpty}
                // @ts-ignore
                key={`${inventoryType}-${index}`}
            >
                {!isEmpty ? (
                    <InventoryItem
                        inventoryType={inventoryType}
                        slotIndex={index}
                        itemName={itemName}
                        itemType={itemType}
                        label={label}
                        color={color}
                    />
                ) : null}
            </InventorySlot>
        );
    };
    return (
        <>
            <div className="outfitting group">
                <Indicator inline label="New" color="cyan" size={16} withBorder>
                    <Button isSquare={true} onClick={openOutfitting}>
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
                <Divider my="sm" />
                <ScrollArea className="scroller">
                    <DndContext
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        autoScroll={false}
                    >
                        <div className="inventory">
                            {mapInventory("weapons")}
                            {mapInventory("engines")}
                            {mapInventory("inventory")}
                        </div>
                        <DragOverlay>
                            {draggedItem.inventoryType &&
                                mapSlot(draggedItem.inventoryType, draggedItem.index)}
                        </DragOverlay>
                    </DndContext>
                </ScrollArea>
            </Drawer>
        </>
    );
};

export default OutfittingDrawer;
