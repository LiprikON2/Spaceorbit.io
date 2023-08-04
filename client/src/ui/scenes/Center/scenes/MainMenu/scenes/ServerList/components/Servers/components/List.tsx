import React from "react";
import { Center, Group, Stack, Title, Transition } from "@mantine/core";

export const List = ({ title = null, icon = null, chilren = null }) => {
    return (
        <Stack>
            <Group>
                {icon}
                <Title order={4}>{title}</Title>
            </Group>
            <Stack>{chilren}</Stack>
        </Stack>
    );
};

const Item = ({ icon = null, children = null }) => {
    return (
        <Transition
            mounted={children}
            transition="slide-right"
            duration={400}
            timingFunction="ease"
        >
            {(styles) => (
                <Group style={styles}>
                    {icon}
                    {children}
                </Group>
            )}
        </Transition>
    );
};

List.Item = Item;
