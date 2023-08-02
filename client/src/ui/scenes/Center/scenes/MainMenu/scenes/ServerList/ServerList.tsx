import React, { useLayoutEffect } from "react";
import { Chip, Stack } from "@mantine/core";

// TODO move hook
import { useNetlify } from "../../hooks";
import { Servers } from "./components";
import { useGame } from "~/ui/hooks";

export const ServerList = () => {
    const [officialServers, officialServersStatus] = useNetlify();
    const { selectedServer, setSelectedServer } = useGame();
    const localServers = [];

    useLayoutEffect(() => {
        if (!selectedServer) {
            if (officialServersStatus === "success" && officialServers.length) {
                setSelectedServer(officialServers[0]);
            }
        }
    }, [officialServers]);

    return (
        <Chip.Group multiple={false} value={selectedServer} onChange={setSelectedServer}>
            <Stack sx={(theme) => ({ gap: `calc(${theme.spacing.xs} / 1.5)` })}>
                <Servers
                    label="Official Servers"
                    servers={officialServers}
                    status={officialServersStatus}
                ></Servers>
                <Servers label="Local Servers" servers={localServers} status="loading"></Servers>
            </Stack>
        </Chip.Group>
    );
};
