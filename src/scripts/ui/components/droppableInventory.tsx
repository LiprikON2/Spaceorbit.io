import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DroppableInventory = ({ children, id, ...rest }) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });
    const style = {
        color: isOver ? "green" : undefined,
    };

    return (
        <div className="inventory-slot" ref={setNodeRef} style={style} {...rest}>
            {children}
        </div>
    );
};

export default DroppableInventory;
