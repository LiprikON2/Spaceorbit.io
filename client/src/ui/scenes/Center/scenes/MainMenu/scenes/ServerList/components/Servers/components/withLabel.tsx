import React from "react";
import { Collapse, Paper, Text, Transition } from "@mantine/core";

export const WithLabel = ({ label, collapsed, children = null, ...rest }) => {
    return (
        <Paper p="xs" {...rest} style={{ overflow: "hidden" }}>
            <Text display="flex" px="0.2rem">
                {label}
            </Text>
            <Collapse in={!collapsed && children}>
                <Transition
                    mounted={children}
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
