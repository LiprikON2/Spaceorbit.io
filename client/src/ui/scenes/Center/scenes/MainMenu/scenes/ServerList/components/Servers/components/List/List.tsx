import React from "react";
import { Group, ScrollArea, Space, Stack, Title, rem } from "@mantine/core";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { Item } from "./components";

const List = ({
    title = null,
    icon = null,
    placeholder = null,
    bottom = null,
    right = null,
    itemHeight = 28,
    children = null,
    ...rest
}) => {
    const [listRef] = useAutoAnimate();
    const [itemsRef] = useAutoAnimate();

    return (
        <Stack spacing="sm" style={{ padding: 0 }} ref={listRef} {...rest}>
            <Group>
                {icon}
                <Title order={2} size="md" weight={400}>
                    {title}
                </Title>
                <Space style={{ flexGrow: 1 }} />
                {right && right}
            </Group>

            {!children.length && placeholder}
            {/* TODO during animation scrollbars are flickering */}
            {/* <ScrollArea display={children.length ? "block" : "none"} mah={rem(150)}> */}
            <Stack
                ref={itemsRef}
                py={2}
                display={children.length ? "flex" : "none"}
                style={{ overflow: "hidden hidden" }}
                mah={rem(138)}
                sx={(theme) => ({ gap: `calc(${theme.spacing.xs} / 1.5)` })}
            >
                {children}
            </Stack>
            {/* </ScrollArea> */}
            {bottom && bottom}
        </Stack>
    );
};

List.Item = Item;

export { List };
