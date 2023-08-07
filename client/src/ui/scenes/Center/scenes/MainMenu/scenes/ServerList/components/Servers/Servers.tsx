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
    ActionIcon,
} from "@mantine/core";
import { getHotkeyHandler, useClickOutside } from "@mantine/hooks";
import type { QueryStatus } from "@tanstack/react-query";

import { List, Placeholder } from "./components";
import { Plus, type Icon, ArrowUpRight, Trash } from "tabler-icons-react";
import { Button } from "~/ui/components";
import type { ServersState } from "~/ui/services/api";
import type { CustomServersHandler } from "../../hooks";

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
    customServersHandler = null,
}: {
    collapsed: boolean;
    label: string;
    servers: ServersState[];
    status: QueryStatus;
    isFetching: boolean;
    IconComponent: Icon;
    customServersHandler?: CustomServersHandler;
}) => {
    const isEmpty = !(status === "success" && servers.length);
    const statusLabel = getStatusLabel(status, isEmpty);
    const isLoading = status === "loading";

    const conditionalLoader =
        isFetching && status !== "loading" ? <Loader size={iconSize} variant="oval" /> : null;

    const [showInput, setShowInput] = useState(false);
    const conditionalAddButton =
        customServersHandler && !showInput ? (
            <Button isSquare h={iconSize} style={{ border: 0 }} onClick={() => setShowInput(true)}>
                <Plus size={iconSize} strokeWidth={1.25} color="white" />
            </Button>
        ) : null;

    const enterServer = () => {
        if (value.trim().length) {
            customServersHandler.add(value.trim());
            setShowInput(false);
            setValue("");
        }
    };

    const ref = useClickOutside(() => setShowInput(false));
    const [value, setValue] = useState("");
    const conditionalInput = showInput ? (
        <Group ref={ref}>
            <Space h={iconSize} w={iconSize} />
            <FocusTrap>
                <TextInput
                    value={value}
                    onChange={(e) => setValue(e.currentTarget.value)}
                    data-autofocus
                    placeholder="127.0.0.1:3010"
                    onKeyDown={getHotkeyHandler([["Enter", enterServer]])}
                />
            </FocusTrap>
            <ActionIcon size="lg" variant="light" onClick={enterServer}>
                <ArrowUpRight />
            </ActionIcon>
        </Group>
    ) : null;

    const conditionalInputPlaceholder = customServersHandler &&
        customServersHandler.status === "loading" && (
            <Placeholder label="Adding" size={iconSize} loading />
        );

    const conditionalBottom = (
        <>
            {conditionalInput}
            {conditionalInputPlaceholder}
        </>
    );

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
                right={customServersHandler ? conditionalAddButton : conditionalLoader}
                placeholder={
                    <Placeholder label={statusLabel} size={iconSize} loading={isLoading} />
                }
                bottom={conditionalBottom}
            >
                {servers.map(({ url, ping, online, removeable }, index) => (
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

                        {customServersHandler && removeable && (
                            <ActionIcon
                                color="red"
                                size="md"
                                variant="subtle"
                                onClick={() => customServersHandler.remove(url)}
                            >
                                <Trash size={16} strokeWidth={1.25} color="white" />
                            </ActionIcon>
                        )}
                    </List.Item>
                ))}
            </List>
        </Paper>
    );
};
