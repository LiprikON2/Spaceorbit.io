import React, { useLayoutEffect } from "react";
import { Chip, Stack } from "@mantine/core";

import { useOfficialServers } from "./hooks";
import { useGame } from "~/ui/hooks";
import { Servers } from "./components/Servers";

export const ServerList = ({ collapsed }) => {
    const [officialServers, officialServersStatus] = useOfficialServers();
    const { selectedServer, setSelectedServer } = useGame();
    const localServers = [];

    const servers = [...officialServers, ...localServers];

    useLayoutEffect(() => {
        if (!selectedServer) {
            if (officialServersStatus === "success" && officialServers.length) {
                setSelectedServer(officialServers[0].url);
            } else if (localServers.length) {
                setSelectedServer(localServers[0].url);
            }
        } else {
            const serverNoLongerInList = !servers.find((server) => server.url === selectedServer);
            if (serverNoLongerInList) setSelectedServer(null);
        }
    }, [officialServers]);

    return (
        <Chip.Group multiple={false} value={selectedServer} onChange={setSelectedServer}>
            <Stack spacing="xs">
                <Servers
                    label="Official Servers"
                    servers={officialServers}
                    status={officialServersStatus}
                    collapsed={collapsed}
                />
                <Servers
                    label="Local Servers"
                    servers={localServers}
                    status="loading"
                    collapsed={collapsed}
                />
            </Stack>
        </Chip.Group>
    );
};
