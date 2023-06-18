import React from "react";
import { useDraggable } from "@dnd-kit/core";

const DraggableItem = ({ children = undefined, data, id, ...rest }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data,
    });
    const style = transform
        ? {
              filter: "brightness(50%)",
          }
        : undefined;

    return (
        <div
            className="inventory-item"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            {...rest}
        >
            {children}
        </div>
    );
};
export default DraggableItem;
