import React from "react";
import { Collapse, Group, Loader, Paper, Space, Text, Transition } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Alert } from "@mantine/core";
import { World } from "tabler-icons-react";

const Label = ({ label, statusLabel = "", showLoader = false, children = null }) => {
    return (
        <Alert
            icon={<World size={28} strokeWidth={1.5} color="white" />}
            title={label}
            color="gray"
        >
            <Group>
                {statusLabel && statusLabel}
                {showLoader && <Loader />}
            </Group>
            {children}
        </Alert>
    );
};

export const WithLabel = ({
    label,
    statusLabel,
    showLoader,
    collapsed,
    children = null,
    ...rest
}) => {
    // Prevents jerking on click
    const [slide] = useDebouncedValue(!!children, 200);

    return (
        <Paper p={0} withBorder={false} style={{ overflow: "hidden" }} {...rest}>
            <Label label={label} statusLabel={statusLabel} showLoader={showLoader}>
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
            </Label>
        </Paper>
    );
};
