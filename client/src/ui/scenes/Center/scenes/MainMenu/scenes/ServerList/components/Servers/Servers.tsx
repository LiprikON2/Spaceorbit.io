import React from "react";
import { Chip, List, Loader, Space, ThemeIcon } from "@mantine/core";
import type { QueryStatus } from "@tanstack/react-query";

import { ServersState } from "../../hooks/useOfficialServers";
import { useDebounceEmptySuccess } from "./hooks/useDebounceEmptySuccess";
import { WithLabel } from "./components";

const getLabel = (label, status, isPopulating, isEmpty) => {
    if (status === "loading" || isPopulating) {
        return (
            <>
                {`${label} ― Reaching`}
                <Space w="xs" />
                <Loader />
            </>
        );
    } else if (status === "error") {
        return <>{`${label} ― Failed to reach the servers`}</>;
    } else if (isEmpty) {
        return <>{`${label} ― No servers were found!`}</>;
    } else if (status === "success") {
        return <>{label}</>;
    }
};

export const Servers = ({
    label,
    servers,
    status,
    collapsed,
}: {
    label: string;
    servers: ServersState;
    status: QueryStatus;
    collapsed: boolean;
}) => {
    const [isPopulating] = useDebounceEmptySuccess(status, Object.keys(servers));
    const isEmpty = !(status === "success" && Object.keys(servers).length);

    if (status === "error" || status === "loading" || isPopulating || isEmpty) {
        return (
            <WithLabel
                label={getLabel(label, status, isPopulating, isEmpty)}
                collapsed={collapsed}
            />
        );
    } else {
        return (
            <WithLabel label={getLabel(label, status, isPopulating, isEmpty)} collapsed={collapsed}>
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
                                <ThemeIcon color={online ? "teal" : "red"} size={32} radius="xl">
                                    {online
                                        ? ping ?? <Loader variant="oval" color="white" size="sm" />
                                        : ""}
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
    }
};
