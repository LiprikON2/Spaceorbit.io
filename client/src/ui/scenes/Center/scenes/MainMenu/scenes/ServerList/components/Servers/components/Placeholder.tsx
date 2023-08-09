import React from "react";
import { Group, Space, Text, Loader } from "@mantine/core";

export const Placeholder = ({ label = "", size = 28, loading = false }) => {
    return (
        <Group>
            <Space h={size} w={size} />
            {label && (
                <Text c="dimmed" fw={300} italic lts="0.1rem">
                    {label}
                </Text>
            )}
            {loading && <Loader />}
        </Group>
    );
};
