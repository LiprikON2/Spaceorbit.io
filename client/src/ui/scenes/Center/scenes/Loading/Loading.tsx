import React from "react";
import { Progress, Title, Text, Group, Loader, Paper, Stack, Center } from "@mantine/core";

import { useGameLoading } from "./hooks";

export const Loading = () => {
    const { status } = useGameLoading();

    return (
        <Paper>
            <Stack>
                <Title order={2}>Loading...</Title>
                <Progress value={status.progress} />
                <Group position="center">
                    <Loader />
                    <Text c="dimmed">{status.name}</Text>
                </Group>
            </Stack>
        </Paper>
    );
};
