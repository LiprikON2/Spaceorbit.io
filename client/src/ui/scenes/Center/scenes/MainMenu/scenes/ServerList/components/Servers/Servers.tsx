import React from "react";
import { Chip, Loader, ThemeIcon, Paper, Group, Space, Text } from "@mantine/core";
import type { QueryStatus } from "@tanstack/react-query";

import { ServersState } from "../../hooks/useOfficialServers";
import { useDebounceEmptySuccess } from "./hooks/useDebounceEmptySuccess";
import { List } from "./components";
import type { Icon } from "tabler-icons-react";

const getStatusLabel = (status, isEmpty) => {
    if (status === "loading" || status === "success") return "Searching";
    else if (status === "error") return "Failed to find servers";
    else if (isEmpty) return "No servers were found!";
    else if (status === "success") return "";
};

const iconSize = 28;

export const Servers = ({
    collapsed,
    label,
    servers,
    status,
    isFetching,
    IconComponent,
}: {
    collapsed: boolean;
    label: string;
    servers: ServersState[];
    status: QueryStatus;
    isFetching: boolean;
    IconComponent: Icon;
}) => {
    const isEmpty = !(status === "success" && servers.length);
    const statusLabel = getStatusLabel(status, isEmpty);
    const isLoading = status === "loading" || status === "success";

    return (
        <Paper
            sx={(theme) => {
                const buttonStyles = theme.fn.variant({
                    color: "gray",
                    variant: "light",
                });
                return { ...buttonStyles };
            }}
            p="md"
            withBorder={false}
            style={{ overflow: "hidden" }}
        >
            <List
                title={label}
                py="xs"
                px={0}
                visible={!collapsed}
                icon={<IconComponent size={iconSize} strokeWidth={1.25} color="white" />}
                itemHeight={iconSize}
                showLoader={isFetching && status !== "loading"}
                placeholder={
                    <Group>
                        <Space h={iconSize} w={iconSize} />
                        {statusLabel && <Text c="dimmed">{statusLabel}</Text>}
                        {isLoading && <Loader />}
                    </Group>
                }
            >
                {servers.map(({ url, ping, online }, index) => (
                    <List.Item
                        visible={!collapsed}
                        key={url}
                        index={index}
                        icon={
                            <ThemeIcon
                                color={online ? (ping > 150 ? "orange" : "teal") : "red"}
                                size={iconSize}
                                radius="xl"
                                fz="sm"
                            >
                                {online
                                    ? Math.min(ping, 999) ?? (
                                          <Loader variant="oval" color="white" size="sm" />
                                      )
                                    : ""}
                            </ThemeIcon>
                        }
                    >
                        <Chip value={url} color="cyan" size="sm">
                            {url}
                        </Chip>
                    </List.Item>
                ))}
            </List>
        </Paper>
    );
};
