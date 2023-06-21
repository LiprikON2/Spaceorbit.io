import React, { useState } from "react";
import {
    Divider,
    Drawer,
    Indicator,
    ScrollArea,
    ScrollAreaProps,
    Title,
    createPolymorphicComponent,
} from "@mantine/core";
import { useDidUpdate, useDisclosure, useSetState } from "@mantine/hooks";
import { Tool } from "tabler-icons-react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import styled from "@emotion/styled";

import { game } from "~/game";
import { Button } from "~/ui/components/button";
import { InventorySlot } from "./scenes/InventorySlot";
import { InventoryItem } from "./scenes/InventoryItem";
import "./outfittingDrawer.css";

const _StyledScrollArea = styled(ScrollArea)`
    height: 100%;
    width: 100%;
`;
const StyledScrollArea = createPolymorphicComponent<"div", ScrollAreaProps>(_StyledScrollArea);

export const OutfittingDrawer = () => {
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

        const droppedOverEmpty = over && isEmpty;
        if (droppedOverEmpty) {
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
        const player = game.getPlayer();
        const activeOutfit = player?.outfitting.getOutfit();
        if (player && activeOutfit) {
            player.outfitting.reoutfit(outfit);
        }
    };
    const [outfit, setOutfit] = useSetState({});

    useDidUpdate(() => {
        reoutfit();
    }, [outfit]);

    const openOutfitting = () => {
        const player = game.getPlayer();
        const activeOutfit = player?.outfitting.getOutfit();
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
                //@ts-ignore
                key={[inventoryType, index].join("-")}
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
            {/* TODO move button to main */}
            <div className="outfitting group">
                <Indicator inline label="New" color="cyan" size={16} withBorder>
                    <Button isSquare={true} onClick={openOutfitting}>
                        <Tool />
                    </Button>
                </Indicator>
            </div>
            <Drawer
                opened={openedOutfitting}
                onClose={handleOpenOutfitting.close}
                title={<Title order={4}>Outfitting</Title>}
                overlayOpacity={0}
                padding="xl"
                size="lg"
            >
                <Divider my="sm" />
                <StyledScrollArea>
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
                </StyledScrollArea>
            </Drawer>
        </>
    );
};
