import React from "react";
import { Progress, Title, Text, Group, Loader } from "@mantine/core";

import { useGameLoading } from "./hooks";

export const Loading = () => {
    const { status } = useGameLoading();

    return (
        <>
            <Title order={3}>Loading...</Title>
            <Progress value={status.progress} />
            <Group>
                <Loader />
                <Text c="dimmed">{status.name}</Text>
            </Group>
        </>
    );
};
