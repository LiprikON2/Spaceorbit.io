import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useId } from "@mantine/hooks";

const DroppableInventory = ({ data, id = undefined, children = undefined, ...rest }) => {
    const uuid = useId(id);

    const { isOver, setNodeRef } = useDroppable({
        id: uuid,
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

export default DroppableInventory;
