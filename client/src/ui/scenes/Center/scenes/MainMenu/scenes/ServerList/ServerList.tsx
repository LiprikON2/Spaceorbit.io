import React, { useLayoutEffect } from "react";
import { Chip, Stack } from "@mantine/core";
import { BuildingCommunity, World } from "tabler-icons-react";

import { useLocalServers, useOfficialServers } from "./hooks/hooks";
import { useGame } from "~/ui/hooks";
import { Servers } from "./components/Servers";

export const ServerList = ({ collapsed }) => {
    const [officialServers, officialServersStatus, officialServersFetching] = useOfficialServers();
    const [localServers, localServersStatus, addLocalServer] = useLocalServers();

    const { selectedServer, setSelectedServer } = useGame();

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
                    collapsed={collapsed}
                    label="Official Servers"
                    servers={officialServers}
                    status={officialServersStatus}
                    isFetching={officialServersFetching}
                    IconComponent={World}
                />
                <Servers
                    collapsed={collapsed}
                    label="Local Servers"
                    servers={localServers}
                    status={localServersStatus}
                    isFetching={false}
                    IconComponent={BuildingCommunity}
                    addServer={addLocalServer}
                />
            </Stack>
        </Chip.Group>
    );
};
