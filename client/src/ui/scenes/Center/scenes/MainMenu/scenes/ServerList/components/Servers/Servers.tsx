import React, { useState } from "react";
import {
    Chip,
    Loader,
    ThemeIcon,
    Paper,
    Group,
    Space,
    Text,
    TextInput,
    FocusTrap,
} from "@mantine/core";
import type { QueryStatus } from "@tanstack/react-query";

import type { ServersState } from "../../hooks";
import { List } from "./components";
import { Plus, type Icon } from "tabler-icons-react";
import { Button } from "~/ui/components";
import { useClickOutside } from "@mantine/hooks";

const getStatusLabel = (status, isEmpty) => {
    if (status === "loading") return "Retrieving";
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
    addServer = null,
}: {
    collapsed: boolean;
    label: string;
    servers: ServersState[];
    status: QueryStatus;
    isFetching: boolean;
    IconComponent: Icon;
    addServer?: (serverIp: string) => void;
}) => {
    const isEmpty = !(status === "success" && servers.length);
    const statusLabel = getStatusLabel(status, isEmpty);
    const isLoading = status === "loading";

    const conditionalLoader =
        isFetching && status !== "loading" ? <Loader size={iconSize} variant="oval" /> : null;

    const [showInput, setShowInput] = useState(false);
    const conditionalAddButton =
        addServer && !showInput ? (
            <Button isSquare h={iconSize} style={{ border: 0 }} onClick={() => setShowInput(true)}>
                <Plus size={iconSize} strokeWidth={1.25} color="white" />
            </Button>
        ) : null;

    const ref = useClickOutside(() => {
        console.log("CLICK");
        setShowInput(false);
    });
    const conditionalInput = showInput ? (
        <Group ref={ref}>
            <Space h={iconSize} w={iconSize} />
            <FocusTrap active={true}>
                <TextInput data-autofocus placeholder="127.0.0.1:3010" />
            </FocusTrap>
        </Group>
    ) : null;

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
                right={addServer ? conditionalAddButton : conditionalLoader}
                placeholder={
                    <Group>
                        <Space h={iconSize} w={iconSize} />
                        {statusLabel && <Text c="dimmed">{statusLabel}</Text>}
                        {isLoading && <Loader />}
                    </Group>
                }
                bottom={conditionalInput}
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
