import React, { FC } from "react";
import { useDraggable } from "@dnd-kit/core";
import styled from "@emotion/styled";

import { excludeProps } from "~/ui/services/excludeProps";

// TODO fix flickering on grabbing and letting go ("snapshots"?)
const StyledDraggableItem = styled("div", {
    shouldForwardProp: excludeProps(["transform"]),
})((props) => ({
    filter: props.transform && "brightness(50%)",
    width: "4rem",
    height: "4rem",
    cursor: "pointer",
})) as FC;

export const DraggableItem = ({ data, id, ...rest }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data,
    });

    return (
        <StyledDraggableItem
            ref={setNodeRef}
            transform={transform}
            {...listeners}
            {...attributes}
            {...rest}
        />
    );
};
