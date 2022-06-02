import React, { useState } from "react";
import { Avatar, Divider, Drawer, Indicator, ScrollArea, Space, Title } from "@mantine/core";
import { useDisclosure, useId, useListState } from "@mantine/hooks";
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
    const WeaponItem = ({ name = "weapon", id }) => {
        const uuid = useId(id);
        return (
            <DraggableItem id={`${name}-${uuid}`} children={undefined}>
                <Indicator
                    className="item-indicator"
                    inline
                    position="bottom-start"
                    label="Wpn"
                    color="red"
                    size={16}
                    withBorder
                >
                    <Avatar className="item-avatar" size="lg" src="assets/inventory/laser.jpg" />
                </Indicator>
            </DraggableItem>
        );
    };
    const EngineItem = ({ name = "engine", id }) => {
        const uuid = useId(id);

        return (
            <DraggableItem id={`${name}-${uuid}`} children={undefined}>
                <Indicator
                    className="item-indicator"
                    inline
                    position="bottom-start"
                    label="Eng"
                    color="yellow"
                    size={16}
                    withBorder
                >
                    <Avatar className="item-avatar" size="lg" src="assets/inventory/engine.jpg" />
                </Indicator>
            </DraggableItem>
        );
    };

    const slots = {
        engineSlots: { size: 3 },
        weaponSlots: { size: 3 },
        // moduleSlots: { size: 1 },
        inventorySlots: { size: 36 },
    };

    const handleDragEnd = (event) => {
        const { over } = event;

        // If dropped in a slot
        if (over) {
            // The dropee
            const [type, slotKey, index] = event.active.id.split("-");
            // Dropped to
            const [newType, newSlotKey, newIndex] = over.id.split("-");

            // console.log(type, slotKey, index);
            console.log(newType, newSlotKey, newIndex);
            // TODO this
            const toInventory = newSlotKey === slotKey || newSlotKey === "inventorySlot";

            // TODO rerender doesnt happen immideately after ...as always
            if (newType === "empty" && toInventory) {
                if (newSlotKey === "weaponSlots") {
                    //@ts-ignore
                    handleWeapons.setItem(newIndex, type);
                } else if (newSlotKey === "engineSlots") {
                    //@ts-ignore
                    handleEngines.setItem(newIndex, type);
                } else if (newSlotKey === "inventorySlots") {
                    //@ts-ignore
                    handleInventory.setItem(newIndex, type);
                }

                if (slotKey === "weaponSlots") {
                    //@ts-ignore
                    handleWeapons.setItem(index, null);
                } else if (slotKey === "engineSlots") {
                    //@ts-ignore
                    handleEngines.setItem(index, null);
                } else if (slotKey === "inventorySlots") {
                    //@ts-ignore
                    handleInventory.setItem(index, null);
                }
                reoutfit();
            }
        }
    };

    const reoutfit = () => {
        const scene = getGame().scene.keys.MainScene;
        const player = scene?.player;
        const outfit = player?.getOutfit();
        if (outfit) {
            const newOutfit = {
                weapons,
                engines,
                inventory,
                multipliers,
            };
            player.outfit = newOutfit; // todo make it verify before accepting changes
            player.reoutfit();
        }
    };
    const [weapons, handleWeapons] = useListState([]);
    const [engines, handleEngines] = useListState([]);
    const [inventory, handleInventory] = useListState([]);
    const [multipliers, handleMultipliers] = useListState([]);

    const openOutfitting = () => {
        const scene = getGame().scene.keys.MainScene;
        const outfit = scene?.player?.getOutfit();
        if (outfit) {
            handleOpenOutfitting.open();
            handleWeapons.setState(() => outfit.weapons);
            handleEngines.setState(() => outfit.engines);
            handleInventory.setState(() => outfit.inventory);
            handleMultipliers.setState(() => outfit.multipliers);

            console.log("outfit", outfit);
        }
    };
    const getItem = (type, slotId) => {
        if (type === "laser" || type === "gatling") {
            return <WeaponItem name={type} id={slotId} />;
        } else if (type === "engine") {
            return <EngineItem name={type} id={slotId} />;
        }
    };

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
                        {Object.entries(slots).map(([slotKey, value]) => {
                            let subSlots: any = [];
                            for (let i = 0; i < value.size; i++) {
                                const slotId = `${slotKey}-${i}`;

                                let type;
                                if (slotKey === "weaponSlots") {
                                    if (weapons?.[i]) {
                                        type = weapons[i];
                                    }
                                } else if (slotKey === "engineSlots") {
                                    if (engines?.[i]) {
                                        type = engines[i];
                                    }
                                } else if (slotKey === "inventorySlots") {
                                    if (inventory?.[i]) {
                                        type = inventory[i];
                                    }
                                }

                                let item;
                                if (type) {
                                    item = getItem(type, slotId);
                                } else {
                                    type = "empty";
                                }

                                const subSlot = (
                                    <DroppableInventory
                                        key={`${type}-${slotId}`}
                                        id={`${type}-${slotId}`}
                                        children={undefined}
                                    >
                                        {item ?? `(${type}-${slotId})`}
                                    </DroppableInventory>
                                );

                                subSlots.push(subSlot);
                            }

                            return <React.Fragment key={slotKey}>{subSlots}</React.Fragment>;
                        })}
                    </div>
                </ScrollArea>
            </Drawer>
        </DndContext>
    );
};

export default OutfittingDrawer;
