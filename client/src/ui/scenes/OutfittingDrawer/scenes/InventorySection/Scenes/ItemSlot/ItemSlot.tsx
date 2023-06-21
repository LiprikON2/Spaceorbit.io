import React from "react";

import { InventorySlot, InventoryItem } from "./components";

const emptyItem = {
    itemName: null,
    itemType: null,
    label: null,
    color: null,
};

export const ItemSlot = ({ item = null, index, inventoryType, ...rest }) => {
    const { itemName, itemType, label, color } = item ?? emptyItem;

    const isEmpty = itemName === null;
    return (
        <InventorySlot inventoryType={inventoryType} slotIndex={index} isEmpty={isEmpty}>
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
