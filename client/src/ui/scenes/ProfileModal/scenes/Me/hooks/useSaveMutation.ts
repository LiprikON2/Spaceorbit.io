import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";

import { postToBackend } from "~/ui/services/api";

const save = async ([id, body, accessToken]) =>
    await postToBackend(["users", id] as any, "PATCH", body, accessToken);

export const useSaveMutation = (setErrros) => {
    const queryClient = useQueryClient();

    const logInMutation = useMutation(save as any, {
        onSuccess: ({ json, ok }) => {
            if (ok) {
                queryClient.invalidateQueries({ queryKey: ["me"] });
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

    const handleSave = (id, fields, accessToken) => {
        if (!isUserMutating) {
            // @ts-ignore
            logInMutation.mutate([id, fields, accessToken]);
        }
    };
    return handleSave;
};
