import { useListState, useSetState } from "@mantine/hooks";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getFromBackend, netlifyUrl, pingBackend } from "~/ui/services/api";

// export interface ServersState {
//     [key: string]: {
//         ping: number | null;
//         online: boolean;
//     };
// }
export interface ServersState {
    url: string;
    name: string;
    ping: number | null;
    online: boolean;
}

const getServers = async () => await getFromBackend(`${netlifyUrl}/.netlify/functions/servers`);

export const useOfficialServers = () => {
    const useServers = useQuery(["servers"], getServers, {
        select: ({ json }) => json.servers,
        useErrorBoundary: false,
        retry: true,
        refetchInterval: 5000,

        keepPreviousData: true,
    });

    const serverList: string[] = useServers.data ?? [];

    const useServerPings = useQueries({
        queries: serverList.map((serverKey) => {
            return {
                select: (data) => data as ServersState,
                queryKey: ["servers", serverKey],
                queryFn: () => pingBackend(serverKey),
                useErrorBoundary: false,
                retry: true,
                refetchInterval: 1500,
                keepPreviousData: false,
                retryDelay: (attempt) =>
                    Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
            };
        }),
    });
    const serverStateList = useServerPings
        .map((q) => q.data)
        .filter((serverState) => !!serverState);

    return [serverStateList, useServers.status] as [ServersState[], typeof useServers.status];
};
