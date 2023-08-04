import React from "react";
import { Collapse, Paper, Text, Transition } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";

export const WithLabel = ({ label, collapsed, children = null, ...rest }) => {
    // Prevents jerking on click
    const [slide] = useDebouncedValue(!!children, 200);

    return (
        <Paper p="xs" {...rest} style={{ overflow: "hidden" }}>
            <Text display="flex" px="0.2rem">
                {label}
            </Text>

            <Collapse in={!collapsed && children}>
                <Transition
                    mounted={slide || children}
                    transition="slide-right"
                    duration={400}
                    timingFunction="ease"
                >
                    {(styles) => <div style={styles}>{children}</div>}
                </Transition>
            </Collapse>
        </Paper>
    );
};
