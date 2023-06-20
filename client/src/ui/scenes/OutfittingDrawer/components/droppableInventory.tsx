import React from "react";
import { useDroppable } from "@dnd-kit/core";

// TODO rename file
export const DroppableInventory = ({
    data,
    id,
    children = undefined,
    ...rest
}: {
    data?: Object;
    id: any;
    children?: any;
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
        data,
    });
    const style = {
        color: isOver ? "green" : undefined,
        filter: isOver ? "brightness(80%)" : undefined,
    };

    return (
        <div className="inventory-slot" ref={setNodeRef} style={style} {...rest}>
            {children}
        </div>
    );
};
