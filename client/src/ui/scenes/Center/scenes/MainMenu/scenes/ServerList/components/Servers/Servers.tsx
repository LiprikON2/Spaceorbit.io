import React from "react";
import { Chip, List, Loader, Space, ThemeIcon } from "@mantine/core";

import { ServersState } from "../../hooks/useOfficialServers";
import { useDebounceEmptySuccess } from "./hooks/useDebounceEmptySuccess";
import { withLabel } from "./components";

export const Servers = ({
    label,
    servers,
    status,
}: {
    label: string;
    servers: ServersState;
    status: "error" | "success" | "loading" | "populating";
}) => {
    const WithLabel = withLabel(label);
    const WithLabelInline = withLabel(label, true);

    const [isPopulating] = useDebounceEmptySuccess(status, Object.keys(servers));

    if (status === "loading" || isPopulating) {
        return (
            <WithLabelInline>
                Reaching
                <Space w="xs" />
                <Loader />
            </WithLabelInline>
        );
    }
    if (status === "error") {
        return <WithLabelInline>Failed to reach the servers</WithLabelInline>;
    }
    if (status === "success") {
        if (Object.keys(servers).length) {
            return (
                <WithLabel>
                    <List
                        p="xs"
                        center
                        styles={(theme) => ({
                            item: {
                                "&:not(:first-of-type)": {
                                    marginTop: `calc(${theme.spacing.xs} / 1.5)`,
                                },
                            },
                            itemIcon: {
                                marginRight: `calc(${theme.spacing.xs} / 1.5)`,
                                height: "32px",
                            },
                        })}
                        withPadding
                    >
                        {Object.entries(servers).map(([serverKey, { ping, online }]) => (
                            <List.Item
                                key={serverKey}
                                icon={
                                    <ThemeIcon
                                        color={online ? "teal" : "red"}
                                        size={32}
                                        radius="xl"
                                    >
                                        {online ? ping : ""}
                                    </ThemeIcon>
                                }
                            >
                                <Chip value={serverKey} color="cyan" size="md">
                                    {serverKey}
                                </Chip>
                            </List.Item>
                        ))}
                    </List>
                </WithLabel>
            );
        } else {
            return <WithLabelInline>No official servers were found!</WithLabelInline>;
        }
    }
};
