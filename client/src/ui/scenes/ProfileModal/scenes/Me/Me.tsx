import React, { useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";

import { game } from "~/game";
import { NonFieldErrors } from "../../components";
import { useSaveMutation } from "./hooks";

export const Me = ({ me, meStatus, handleLogout }) => {
    const [accessToken, setAccessToken] = useSessionStorage({
        key: "accessToken",
        defaultValue: "",
    });

    const handleSave = () => {
        const player = game.getPlayer();
        if (player && accessToken) {
            const { x, y } = player;
            save(me.id, { x, y }, accessToken);
        }
    };
    const handleLoad = () => {
        const player = game.getPlayer();

        if (player) {
            player.respawn(me.x, me.y);
            player.followText.setText(me.username);
        }
    };
    const [nonFieldErrors, setNonFieldErrors] = useState("");

    const save = useSaveMutation(setNonFieldErrors);

    return (
        <Stack>
            <NonFieldErrors errors={nonFieldErrors} />
            {meStatus === "success" ? (
                <>
                    <Text>Username: {me.username}</Text>
                    <Text>Email: {me.email}</Text>
                    <Text>Map: {me.map}</Text>
                    <Text>
                        Location: {me.x} {me.y}
                    </Text>
                </>
            ) : (
                "Loading..."
            )}
            <Group>
                <Button onClick={handleSave}>Save</Button>
                <Button onClick={handleLoad}>Load</Button>
                <Button onClick={handleLogout}>Log Out</Button>
            </Group>
        </Stack>
    );
};
