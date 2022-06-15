import React from "react";
import { useDraggable } from "@dnd-kit/core";

const DraggableItem = ({ children = undefined, fixInPlace = false, data, id, ...rest }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: fixInPlace ? id + "-fixed" : id,
        data,
    });
    const style = transform
        ? {
              filter: "brightness(50%)",
          }
        : undefined;
    // const style =
    //     transform && !fixInPlace
    //         ? {
    //               position: "relative",
    //               transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    //               zIndex: 1,
    //           }
    //         : {
    //               position: "relative",
    //               zIndex: "auto",
    //           };

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
