import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { useId } from "@mantine/hooks";

const DraggableItem = ({ children = undefined, data, id = undefined, ...rest }) => {
    const uuid = useId(id);

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: uuid,
        data,
    });
    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
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
