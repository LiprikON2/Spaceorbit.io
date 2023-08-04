import React from "react";
import { Alert, Center, Chip, List as MantineList, Loader, Space, ThemeIcon } from "@mantine/core";
import type { QueryStatus } from "@tanstack/react-query";

import { ServersState } from "../../hooks/useOfficialServers";
import { useDebounceEmptySuccess } from "./hooks/useDebounceEmptySuccess";
import { WithLabel } from "./components";

const getStatusLabel = (status, isPopulating, isEmpty) => {
    if (status === "loading" || isPopulating) return "Searching";
    else if (status === "error") return "Failed to find servers";
    else if (isEmpty) return "No servers were found!";
    else if (status === "success") return "";
};

export const Servers = ({
    label,
    servers,
    status,
    collapsed,
}: {
    label: string;
    servers: ServersState[];
    status: QueryStatus;
    collapsed: boolean;
}) => {
    const [isPopulating] = useDebounceEmptySuccess(status, servers);
    const isEmpty = !(status === "success" && servers.length);
    const statusLabel = getStatusLabel(status, isPopulating, isEmpty);
    const isLoading = status === "loading" || isPopulating;

    if (status === "error" || status === "loading" || isPopulating || isEmpty) {
        return (
            <WithLabel
                label={label}
                statusLabel={statusLabel}
                showLoader={isLoading}
                collapsed={collapsed}
            />
        );
    } else {
        return (
            <WithLabel
                label={label}
                statusLabel={statusLabel}
                showLoader={isLoading}
                collapsed={collapsed}
            >
                <MantineList
                    py="xs"
                    px={0}
                    center
                    styles={(theme) => ({
                        item: {
                            "&:not(:first-of-type)": {
                                marginTop: `calc(${theme.spacing.xs} / 1.5)`,
                            },
                        },
                        itemIcon: {
                            marginRight: `calc(${theme.spacing.xs} / 1.5)`,
                        },
                    })}
                    style={{
                        transform: "translateX(-34.64px)",
                    }}
                >
                    {servers.map(({ url, ping, online }) => (
                        <MantineList.Item
                            key={url}
                            icon={
                                <ThemeIcon
                                    color={online ? (ping > 150 ? "orange" : "teal") : "red"}
                                    size={28}
                                    radius="xl"
                                    fz="sm"
                                >
                                    {online
                                        ? ping ?? <Loader variant="oval" color="white" size="sm" />
                                        : ""}
                                </ThemeIcon>
                            }
                        >
                            <Chip value={url} color="cyan" size="sm">
                                {url}
                            </Chip>
                        </MantineList.Item>
                    ))}
                </MantineList>
            </WithLabel>
        );
    }
};
