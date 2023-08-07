import { useQueries } from "@tanstack/react-query";

import { type ServersState, pingBackend } from "~/ui/services/api";

export const useServerPings = (serverList: string[] = [], removeOffline = false) => {
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
        .filter((serverState) => (removeOffline ? serverState?.online : !!serverState));

    const status = useServerPings?.[0]?.status ?? "success";

    return [serverStateList, status] as [ServersState[], "loading" | "error" | "success"];
};
