import React from "react";
import { Indicator } from "@mantine/core";

import { DraggableItem } from "./components";
import { Icon } from "~/ui/scenes/OutfittingDrawer/components";

const indicatorStyle = {
    width: "100%",
    height: "100%",
};

export const InventoryItem = ({ inventoryType, slotIndex, itemName, itemType, label, color }) => {
    const getItemId = () => [inventoryType, slotIndex, itemName, itemType].join("-");

    return (
        <DraggableItem
            data={{ inventoryType, slotIndex, itemName, itemType, label, color }}
            itemId={getItemId()}
        >
            <Indicator
                style={indicatorStyle}
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
