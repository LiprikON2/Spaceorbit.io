import React from "react";
import { Progress, Title, Text, Group, Loader, Paper, Stack } from "@mantine/core";

import { useGameLoading } from "./hooks";
import { Button } from "~/ui/components";
import { useGame } from "~/ui/hooks";

export const Loading = () => {
    const { loadMainMenu } = useGame();
    const { status, error } = useGameLoading();

    return (
        <Paper>
            <Stack spacing="md">
                <Title order={2}>Loading...</Title>
                <Progress value={status.progress} color={error ? "red" : undefined} />
                {!error ? (
                    <Group position="center">
                        <Loader />
                        <Text c="dimmed">{status.name}</Text>
                    </Group>
                ) : (
                    <Group position="apart">
                        <Text c="red">{error.message}</Text>
                        <Button compact onClick={loadMainMenu}>
                            Go back
                        </Button>
                    </Group>
                )}
            </Stack>
        </Paper>
    );
};
