import React, { FC, useState, useEffect } from "react";
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
import { InventoryItem, InventorySlot, ItemSlot } from "./scenes/InventorySection/Scenes/ItemSlot";

const _StyledScrollArea = styled(ScrollArea)`
    height: 100%;
    width: 100%;
`;
const StyledScrollArea = createPolymorphicComponent<"div", ScrollAreaProps>(_StyledScrollArea);

// const StyledInventory = styled.div`
//     display: grid;
//     grid-template-columns: repeat(auto-fit, 5rem);
//     justify-content: center;
//     gap: 1rem;

//     margin-block: 2rem;
//     margin-inline: 1rem;
//     user-select: none;
// ` as FC;

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
            // TODO remove inventoryType and slotIndex
            setDraggedItem({ inventoryType, slotIndex, data: active.data.current });
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

    // const mapInventory = (inventoryType) =>
    //     outfit?.[inventoryType]?.map((_, index) => mapSlot(inventoryType, index));

    const [draggedItem, setDraggedItem] = useState({ inventoryType: null, slotIndex: 0 });

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

    console.log("draggedItem", draggedItem);
    return (
        <Drawer
            opened={shouldBeOpened && didLoad}
            onClose={close}
            title={<Title order={2}>Outfitting</Title>}
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
                    {outfit && (
                        <>
                            <InventorySection title="Weapons" type="weapons" outfit={outfit} />
                            <InventorySection title="Engines" type="engines" outfit={outfit} />
                            <InventorySection title="Inventory" type="inventory" outfit={outfit} />
                        </>
                    )}
                    {/* <StyledInventory>
                        {mapInventory("weapons")}
                        {mapInventory("engines")}
                        {mapInventory("inventory")}
                    </StyledInventory> */}

                    <DragOverlay>
                        {/* {draggedItem.inventoryType &&
                            mapSlot(draggedItem.inventoryType, draggedItem.slotIndex)} */}
                        {draggedItem.inventoryType && (
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
