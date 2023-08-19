import React from "react";

import { ScrollArea as MantineScrollArea, type ScrollAreaProps } from "@mantine/core";

export const ScrollArea = React.forwardRef(
    (props: ScrollAreaProps, ref: React.ForwardedRef<HTMLDivElement>) => (
        <MantineScrollArea
            viewportRef={ref}
            type="always"
            offsetScrollbars
            styles={{ scrollbar: { top: "5rem !important" } }}
            {...props}
        />
    )
);
