import React from "react";
import { useDroppable } from "@dnd-kit/core";
import styled from "@emotion/styled";

interface StyledDroppableSlotProps {
    readonly $isOver?: boolean;
}

// TODO Use 'CanDropHere' to color slots red
// console.log("over", over?.data?.current?.inventoryType, "vs", data?.inventoryType);
// background-color: ${(props) => props.canDropHere && "red"};
const StyledDroppableSlot = styled.div<StyledDroppableSlotProps>`
    font-size: 0.8rem;
    padding: 0.25rem;
    width: 4rem;
    height: 4rem;

    border-radius: 6px;
    background: hsl(225, 7%, 13%);
    box-shadow: 5px 5px 13px #0e0e10, -5px -5px 13px #26282c;

    filter: ${({ $isOver }) => $isOver && "brightness(80%)"};
`;

export const DroppableSlot = ({
    data,
    slotId,
    ...rest
}: {
    data?: any;
    slotId: string;
    children?: React.ReactNode;
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: slotId,
        data,
    });

    return <StyledDroppableSlot ref={setNodeRef} $isOver={isOver} {...rest} />;
};
