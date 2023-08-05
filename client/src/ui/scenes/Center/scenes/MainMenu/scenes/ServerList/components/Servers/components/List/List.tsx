import React from "react";
import { Collapse, Group, Loader, Space, Stack, Title } from "@mantine/core";

import { Item } from "./components";

const List = ({
    title = null,
    visible = true,
    icon = null,
    placeholder = null,
    showLoader = false,
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
                {showLoader && <Loader size={itemHeight} variant="oval" />}
            </Group>

            {!children.length && placeholder}
            <Collapse transitionDuration={300} in={uncollapse}>
                <Stack sx={(theme) => ({ gap: `calc(${theme.spacing.xs} / 1.5)` })}>
                    {children}
                </Stack>
            </Collapse>
        </Stack>
    );
};

List.Item = Item;

export { List };
