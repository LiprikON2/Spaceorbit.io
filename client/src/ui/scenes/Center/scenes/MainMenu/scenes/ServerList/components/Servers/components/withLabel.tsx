import React from "react";
import { Paper, Text } from "@mantine/core";

export const withLabel = (label, inline = false) => {
    const Labeled = ({ children }) => {
        if (!inline) {
            return (
                <Paper p="xs">
                    <Text display="flex">{label}</Text>
                    {/* <Stack p="xs" sx={(theme) => ({ gap: `calc(${theme.spacing.xs} / 1.5)` })}> */}
                    {children}
                    {/* </Stack> */}
                </Paper>
            );
        } else {
            return (
                <Paper p="xs">
                    <Text display="flex">
                        {label} ― {children}
                    </Text>
                </Paper>
            );
        }
    };

    return Labeled;
};
