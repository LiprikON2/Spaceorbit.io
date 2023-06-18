import { useIsMutating, useMutation } from "@tanstack/react-query";
import { useSessionStorage } from "@mantine/hooks";

import { postToBackend } from "~/ui/services/api";

const signUp = async (body) => await postToBackend(["users", "register"] as any, "POST", body);

export const useRegisterMutation = (queryClient, setErrors) => {
    const [accessToken, setAccessToken] = useSessionStorage({
        key: "accessToken",
        defaultValue: "",
    });
    const [refreshToken, setRefreshToken] = useSessionStorage({
        key: "refreshToken",
        defaultValue: "",
    });

    const useRegisterMutation = useMutation(signUp as any, {
        onSuccess: ({ json, ok }) => {
            if (ok) {
                queryClient.invalidateQueries("users");
                const { accessToken, refreshToken } = json;
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
                setErrors([]);
            } else {
                setErrors([json.message]);
            }
        },
        onError: (error) => {
            setErrors(["Unable to reach the server"]);
        },

        useErrorBoundary: false,
        retry: 0,
    });

    const isUserMutating = useIsMutating("user" as any);

    const handleSignUp = (fields) => {
        if (!isUserMutating) {
            useRegisterMutation.mutate(fields);
        }
    };

    return handleSignUp;
};
