import React from "react";
import { useDraggable } from "@dnd-kit/core";
import styled from "@emotion/styled";

interface StyledDraggableItemProps {
    readonly $dimmed?: boolean;
}

const StyledDraggableItem = styled.div<StyledDraggableItemProps>(({ $dimmed }) => ({
    filter: $dimmed && "brightness(50%)",
    width: "4rem",
    height: "4rem",
    cursor: "pointer",
}));

export const DraggableItem = ({ data, itemId, ...rest }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: itemId,
        data,
    });

    return (
        <StyledDraggableItem
            ref={setNodeRef}
            $dimmed={!!transform}
            {...listeners}
            {...attributes}
            {...rest}
        />
    );
};
