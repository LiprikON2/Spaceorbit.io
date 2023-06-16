import React from "react";
import { Button, Group, Stack, Text } from "@mantine/core";

const Profile = ({ me, meStatus, handleLogout }) => {
    // TODO
    const handleSave = () => {};
    const handleLoad = () => {};
    return (
        <Stack>
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

export default Profile;
