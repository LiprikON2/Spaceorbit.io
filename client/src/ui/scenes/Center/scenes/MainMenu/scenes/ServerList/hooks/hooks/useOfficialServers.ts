import { useQuery } from "@tanstack/react-query";

import { getFromBackend, netlifyUrl } from "~/ui/services/api";
import { useServerPings, type ServersState } from "..";

const getServers = async () => await getFromBackend(`${netlifyUrl}/.netlify/functions/servers`);

export const useOfficialServers = () => {
    const useServers = useQuery(["servers"], getServers, {
        select: ({ json }) => json.servers,
        // select: ({ json }) => [],
        refetchInterval: 5000,
        retry: true,
        useErrorBoundary: false,

        keepPreviousData: true,
    });

    const serverList: string[] = useServers.data ?? [];

    const [serverStateList, serverStateStatus] = useServerPings(serverList);

    let status: typeof useServers.status;
    if (useServers.status === "success") {
        if (serverStateList.length === 0) {
            status = serverStateStatus;
        } else status = useServers.status;
    } else status = useServers.status;

    return [serverStateList, status, useServers.isFetching] as [
        ServersState[],
        typeof useServers.status,
        boolean
    ];
};
