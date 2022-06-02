import React, { useState } from "react";
import { Avatar, Divider, Drawer, Indicator, ScrollArea, Space, Title } from "@mantine/core";
import { useDisclosure, useId, useListState, useSetState } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";
import { useDroppable, useDraggable, DndContext } from "@dnd-kit/core";

import Button from "./components/button";
import DraggableItem from "./components/draggableItem";
import DroppableInventory from "./components/droppableInventory";

import "./outfittingDrawer.css";
import { getGame } from "../game";

const OutfittingDrawer = () => {
    const [openedOutfitting, handleOpenOutfitting] = useDisclosure(false);

    // TODO fix image flickering onDrop (react rerender)
    // TODO fix z-index mess
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

        return (
            <DroppableInventory data={{ inventoryType, slotIndex, isEmpty }}>
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
            <DraggableItem data={{ inventoryType, slotIndex, itemName, itemType, label, color }}>
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

    const handleDragEnd = (event) => {
        const { over, active } = event;

        // If item dropped in an empty slot
        if (over && over?.data?.current?.isEmpty) {
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

                // If moved inside the same inventory
                if (prevInventoryType === inventoryType) {
                    // Prev slot
                    updatedInventory[prevSlotIndex] = {
                        itemName: null,
                        itemType: null,
                        label: null,
                        color: null,
                    };
                    setOutfit({ [inventoryType]: updatedInventory });
                } else {
                    const updatedPrevInventory = [...outfit[prevInventoryType]];
                    // Prev slot
                    updatedPrevInventory[prevSlotIndex] = {
                        itemName: null,
                        itemType: null,
                        label: null,
                        color: null,
                    };
                    setOutfit({
                        [prevInventoryType]: updatedPrevInventory,
                        [inventoryType]: updatedInventory,
                    });
                }
                reoutfit();
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

    const openOutfitting = () => {
        const scene = getGame().scene.keys.MainScene;
        const activeOutfit = scene?.player?.getOutfit();
        if (activeOutfit) {
            handleOpenOutfitting.open();

            setOutfit(activeOutfit);
            console.log("outfit", activeOutfit);
        }
    };

    const mapInventory = (inventoryType) =>
        outfit?.[inventoryType]?.map((item, index) => {
            let slots: any = [];
            // @ts-ignore
            const { itemName, itemType, label, color } = item ?? {
                itemName: null,
                itemType: null,
                label: null,
                color: null,
            };

            const isEmpty = itemName === null;
            const slot = (
                <InventorySlot
                    inventoryType={inventoryType}
                    slotIndex={index}
                    isEmpty={isEmpty}
                    // @ts-ignore
                    key={`${inventoryType}-${index}}`}
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
            slots.push(slot);

            return <React.Fragment key={`${inventoryType}-${index}`}>{slots}</React.Fragment>;
        });

    return (
        <DndContext onDragEnd={handleDragEnd} autoScroll={false}>
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
                    <div className="inventory">
                        {mapInventory("weapons")}
                        {mapInventory("engines")}
                        {mapInventory("inventory")}
                    </div>
                </ScrollArea>
            </Drawer>
        </DndContext>
    );
};

export default OutfittingDrawer;
