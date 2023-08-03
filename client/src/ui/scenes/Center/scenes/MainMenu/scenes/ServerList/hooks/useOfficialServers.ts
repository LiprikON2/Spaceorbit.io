import { useSetState } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getFromBackend, netlifyUrl } from "~/ui/services/api";

const getServers = async () => await getFromBackend(`${netlifyUrl}/.netlify/functions/servers`);

export interface ServersState {
    [key: string]: {
        ping: number | null;
        online: boolean;
    };
}

export const useOfficialServers = () => {
    const useNetlify = useQuery(["servers"], getServers, {
        // select: ({ json }) => json.servers,
        select: ({ json }) => ["test", "another"],
        useErrorBoundary: false,
        retry: false,
        staleTime: 10000,
        keepPreviousData: true,
    });

    const [servers, setServers] = useSetState<ServersState>({});

    const serverList = useNetlify.data;

    useEffect(() => {
        if (useNetlify.status === "success" && serverList.length) {
            setServers((current) => {
                let updatedServers = { ...current };

                const wentOfflineList = Object.keys(current).filter(
                    (key) => !serverList.includes(key)
                );
                wentOfflineList.forEach(
                    (serverKey) => (updatedServers[serverKey] = { ping: null, online: false })
                );
                const newServerList = serverList.filter(
                    (serverKey) => !wentOfflineList.includes(serverKey)
                );
                newServerList.forEach(
                    (serverKey) => (updatedServers[serverKey] = { ping: null, online: true })
                );

                return updatedServers;
            });
        }
    }, [serverList]);

    return [servers, useNetlify.status] as [ServersState, typeof useNetlify.status];
};
