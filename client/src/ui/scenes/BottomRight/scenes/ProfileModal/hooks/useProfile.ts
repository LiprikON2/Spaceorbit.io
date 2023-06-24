import { useQuery } from "@tanstack/react-query";
import { useDidUpdate, useSessionStorage } from "@mantine/hooks";

import { FetchError, getFromBackend } from "~/ui/services/api";
import { useRefreshToken } from "../scenes/Me/hooks";

const getProfile = async (accessToken) => await getFromBackend(["users", "me"], accessToken);

export const useProfile = (accessTokenKey = "accessToken", refreshTokenKey = "refreshToken") => {
    const [accessToken, setAccessToken] = useSessionStorage({
        key: accessTokenKey,
        defaultValue: "",
    });
    const [refreshToken, setRefreshToken] = useSessionStorage({
        key: refreshTokenKey,
        defaultValue: "",
    });

    const isLoggedIn = !!accessToken;
    const accessExpired = !accessToken && !!refreshToken;

    const useProfile = useQuery(["user"], () => getProfile(accessToken), {
        select: ({ json }) => json,
        useErrorBoundary: false,
        enabled: isLoggedIn && !accessExpired,
        retry: false,
        onError: (error: FetchError) => {
            if (error.res.status === 401) {
                // Expire access token
                setAccessToken("");
                console.log("New token required...");
            } else if (error.res.status === 403) {
                console.log("Wrong credentials...");
                logout();
            }
        },
    });

    const { newAccessToken, newRefreshToken, didRefresh, reset } = useRefreshToken(
        refreshToken,
        accessExpired
    );

    useDidUpdate(() => {
        if (didRefresh) {
            console.log("Tokens refreshed");
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);
            reset();
        }
    }, [didRefresh]);

    const logout = () => {
        setAccessToken("");
        setRefreshToken("");
        useProfile.remove();
        reset();
    };

    return {
        me: useProfile.data,
        meStatus: useProfile.status,
        isLoggedIn,
        logout,
    };
};
