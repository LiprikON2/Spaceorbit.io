import { useQueries, useQuery } from "@tanstack/react-query";

import { getFromBackend, netlifyUrl, pingBackend } from "~/ui/services/api";

export interface ServersState {
    url: string;
    ping: number | null;
    online: boolean;
    name?: string;
}

const getServers = async () => await getFromBackend(`${netlifyUrl}/.netlify/functions/servers`);

export const useOfficialServers = () => {
    const useServers = useQuery(["servers"], getServers, {
        select: ({ json }) => json.servers,
        // select: ({ json }) => ["test", "another"],
        refetchInterval: 5000,
        retry: true,
        useErrorBoundary: false,

        keepPreviousData: true,
    });

    const serverList: string[] = useServers.data ?? [];

    const useServerPings = useQueries({
        queries: serverList.map((serverKey) => {
            return {
                select: (data) => data as ServersState,
                queryKey: ["servers", serverKey],
                queryFn: () => pingBackend(serverKey),
                refetchInterval: 1500,
                keepPreviousData: false,
                retry: true,
                useErrorBoundary: false,
                retryDelay: (attempt) =>
                    Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
            };
        }),
    });
    const serverStateList = useServerPings
        .map((q) => q.data)
        .filter((serverState) => !!serverState);

    return [serverStateList, useServers.status, useServers.isFetching] as [
        ServersState[],
        typeof useServers.status,
        boolean
    ];
};
