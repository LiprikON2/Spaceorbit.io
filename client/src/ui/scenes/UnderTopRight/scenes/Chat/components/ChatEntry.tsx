import React from "react";
import { Box, Group, Paper, ScrollArea, Stack, Textarea, Title, Text } from "@mantine/core";

export const ChatEntry = ({ name, message, localTime }) => {
    return (
        <Paper style={{ display: "inline" }} px="xs" py="0.25rem" withBorder={false} shadow="unset">
            <Text c="dimmed" style={{ display: "inline" }}>
                {`[${localTime}] `}
            </Text>
            <Text style={{ display: "inline" }}>{`${name}: `}</Text>
            <Text
                style={{
                    display: "inline",
                    overflowWrap: "break-word",
                    wordBreak: "break-all",
                }}
                weight="lighter"
            >
                {message}
            </Text>
        </Paper>
    );
};
