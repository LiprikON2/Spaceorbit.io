import React from "react";
import { useDraggable } from "@dnd-kit/core";
import styled from "@emotion/styled";

// TODO fix flickering on grabbing and letting go ("snapshots"?)
const StyledDraggableItem = styled.div(({ $transform }: any) => ({
    filter: $transform && "brightness(50%)",
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
            $transform={transform}
            {...listeners}
            {...attributes}
            {...rest}
        />
    );
};
