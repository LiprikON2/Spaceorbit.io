import React, { useState } from "react";
import {
    Divider,
    Drawer,
    ScrollArea,
    ScrollAreaProps,
    Title,
    createPolymorphicComponent,
} from "@mantine/core";
import { useDidUpdate, useSetState } from "@mantine/hooks";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import styled from "@emotion/styled";

import { game } from "~/game";
import { InventorySection } from "./scenes/InventorySection";
import { ItemSlot } from "./scenes/InventorySection/Scenes/ItemSlot";

const _StyledScrollArea = styled(ScrollArea)`
    height: 100%;
    width: 100%;
`;
const StyledScrollArea = createPolymorphicComponent<"div", ScrollAreaProps>(_StyledScrollArea);

export const OutfittingDrawer = ({ shouldBeOpened, close }) => {
    const [didLoad, setDidLoad] = useState(false);

    useDidUpdate(() => {
        if (!didLoad) {
            const player = game.getPlayer();
            const activeOutfit = player?.outfitting.getOutfit();
            if (activeOutfit) {
                setDidLoad(() => true);
                setOutfit(activeOutfit);
            }
        }
    }, [shouldBeOpened]);

    const handleDragStart = (event) => {
        const { active } = event;
        if (active) {
            const { inventoryType, slotIndex } = active.data.current;
            setDraggedItem({ inventoryType, slotIndex });
        }
    };

    const handleDragEnd = (event) => {
        const { over, active } = event;
        const isEmpty = over?.data?.current?.isEmpty;

        const didDropOverEmpty = over && isEmpty;
        if (didDropOverEmpty) {
            // Dropped to slot
            const { inventoryType, slotIndex } = over.data.current;

            // The dropeé item
            const {
                inventoryType: prevInvType,
                slotIndex: prevSlotIndex,
                itemName,
                itemType,
                label,
                color,
            } = active.data.current;

            const isNotSameSlot = inventoryType !== prevInvType || slotIndex !== prevSlotIndex;
            const areInvTypesCompatible =
                inventoryType === itemType || inventoryType === "inventory";

            const canBePlacedHere = areInvTypesCompatible && isNotSameSlot;
            if (canBePlacedHere) {
                const updatedInventory = [...outfit[inventoryType]];
                // Target slot
                updatedInventory[slotIndex] = { itemName, itemType, label, color };

                const didInvTypeChange = prevInvType !== inventoryType;
                if (didInvTypeChange) {
                    const updatedPrevInventory = [...outfit[prevInvType]];
                    // Clear prev slot
                    updatedPrevInventory[prevSlotIndex] = null;
                    // Update target slot
                    setOutfit({
                        [prevInvType]: updatedPrevInventory,
                        [inventoryType]: updatedInventory,
                    });
                } else {
                    // Clear prev slot
                    updatedInventory[prevSlotIndex] = null;
                    // Update target slot
                    setOutfit({ [inventoryType]: updatedInventory });
                }
                setDraggedItem({ inventoryType: null, slotIndex: null });
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

    const [draggedItem, setDraggedItem] = useState({ inventoryType: null, slotIndex: null });

    return (
        <Drawer
            opened={shouldBeOpened && didLoad}
            onClose={close}
            title={<Title order={2}>Outfitting</Title>}
            overlayProps={{ opacity: 0 }}
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
                    {outfit && (
                        <>
                            <InventorySection title="Weapons" type="weapons" outfit={outfit} />
                            <InventorySection title="Engines" type="engines" outfit={outfit} />
                            <InventorySection title="Inventory" type="inventory" outfit={outfit} />
                        </>
                    )}
                    <DragOverlay>
                        {draggedItem.inventoryType && draggedItem.slotIndex && (
                            <ItemSlot
                                item={outfit[draggedItem.inventoryType][draggedItem.slotIndex]}
                                index={draggedItem.slotIndex}
                                inventoryType={draggedItem.inventoryType}
                            />
                        )}
                    </DragOverlay>
                </DndContext>
            </StyledScrollArea>
        </Drawer>
    );
};
