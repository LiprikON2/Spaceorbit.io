import React from "react";
import { Collapse, Group, Space, Stack, Title } from "@mantine/core";

import { Item } from "./components";

const List = ({
    title = null,
    visible = true,
    icon = null,
    placeholder = null,
    bottom = null,
    right = null,
    itemHeight = 28,
    children = null,
    ...rest
}) => {
    const uncollapse = children.length && visible;

    return (
        <Stack
            spacing="sm"
            style={{ padding: 0, minHeight: `calc(${itemHeight}px + 2.5rem)` }}
            {...rest}
        >
            <Group>
                {icon}
                <Title order={2} size="md" weight={400}>
                    {title}
                </Title>
                <Space style={{ flexGrow: 1 }} />
                {right && right}
            </Group>

            {!children.length && placeholder}
            <Collapse
                display={children.length ? "block" : "none"}
                transitionDuration={200}
                in={uncollapse}
            >
                <Stack sx={(theme) => ({ gap: `calc(${theme.spacing.xs} / 1.5)` })}>
                    {children}
                </Stack>
            </Collapse>
            {bottom && bottom}
        </Stack>
    );
};

List.Item = Item;

export { List };
