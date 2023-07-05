import React, { useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";

import { Errors } from "~/ui/components";
import { useSaveMutation } from "./hooks";
import { useProfile } from "../../hooks";
import { useGame } from "~/ui/hooks";

export const Me = ({ onLogout }) => {
    const { me, meStatus } = useProfile();
    const {
        computed: { isLoaded, player },
    } = useGame();

    const [accessToken, setAccessToken] = useSessionStorage({
        key: "accessToken",
        defaultValue: "",
    });

    const handleSave = () => {
        if (isLoaded && accessToken) {
            const { x, y } = player;
            save(me.id, { x, y }, accessToken);
        }
    };
    const handleLoad = () => {
        if (isLoaded) {
            player.respawn(me.x, me.y);
            player.followText.setText(me.username);
        }
    };
    const [nonFieldErrors, setNonFieldErrors] = useState("");

    const save = useSaveMutation(setNonFieldErrors);
    return (
        <Stack>
            <Errors errors={nonFieldErrors} />
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
                <Button onClick={onLogout}>Log Out</Button>
            </Group>
        </Stack>
    );
};
