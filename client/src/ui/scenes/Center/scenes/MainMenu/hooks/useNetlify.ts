import { useQuery } from "@tanstack/react-query";

import { getFromBackend } from "~/ui/services/api";

const getServers = async () =>
    await getFromBackend(`${window.location.origin}/.netlify/functions/ngrok`);

export const useNetlify = () => {
    const useNetlify = useQuery(["servers"], getServers, {
        select: ({ json }) => json.servers,
        useErrorBoundary: false,
        retry: false,
        // onError: (error: FetchError) => {
        //     if (error.res.status === 401) {
        //         // Expire access token
        //         setAccessToken("");
        //         console.log("New token required...");
        //     } else if (error.res.status === 403) {
        //         console.log("Wrong credentials...");
        //         logout();
        //     }
        // },
    });

    return [useNetlify.data, useNetlify.status];
};
