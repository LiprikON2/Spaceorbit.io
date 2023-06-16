import React from "react";
import { Button, Stack, Text } from "@mantine/core";

const Profile = ({ me, meStatus, handleLogout }) => {
    return (
        <Stack>
            {meStatus === "success" ? (
                <>
                    <Text>Username: {me.username}</Text>
                    <Text>Email: {me.email}</Text>
                    <Text>Map: {me.map}</Text>
                </>
            ) : (
                "Loading..."
            )}

            <Button onClick={handleLogout}>Log Out</Button>
        </Stack>
    );
};

export default Profile;
