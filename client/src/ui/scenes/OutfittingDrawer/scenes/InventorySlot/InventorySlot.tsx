import React from "react";
import { Avatar } from "@mantine/core";

import { DroppableSlot } from "./components";

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

    const getSlotId = () => [inventoryType, slotIndex].join("-");

    return (
        <DroppableSlot data={{ inventoryType, slotIndex, isEmpty }} slotId={getSlotId()}>
            {children ?? (
                <Avatar src={null} className="item-avatar" size="lg" color={getColor()}>
                    {getLabel()}
                </Avatar>
            )}
        </DroppableSlot>
    );
};
