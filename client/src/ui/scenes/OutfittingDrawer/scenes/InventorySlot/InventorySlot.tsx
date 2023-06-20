import React from "react";
import { Avatar } from "@mantine/core";

import { DroppableInventory } from "./components";

export const InventorySlot = ({ inventoryType, slotIndex, isEmpty, children = undefined }) => {
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
