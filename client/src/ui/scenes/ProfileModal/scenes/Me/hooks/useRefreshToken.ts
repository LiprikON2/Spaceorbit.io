import { useQuery } from "@tanstack/react-query";

import { postToBackend } from "~/ui/services/api";

const getRefreshToken = async (refreshToken, test) =>
    await postToBackend(["users", "refreshToken"] as any, "POST", { refreshToken });

export const useRefreshToken = (refreshToken, enabled) => {
    const useRefreshToken = useQuery(["user"], () => getRefreshToken(refreshToken, enabled), {
        select: ({ json }) => json,
        enabled: !!enabled,
    });

    return {
        newAccessToken: useRefreshToken.data?.accessToken ?? "",
        newRefreshToken: useRefreshToken.data?.refreshToken ?? "",
        didRefresh: useRefreshToken.data?.accessToken && useRefreshToken.isFetched,
        reset: useRefreshToken.remove,
    };
};
