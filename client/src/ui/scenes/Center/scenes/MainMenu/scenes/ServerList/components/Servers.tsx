import React from "react";
import { Chip, Indicator, List, Paper, Stack, Text, ThemeIcon } from "@mantine/core";

const withLabel = (label, inline = false) => {
    const Labeled = ({ children }) => {
        if (!inline) {
            return (
                <Paper p="xs">
                    <Text>{label}</Text>
                    {/* <Stack p="xs" sx={(theme) => ({ gap: `calc(${theme.spacing.xs} / 1.5)` })}> */}
                    {children}
                    {/* </Stack> */}
                </Paper>
            );
        } else {
            return (
                <Paper p="xs">
                    <Text>
                        {label} ― {children}
                    </Text>
                </Paper>
            );
        }
    };

    return Labeled;
};

export const Servers = ({
    label,
    servers,
    status,
}: {
    label: string;
    servers: string[];
    status: "error" | "success" | "loading";
}) => {
    const WithLabel = withLabel(label);
    const WithLabelInline = withLabel(label, true);

    if (status === "loading") {
        return <WithLabelInline>Reaching...</WithLabelInline>;
    }
    if (status === "error") {
        return <WithLabelInline>Failed to reach the servers</WithLabelInline>;
    }
    if (status === "success") {
        if (servers.length) {
            return (
                <WithLabel>
                    <List
                        p="xs"
                        spacing="0.415rem"
                        icon={
                            <ThemeIcon color="teal" size={24} radius="xl">
                                {/* <IconCircleCheck size="1rem" /> */}
                            </ThemeIcon>
                        }
                        withPadding
                        // sx={(theme) => ({ gap: `calc(${theme.spacing.xs} / 1.5)` })}
                    >
                        {servers.map((server) => (
                            <List.Item key={server}>
                                <Chip value={server} color="cyan" size="md">
                                    {server}
                                </Chip>
                            </List.Item>
                        ))}
                    </List>
                </WithLabel>
            );
        } else {
            return <WithLabelInline>No official servers were found</WithLabelInline>;
        }
    }
};
