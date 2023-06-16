import { useIsMutating, useMutation } from "@tanstack/react-query";
import React from "react";
import { postToBackend } from "../../backend/api";
import { useSessionStorage } from "@mantine/hooks";

const logIn = async (body) => await postToBackend(["users", "login"] as any, "POST", body);

const useLogInMutation = (queryClient, setErrros) => {
    const [accessToken, setAccessToken] = useSessionStorage({
        key: "accessToken",
        defaultValue: "",
    });
    const [refreshToken, setRefreshToken] = useSessionStorage({
        key: "refreshToken",
        defaultValue: "",
    });

    const logInMutation = useMutation(logIn as any, {
        onSuccess: ({ json, ok }) => {
            if (ok) {
                queryClient.invalidateQueries("users");
                const { accessToken, refreshToken } = json;
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
                setErrros([]);
            } else {
                setErrros([json.message]);
            }
        },
        onError: (error) => {
            setErrros(["Unable to reach the server"]);
        },

        useErrorBoundary: false,
        retry: 0,
    });

    const isUserMutating = useIsMutating("user" as any);

    const handleLogIn = (fields) => {
        if (!isUserMutating) {
            logInMutation.mutate(fields);
        }
    };

    return handleLogIn;
};

export default useLogInMutation;
