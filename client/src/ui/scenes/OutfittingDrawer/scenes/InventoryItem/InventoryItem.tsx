import React from "react";
import { Indicator } from "@mantine/core";

import { DraggableItem } from "./components";
import { Icon } from "../../components";

export const InventoryItem = ({ inventoryType, slotIndex, itemName, itemType, label, color }) => {
    const getItemId = () => [inventoryType, slotIndex, itemName, itemType].join("-");

    return (
        <DraggableItem
            data={{ inventoryType, slotIndex, itemName, itemType, label, color }}
            itemId={getItemId()}
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
                <Icon itemName={itemName} />
            </Indicator>
        </DraggableItem>
    );
};
