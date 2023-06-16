import { useIsMutating, useMutation } from "@tanstack/react-query";
import { postToBackend } from "../../backend/api";
import { useSessionStorage } from "@mantine/hooks";

const signUp = async (body) => await postToBackend(["users", "register"] as any, "POST", body);

const useSignUpMutation = (queryClient, setErrors) => {
    const [accessToken, setAccessToken] = useSessionStorage({
        key: "accessToken",
        defaultValue: "",
    });
    const [refreshToken, setRefreshToken] = useSessionStorage({
        key: "refreshToken",
        defaultValue: "",
    });

    const signUpMutation = useMutation(signUp as any, {
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
            signUpMutation.mutate(fields);
        }
    };

    return handleSignUp;
};

export default useSignUpMutation;
