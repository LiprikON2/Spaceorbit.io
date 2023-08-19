import React, { useState } from "react";
import { Drawer, Title } from "@mantine/core";
import { useDidUpdate, useSetState } from "@mantine/hooks";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import { InventorySection } from "./scenes/InventorySection";
import { InventoryItem } from "./scenes/InventorySection/scenes/ItemSlot/components/InventoryItem";
import { useGame } from "~/ui/hooks";
import type { Item, Outfit } from "~/game/objects/Sprite/Spaceship/components/Outfitting";
import { ScrollArea } from "./components";

export const OutfittingDrawer = ({ shouldBeOpened, close }) => {
    const [didLoad, setDidLoad] = useState(false);
    const {
        computed: { player },
    } = useGame();

    useDidUpdate(() => {
        if (!didLoad) {
            // TODO: to not mutate state
            const activeOutfit = player.outfitting.outfit;
            if (activeOutfit) {
                setDidLoad(() => true);
                setOutfit(activeOutfit);
            }
        }
    }, [shouldBeOpened]);

    const startDragging = (event) => {
        const { active } = event;
        if (active) {
            const currentDraggedItem = active.data.current;
            setDraggedItem(currentDraggedItem);
        }
    };

    const stopDragging = (event) => {
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
                const updatedInventory: Item[] = [...outfit[inventoryType]];
                // Target slot
                updatedInventory[slotIndex] = { itemName, itemType, label, color };

                const didInvTypeChange = prevInvType !== inventoryType;
                if (didInvTypeChange) {
                    const updatedPrevInventory: Item[] = [...outfit[prevInvType]];
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
                const currentDraggedItem = active.data.current;
                setDraggedItem(currentDraggedItem);
            }
        }
    };

    const reoutfit = () => {
        const activeOutfit = player?.outfitting.outfit;
        if (activeOutfit) {
            player.outfitting.setOutfit(outfit);
        }
    };
    const [outfit, setOutfit] = useSetState<Outfit>({ weapons: [], engines: [], inventory: [] });

    useDidUpdate(() => {
        reoutfit();
    }, [outfit]);

    const [draggedItem, setDraggedItem] = useState<any>(null);

    return (
        <Drawer.Root
            opened={shouldBeOpened && didLoad}
            onClose={close}
            size="md"
            scrollAreaComponent={ScrollArea}
        >
            <Drawer.Overlay />
            <Drawer.Content style={{ overflow: "hidden" }} p="xl" pt={0} pr={0}>
                <Drawer.Header pt="2.25rem" mr="xl">
                    <Title order={2}>Outfitting</Title>
                    <Drawer.CloseButton />
                </Drawer.Header>
                <Drawer.Body mr="xl">
                    <DndContext
                        onDragStart={startDragging}
                        onDragEnd={stopDragging}
                        autoScroll={false}
                    >
                        {outfit && (
                            <>
                                <InventorySection title="Weapons" type="weapons" outfit={outfit} />
                                <InventorySection title="Engines" type="engines" outfit={outfit} />
                                <InventorySection
                                    title="Inventory"
                                    type="inventory"
                                    outfit={outfit}
                                />
                            </>
                        )}
                        <DragOverlay>
                            {draggedItem && (
                                <InventoryItem
                                    inventoryType={draggedItem.inventoryType}
                                    slotIndex={draggedItem.slotIndex}
                                    itemName={draggedItem.itemName}
                                    itemType={draggedItem.itemType}
                                    label={draggedItem.label}
                                    color={draggedItem.color}
                                />
                            )}
                        </DragOverlay>
                    </DndContext>
                </Drawer.Body>
            </Drawer.Content>
        </Drawer.Root>
    );
};
