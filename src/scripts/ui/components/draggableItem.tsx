import React from "react";
import { useDraggable } from "@dnd-kit/core";

const DraggableItem = ({ children = undefined, data, id, ...rest }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
        data,
    });
    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              zIndex: 10,
          }
        : {
              position: "relative",
              zIndex: 10,
          };

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
