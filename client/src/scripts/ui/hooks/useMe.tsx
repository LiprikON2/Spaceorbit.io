import { useQuery } from "@tanstack/react-query";
import { FetchError, getFromBackend } from "../../backend/api";
import { useDidUpdate, useSessionStorage } from "@mantine/hooks";
import { useRefreshToken } from ".";

const getMe = async (accessToken) => await getFromBackend(["users", "me"], accessToken);

const useMe = (accessTokenKey = "accessToken", refreshTokenKey = "refreshToken") => {
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

    const useMe = useQuery(["user"], () => getMe(accessToken), {
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
        useMe.remove();
        reset();
    };

    return {
        me: useMe.data,
        meStatus: useMe.status,
        isLoggedIn,
        logout,
    };
};

export default useMe;
