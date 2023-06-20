import React from "react";
import { Avatar, Indicator } from "@mantine/core";

import { DraggableItem } from "./components";

export const InventoryItem = ({ inventoryType, slotIndex, itemName, itemType, label, color }) => {
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
