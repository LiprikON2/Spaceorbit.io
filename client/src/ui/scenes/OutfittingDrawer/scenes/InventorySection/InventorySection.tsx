import React, { FC } from "react";
import { Title } from "@mantine/core";
import styled from "@emotion/styled";

import { ItemSlot } from "./Scenes/ItemSlot";

const StyledInventory = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, 5rem);
    justify-content: center;
    gap: 1rem;

    margin-block: 2rem;
    margin-inline: 1rem;
    user-select: none;
` as FC;

export const InventorySection = ({ title, type, outfit }) => {
    const items = outfit[type];

    return (
        <>
            <Title order={3}>{title}</Title>
            <StyledInventory>
                {items.map((item, index) => (
                    <ItemSlot
                        key={[type, index].join("-")}
                        item={item}
                        index={index}
                        inventoryType={type}
                    />
                ))}
            </StyledInventory>
        </>
    );
};
