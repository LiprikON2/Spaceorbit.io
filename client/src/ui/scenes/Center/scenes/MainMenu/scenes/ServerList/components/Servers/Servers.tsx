import React from "react";
import { Alert, Center, Chip, List, Loader, Space, ThemeIcon } from "@mantine/core";
import type { QueryStatus } from "@tanstack/react-query";
import { World } from "tabler-icons-react";

import { ServersState } from "../../hooks/useOfficialServers";
import { useDebounceEmptySuccess } from "./hooks/useDebounceEmptySuccess";
import { WithLabel } from "./components";

const getLabel = (label, status, isPopulating, isEmpty) => {
    if (status === "loading" || isPopulating) {
        return (
            <>
                <Center>
                    <World size={18} strokeWidth={1.5} color="white" />
                </Center>
                <Space w="0.25rem" />
                {`${label} ― Searching`}
                <Space w="xs" />
                <Loader />
            </>
            // <>
            //     <Alert
            //         icon={<World size={18} strokeWidth={1.5} color="white" />}
            //         title="Official Servers!"
            //         color="gray"
            //         w="100%"
            //     >
            //         No servers for you
            //     </Alert>
            // </>
        );
    } else if (status === "error") {
        return (
            <>
                <Center>
                    <World size={18} strokeWidth={1.5} color="white" />
                </Center>
                <Space w="0.25rem" />
                {`${label} ― Failed to find servers`}
            </>
        );
    } else if (isEmpty) {
        return (
            <>
                <Center>
                    <World size={18} strokeWidth={1.5} color="white" />
                </Center>
                <Space w="0.25rem" />
                {`${label} ― No servers were found!`}
            </>
        );
    } else if (status === "success") {
        return (
            <>
                <Center>
                    <World size={18} strokeWidth={1.5} color="white" />
                </Center>
                <Space w="0.25rem" />
                {label}
            </>
        );
    }
};

const Label = ({ label, status, isPopulating, isEmpty }) => {
    return <></>;
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
                    {servers.map(({ url, ping, online }) => (
                        <List.Item
                            key={url}
                            icon={
                                <ThemeIcon
                                    color={online ? (ping > 150 ? "orange" : "teal") : "red"}
                                    size={32}
                                    radius="xl"
                                >
                                    {online
                                        ? ping ?? <Loader variant="oval" color="white" size="sm" />
                                        : ""}
                                </ThemeIcon>
                            }
                        >
                            <Chip value={url} color="cyan" size="md">
                                {url}
                            </Chip>
                        </List.Item>
                    ))}
                </List>
            </WithLabel>
        );
    }
};
