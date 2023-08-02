import { useQuery } from "@tanstack/react-query";

import { getFromBackend, netlifyUrl } from "~/ui/services/api";

const getServers = async () => await getFromBackend(`${netlifyUrl}/.netlify/functions/ngrok`);

export const useNetlify = () => {
    const useNetlify = useQuery(["servers"], getServers, {
        // select: ({ json }) => json.servers,
        select: ({ json }) => ["test", "another"],
        useErrorBoundary: false,
        retry: false,
    });

    const netlify: [string[], typeof useNetlify.status] = [useNetlify.data, useNetlify.status];
    return netlify;
};
